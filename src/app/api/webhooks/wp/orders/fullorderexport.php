<?php
/**
 * WooCommerce Order Export Script
 * Exports all orders to JSON format with batching support for large datasets
 * 
 * Usage:
 * - Run from browser: /api/webhooks/wp/orders/fullorderexport.php?batch=0&per_page=100
 * - Run from CLI: php fullorderexport.php batch=0 per_page=100
 * 
 * Parameters:
 * - batch: Batch number (0-based index)
 * - per_page: Number of orders per batch (default: 100, max: 500)
 * - output: 'json' (default) or 'file' to save to disk
 */

// Increase memory limit and execution time for large datasets
ini_set('memory_limit', '512M');
ini_set('max_execution_time', '300');

// Load WordPress
$wp_load_paths = [
    __DIR__ . '/../../../../../../../../../wp-load.php',
    __DIR__ . '/../../../../../../../../wp-load.php',
    __DIR__ . '/../../../../../../../wp-load.php',
    '/var/www/html/wp-load.php',
    dirname(__FILE__) . '/wp-load.php',
];

$wp_loaded = false;
foreach ($wp_load_paths as $path) {
    if (file_exists($path)) {
        require_once($path);
        $wp_loaded = true;
        break;
    }
}

if (!$wp_loaded) {
    die(json_encode(['error' => 'Could not load WordPress. Please adjust wp-load.php path.']));
}

global $wpdb;

// Get parameters
$batch = isset($_GET['batch']) ? intval($_GET['batch']) : (isset($argv[1]) ? intval(str_replace('batch=', '', $argv[1])) : 0);
$per_page = isset($_GET['per_page']) ? intval($_GET['per_page']) : (isset($argv[2]) ? intval(str_replace('per_page=', '', $argv[2])) : 100);
$output_type = isset($_GET['output']) ? $_GET['output'] : (isset($argv[3]) ? str_replace('output=', '', $argv[3]) : 'json');

// Validate and cap per_page
$per_page = max(1, min($per_page, 500));
$offset = $batch * $per_page;

/**
 * Get order meta data as associative array
 * Uses both wp_wc_orders_meta (HPOS) and wp_postmeta (legacy) for compatibility
 */
function get_order_meta_data($order_id) {
    global $wpdb;
    
    $meta_data = [];
    
    // Try HPOS table first (wp_wc_orders_meta)
    $meta_results = $wpdb->get_results($wpdb->prepare(
        "SELECT meta_key, meta_value FROM {$wpdb->prefix}wc_orders_meta WHERE order_id = %d",
        $order_id
    ));
    
    // If no results, fall back to postmeta (legacy)
    if (empty($meta_results)) {
        $meta_results = $wpdb->get_results($wpdb->prepare(
            "SELECT meta_key, meta_value FROM {$wpdb->prefix}postmeta WHERE post_id = %d",
            $order_id
        ));
    }
    
    foreach ($meta_results as $meta) {
        $value = maybe_unserialize($meta->meta_value);
        $meta_data[$meta->meta_key] = $value;
    }
    
    return $meta_data;
}

/**
 * Get order item meta data
 */
function get_order_item_meta_data($item_id) {
    global $wpdb;
    
    $meta_data = [];
    $meta_results = $wpdb->get_results($wpdb->prepare(
        "SELECT meta_key, meta_value FROM {$wpdb->prefix}woocommerce_order_itemmeta WHERE order_item_id = %d",
        $item_id
    ));
    
    foreach ($meta_results as $meta) {
        $value = maybe_unserialize($meta->meta_value);
        $meta_data[$meta->meta_key] = $value;
    }
    
    return $meta_data;
}

/**
 * Get order items (line items, shipping, fees, taxes, coupons)
 */
function get_order_items($order_id) {
    global $wpdb;
    
    $items = [];
    $item_results = $wpdb->get_results($wpdb->prepare(
        "SELECT order_item_id, order_item_name, order_item_type 
         FROM {$wpdb->prefix}woocommerce_order_items 
         WHERE order_id = %d
         ORDER BY order_item_id ASC",
        $order_id
    ));
    
    foreach ($item_results as $item) {
        $items[] = [
            'id' => intval($item->order_item_id),
            'name' => $item->order_item_name,
            'type' => $item->order_item_type,
            'order_id' => intval($order_id),
            'meta' => get_order_item_meta_data($item->order_item_id)
        ];
    }
    
    return $items;
}

