<?php
/**
 * Batch Runner for WooCommerce Order Export
 * Automatically runs all batches and combines results
 * 
 * Usage:
 * - Browser: /api/webhooks/wp/orders/run_full_export.php?per_page=100&save_individual=1
 * - CLI: php run_full_export.php per_page=100
 */

ini_set('memory_limit', '1024M');
ini_set('max_execution_time', '0'); // No time limit
set_time_limit(0);

// Configuration
$per_page = isset($_GET['per_page']) ? intval($_GET['per_page']) : 100;
$save_individual_batches = isset($_GET['save_individual']) ? $_GET['save_individual'] === '1' : false;
$base_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . 
            "://$_SERVER[HTTP_HOST]" . 
            dirname($_SERVER['REQUEST_URI']) . '/fullorderexport.php';

$all_orders = [];
$batch = 0;
$start_time = time();

echo "Starting full export...\n";
echo "Per page: $per_page\n";
echo str_repeat("=", 50) . "\n\n";

while (true) {
    echo "Processing batch $batch...\n";
    
    // Build URL
    $url = $base_url . "?batch=$batch&per_page=$per_page&output=json";
    
    // Fetch batch data
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 120);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code !== 200 || !$response) {
        echo "Error fetching batch $batch. HTTP Code: $http_code\n";
        break;
    }
    
    $data = json_decode($response, true);
    
    if (!$data || !$data['success']) {
        echo "Error processing batch $batch\n";
        break;
    }
    
    echo "  - Processed: {$data['processed']} orders\n";
    echo "  - Memory: {$data['memory_usage']}\n";
    echo "  - Progress: " . ($batch + 1) . "/" . $data['total_batches'] . " batches\n";
    
    // Merge orders
    $all_orders = array_merge($all_orders, $data['orders']);
    
    // Save individual batch if requested
    if ($save_individual_batches) {
        $filename = sprintf('batch_%04d.json', $batch);
        $filepath = __DIR__ . '/exports/' . $filename;
        
        if (!is_dir(__DIR__ . '/exports')) {
            mkdir(__DIR__ . '/exports', 0755, true);
        }
        
        file_put_contents($filepath, json_encode($data['orders'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo "  - Saved: $filename\n";
    }
    
    echo "\n";
    
    // Check if there are more batches
    if (!$data['has_more']) {
        echo "All batches processed!\n";
        break;
    }
    
    $batch++;
    
    // Small delay to prevent server overload
    usleep(100000); // 0.1 seconds
}

// Save combined export
$export_filename = 'all_orders_' . date('Y-m-d_H-i-s') . '.json';
$export_filepath = __DIR__ . '/exports/' . $export_filename;

if (!is_dir(__DIR__ . '/exports')) {
    mkdir(__DIR__ . '/exports', 0755, true);
}

$final_export = [
    'success' => true,
    'total_orders' => count($all_orders),
    'export_date' => date('Y-m-d H:i:s'),
    'execution_time' => time() - $start_time . ' seconds',
    'orders' => $all_orders
];

file_put_contents($export_filepath, json_encode($final_export, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo str_repeat("=", 50) . "\n";
echo "Export Complete!\n";
echo "Total Orders: " . count($all_orders) . "\n";
echo "Execution Time: " . (time() - $start_time) . " seconds\n";
echo "File: $export_filename\n";
echo "Path: $export_filepath\n";
echo str_repeat("=", 50) . "\n";

// Return JSON response
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => true,
    'total_orders' => count($all_orders),
    'file' => $export_filename,
    'execution_time' => time() - $start_time,
    'message' => 'Export completed successfully'
], JSON_PRETTY_PRINT);
