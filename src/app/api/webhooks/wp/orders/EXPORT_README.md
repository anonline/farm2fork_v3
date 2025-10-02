# WooCommerce Order Export Scripts

Complete export solution for migrating 35,000+ WooCommerce orders to Next.js Farm2Fork v3.

**✅ Supports both HPOS and Legacy storage systems**

## Files

1. **fullorderexport.php** - Main export script with batching support (HPOS + Legacy compatible)
2. **run_full_export.php** - Automated batch runner that processes all orders
3. **EXPORT_README.md** - This file

## WooCommerce Storage Support

This script automatically detects and works with both:

### HPOS (High-Performance Order Storage) - Modern WooCommerce
- `wp_wc_orders` - Order data
- `wp_wc_orders_meta` - Order metadata
- `wp_wc_order_addresses` - Billing/shipping addresses
- `wp_woocommerce_order_items` - Line items
- `wp_woocommerce_order_itemmeta` - Item metadata

### Legacy Storage - Older WooCommerce
- `wp_posts` (post_type = 'shop_order')
- `wp_postmeta` - Order metadata
- `wp_woocommerce_order_items` - Line items
- `wp_woocommerce_order_itemmeta` - Item metadata

The script will automatically detect which system your WooCommerce installation uses and query the appropriate tables.

## Setup

1. Ensure the scripts are in the correct location on your WordPress server
2. The scripts will automatically try to locate `wp-load.php`
3. Create an `exports/` directory or let the script create it automatically

## Usage Options

### Option 1: Single Batch Export (Manual)

Export one batch at a time:

```bash
# Browser
https://yoursite.com/api/webhooks/wp/orders/fullorderexport.php?batch=0&per_page=100

# CLI
php fullorderexport.php batch=0 per_page=100
```

**Parameters:**
- `batch` - Batch number (0-based, default: 0)
- `per_page` - Orders per batch (default: 100, max: 500)
- `output` - 'json' (default) or 'file' to save to disk

**Response includes:**
- Current batch orders
- Total count and batch information
- Memory usage
- Whether more batches exist

### Option 2: Automated Full Export (Recommended)

Run all batches automatically:

```bash
# Browser
https://yoursite.com/api/webhooks/wp/orders/run_full_export.php?per_page=100&save_individual=1

# CLI
php run_full_export.php per_page=100
```

**Parameters:**
- `per_page` - Orders per batch (default: 100)
- `save_individual` - Save each batch separately (0 or 1)

**This will:**
- Process all batches automatically
- Show progress in real-time
- Save a combined `all_orders_[timestamp].json` file
- Optionally save individual batch files

### Option 3: Manual Batch Loop

For maximum control, loop through batches:

```bash
# Get first batch to determine total
curl "https://yoursite.com/api/webhooks/wp/orders/fullorderexport.php?batch=0&per_page=200" > batch_0.json

# Then loop through remaining batches
for i in {1..175}; do
  echo "Processing batch $i..."
  curl "https://yoursite.com/api/webhooks/wp/orders/fullorderexport.php?batch=$i&per_page=200" > "batch_$i.json"
  sleep 0.5
done
```

## Performance Recommendations

### For 35,000+ Orders:

1. **Batch Size:**
   - Small server: 50-100 orders per batch
   - Medium server: 100-200 orders per batch
   - Large server: 200-500 orders per batch

2. **Execution:**
   - Use CLI for best performance
   - Run during off-peak hours
   - Monitor server resources

3. **Expected Times:**
   - 100 orders/batch: ~350 batches, 15-30 minutes total
   - 200 orders/batch: ~175 batches, 10-20 minutes total
   - 500 orders/batch: ~70 batches, 5-15 minutes total

## Output Format

The export matches your TypeScript interfaces and includes storage type detection:

```json
{
  "success": true,
  "storage_type": "HPOS",
  "batch": 0,
  "per_page": 100,
  "processed": 100,
  "total_orders": 35420,
  "total_batches": 355,
  "has_more": true,
  "next_batch": 1,
  "orders": [
    {
      "id": 12345,
      "parent_id": 0,
      "status": "wc-completed",
      "tax_amount": 270.0,
      "total_amount": 1270.0,
      "customer_id": 123,
      "billing_email": "customer@example.com",
      "date_created_gmt": "2024-01-15 10:30:00",
      "date_updated_gmt": "2024-01-15 11:00:00",
      "payment_method": "cod",
      "transaction_id": "",
      "customer_note": "",
      "line_items": [...],
      "billing": {...},
      "shipping": {...},
      "meta_data": {...}
    }
  ],
  "memory_usage": "45.5 MB",
  "timestamp": "2025-10-02 14:30:00"
}
```

## Data Structure

Each order includes:

- **Core fields**: ID, status, amounts, dates, customer info
- **Line items**: Products with full metadata (quantities, prices, variations, etc.)
- **Addresses**: Separate billing and shipping addresses
- **Payment info**: Method, transaction ID
- **Meta data**: All WooCommerce meta fields (custom fields, plugin data, etc.)

### Order Item Types:
- `line_item` - Products
- `shipping` - Shipping methods
- `fee` - Additional fees
- `tax` - Tax information
- `coupon` - Discount codes

## Troubleshooting

### Memory Issues
```php
// Increase in fullorderexport.php
ini_set('memory_limit', '1024M');
```

### Timeout Issues
```php
// Increase in fullorderexport.php
ini_set('max_execution_time', '600');
```

### wp-load.php Not Found
Edit the `$wp_load_paths` array in `fullorderexport.php`:
```php
$wp_load_paths = [
    '/your/custom/path/wp-load.php',
    // ... existing paths
];
```

### Large Response Size
- Reduce `per_page` to 50 or less
- Use `output=file` parameter to save directly to disk
- Process during off-peak hours

## Import to Next.js

After export, you can import the data to your Farm2Fork v3 database:

```typescript
// Example import script
const exportData = require('./exports/all_orders_[timestamp].json');

for (const order of exportData.orders) {
  // Map WooCommerce order to your database schema
  await supabase.from('orders').insert({
    // ... transform data
  });
}
```

## Security Notes

⚠️ **Important:**
- These scripts expose order data - protect them!
- Use `.htaccess` to restrict access
- Delete scripts after migration
- Never commit with real data
- Consider IP whitelisting

### Recommended .htaccess:
```apache
<Files "fullorderexport.php">
  Order Deny,Allow
  Deny from all
  Allow from 127.0.0.1
  Allow from YOUR.IP.ADDRESS
</Files>

<Files "run_full_export.php">
  Order Deny,Allow
  Deny from all
  Allow from 127.0.0.1
  Allow from YOUR.IP.ADDRESS
</Files>
```

## Support

For issues or questions about the Farm2Fork v3 migration, refer to:
- Project README.md
- .github/copilot-instructions.md
- TypeScript interfaces in `/src/types/woocommerce/`