/**
 * Get address data from wp_wc_order_addresses table (HPOS)
 */
function get_order_address($order_id, $type = 'billing') {
    global $wpdb;
    
    // Try HPOS address table first
    $address = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}wc_order_addresses 
         WHERE order_id = %d AND address_type = %s",
        $order_id,
        $type
    ));
    
    if ($address) {
        return [
            'first_name' => $address->first_name ?? '',
            'last_name' => $address->last_name ?? '',
            'company' => $address->company ?? '',
            'address_1' => $address->address_1 ?? '',
            'address_2' => $address->address_2 ?? '',
            'city' => $address->city ?? '',
            'state' => $address->state ?? '',
            'postcode' => $address->postcode ?? '',
            'country' => $address->country ?? '',
            'email' => $address->email ?? null,
            'phone' => $address->phone ?? null,
            'address_type' => $type
        ];
    }
    
    return [
        'first_name' => '',
        'last_name' => '',
        'company' => '',
        'address_1' => '',
        'address_2' => '',
        'city' => '',
        'state' => '',
        'postcode' => '',
        'country' => '',
        'email' => null,
        'phone' => null,
        'address_type' => $type
    ];
}

/**
 * Extract address from meta data (legacy fallback)
 */
function extract_address($meta_data, $type = 'billing') {
    $prefix = '_' . $type . '_';
    
    return [
        'first_name' => isset($meta_data[$prefix . 'first_name']) ? $meta_data[$prefix . 'first_name'] : '',
        'last_name' => isset($meta_data[$prefix . 'last_name']) ? $meta_data[$prefix . 'last_name'] : '',
        'company' => isset($meta_data[$prefix . 'company']) ? $meta_data[$prefix . 'company'] : '',
        'address_1' => isset($meta_data[$prefix . 'address_1']) ? $meta_data[$prefix . 'address_1'] : '',
        'address_2' => isset($meta_data[$prefix . 'address_2']) ? $meta_data[$prefix . 'address_2'] : '',
        'city' => isset($meta_data[$prefix . 'city']) ? $meta_data[$prefix . 'city'] : '',
        'state' => isset($meta_data[$prefix . 'state']) ? $meta_data[$prefix . 'state'] : '',
        'postcode' => isset($meta_data[$prefix . 'postcode']) ? $meta_data[$prefix . 'postcode'] : '',
        'country' => isset($meta_data[$prefix . 'country']) ? $meta_data[$prefix . 'country'] : '',
        'email' => isset($meta_data[$prefix . 'email']) ? $meta_data[$prefix . 'email'] : null,
        'phone' => isset($meta_data[$prefix . 'phone']) ? $meta_data[$prefix . 'phone'] : null,
        'address_type' => $type
    ];
}

/**
 * Format order data according to TypeScript interfaces
 * Supports both HPOS (wp_wc_orders) and legacy (wp_posts) formats
 */
function format_order($order, $meta_data) {
    // Determine if this is HPOS or legacy format
    $is_hpos = isset($order->type) && $order->type === 'shop_order';
    
    if ($is_hpos) {
        // HPOS format (wp_wc_orders table)
        return [
            'id' => intval($order->id),
            'parent_id' => intval($order->parent_order_id ?? 0),
            'status' => $order->status,
            'tax_amount' => floatval($order->tax_amount ?? 0),
            'total_amount' => floatval($order->total_amount ?? 0),
            'customer_id' => intval($order->customer_id ?? 0),
            'billing_email' => $order->billing_email ?? '',
            'date_created_gmt' => $order->date_created_gmt,
            'date_updated_gmt' => $order->date_updated_gmt,
            'payment_method' => $order->payment_method ?? '',
            'transaction_id' => $order->transaction_id ?? '',
            'customer_note' => $order->customer_note ?? '',
            'line_items' => get_order_items($order->id),
            'billing' => get_order_address($order->id, 'billing'),
            'shipping' => get_order_address($order->id, 'shipping'),
            'meta_data' => $meta_data
        ];
    } else {
        // Legacy format (wp_posts table)
        return [
            'id' => intval($order->ID),
            'parent_id' => intval($order->post_parent ?? 0),
            'status' => $order->post_status,
            'tax_amount' => floatval($meta_data['_order_tax'] ?? 0),
            'total_amount' => floatval($meta_data['_order_total'] ?? 0),
            'customer_id' => intval($order->post_author ?? 0),
            'billing_email' => $meta_data['_billing_email'] ?? '',
            'date_created_gmt' => $order->post_date_gmt,
            'date_updated_gmt' => $order->post_modified_gmt,
            'payment_method' => $meta_data['_payment_method'] ?? '',
            'transaction_id' => $meta_data['_transaction_id'] ?? '',
            'customer_note' => $order->post_excerpt ?? '',
            'line_items' => get_order_items($order->ID),
            'billing' => extract_address($meta_data, 'billing'),
            'shipping' => extract_address($meta_data, 'shipping'),
            'meta_data' => $meta_data
        ];
    }
}

// Detect which storage system is being used
$hpos_enabled = $wpdb->get_var(
    "SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = DATABASE() 
     AND table_name = '{$wpdb->prefix}wc_orders'"
) > 0;

if ($hpos_enabled) {
    // HPOS (High-Performance Order Storage) - wp_wc_orders table
    $total_orders = $wpdb->get_var(
        "SELECT COUNT(*) FROM {$wpdb->prefix}wc_orders WHERE type = 'shop_order'"
    );
    
    $orders = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}wc_orders 
         WHERE type = 'shop_order' 
         ORDER BY id ASC 
         LIMIT %d OFFSET %d",
        $per_page,
        $offset
    ));
} else {
    // Legacy - wp_posts table
    $total_orders = $wpdb->get_var(
        "SELECT COUNT(*) FROM {$wpdb->prefix}posts WHERE post_type = 'shop_order'"
    );
    
    $orders = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}posts 
         WHERE post_type = 'shop_order' 
         ORDER BY ID ASC 
         LIMIT %d OFFSET %d",
        $per_page,
        $offset
    ));
}

$result = [];
$processed = 0;

foreach ($orders as $order) {
    $order_id = $hpos_enabled ? $order->id : $order->ID;
    $meta_data = get_order_meta_data($order_id);
    $result[] = format_order($order, $meta_data);
    $processed++;
}

// Calculate batch information
$total_batches = ceil($total_orders / $per_page);
$has_more = ($batch + 1) < $total_batches;

$response = [
    'success' => true,
    'storage_type' => $hpos_enabled ? 'HPOS' : 'Legacy',
    'batch' => $batch,
    'per_page' => $per_page,
    'processed' => $processed,
    'total_orders' => intval($total_orders),
    'total_batches' => $total_batches,
    'has_more' => $has_more,
    'next_batch' => $has_more ? $batch + 1 : null,
    'orders' => $result,
    'memory_usage' => memory_get_peak_usage(true) / 1024 / 1024 . ' MB',
    'timestamp' => date('Y-m-d H:i:s')
];

// Output handling
if ($output_type === 'file') {
    $filename = sprintf(
        'orders_export_batch_%d_%s.json',
        $batch,
        date('Y-m-d_H-i-s')
    );
    $filepath = __DIR__ . '/exports/' . $filename;
    
    // Create exports directory if it doesn't exist
    if (!is_dir(__DIR__ . '/exports')) {
        mkdir(__DIR__ . '/exports', 0755, true);
    }
    
    file_put_contents($filepath, json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    echo json_encode([
        'success' => true,
        'message' => 'Export saved to file',
        'file' => $filename,
        'batch' => $batch,
        'total_batches' => $total_batches,
        'has_more' => $has_more
    ], JSON_PRETTY_PRINT);
} else {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

exit;

