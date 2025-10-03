#!/usr/bin/env python3
"""
WooCommerce Order Downloader
Downloads orders from the export API and saves each order as a separate JSON file.

Usage:
    python fullorderdownloader.py

Configuration:
    - BASE_URL: The URL of your export endpoint
    - PER_PAGE: Orders per batch (default: 100)
    - OUTPUT_DIR: Directory to save order files (default: ./orders)
"""

import os
import json
import time
import sys
import requests
from pathlib import Path
from datetime import datetime

# Configuration
BASE_URL = "https://farm2fork.hu/1002.php"
PER_PAGE = 100
INIT_BATCH = 251
OUTPUT_DIR = "./orders"
REQUEST_TIMEOUT = 30  # seconds
DELAY_BETWEEN_BATCHES = 2  # seconds

# Request headers - mimicking a real browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9,hu;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
}

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(message):
    """Print a header message"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{message}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}\n")

def print_success(message):
    """Print a success message"""
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")

def print_info(message):
    """Print an info message"""
    print(f"{Colors.OKCYAN}ℹ {message}{Colors.ENDC}")

def print_warning(message):
    """Print a warning message"""
    print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")

def print_error(message):
    """Print an error message"""
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")

def create_output_directory():
    """Create the output directory if it doesn't exist"""
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    print_success(f"Output directory ready: {OUTPUT_DIR}")

def fetch_batch(batch_number, per_page):
    """Fetch a single batch from the API"""
    url = f"{BASE_URL}?batch={batch_number}&per_page={per_page}"
    print_info(f"Fetching batch {batch_number} from: {url}")
    
    try:
        # Create a session to maintain cookies
        session = requests.Session()
        session.headers.update(HEADERS)
        
        response = session.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        response.raise_for_status()
        
        data = response.json()
        
        if not data.get('success'):
            raise Exception(f"API returned success=false: {data.get('error', 'Unknown error')}")
        
        return data
    
    except requests.exceptions.Timeout:
        print_error(f"Request timeout after {REQUEST_TIMEOUT} seconds")
        raise
    
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        raise
    
    except json.JSONDecodeError as e:
        print_error(f"Failed to parse JSON response: {str(e)}")
        raise

def save_order(order):
    """Save a single order to a JSON file"""
    order_id = order.get('id')
    
    if not order_id:
        print_warning("Order has no ID, skipping...")
        return False
    
    filename = f"{OUTPUT_DIR}/{order_id}.json"
    
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(order, f, indent=2, ensure_ascii=False)
        
        # Get file size for display
        file_size = os.path.getsize(filename)
        file_size_kb = file_size / 1024
        
        print_success(f"Saved order {order_id} → {filename} ({file_size_kb:.1f} KB)")
        return True
    
    except Exception as e:
        print_error(f"Failed to save order {order_id}: {str(e)}")
        raise

def download_orders():
    """Main function to download all orders"""
    start_time = time.time()
    
    print_header("WooCommerce Order Downloader")
    print_info(f"Base URL: {BASE_URL}")
    print_info(f"Per page: {PER_PAGE}")
    print_info(f"Output directory: {OUTPUT_DIR}")
    print_info(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    create_output_directory()
    
    batch = INIT_BATCH
    total_orders_saved = 0
    total_orders_expected = None
    storage_type = None
    
    try:
        while True:
            print_header(f"Processing Batch {batch}")
            
            # Fetch batch data
            data = fetch_batch(batch, PER_PAGE)
            
            # Extract batch information
            if storage_type is None:
                storage_type = data.get('storage_type', 'Unknown')
                print_info(f"Storage type: {storage_type}")
            
            if total_orders_expected is None:
                total_orders_expected = data.get('total_orders', 0)
                total_batches = data.get('total_batches', 0)
                print_info(f"Total orders to download: {total_orders_expected}")
                print_info(f"Total batches: {total_batches}")
            
            # Process orders in this batch
            orders = data.get('orders', [])
            processed = data.get('processed', len(orders))
            
            print_info(f"Orders in this batch: {processed}")
            
            if not orders:
                print_warning("No orders in this batch")
                break
            
            # Save each order
            for i, order in enumerate(orders, 1):
                order_id = order.get('id', 'unknown')
                print(f"\n  [{i}/{processed}] Processing order {order_id}...")
                
                if not save_order(order):
                    print_error(f"Failed to save order {order_id}")
                    sys.exit(1)
                
                total_orders_saved += 1
            
            # Show batch summary
            print(f"\n{Colors.OKGREEN}{Colors.BOLD}Batch {batch} complete:{Colors.ENDC}")
            print(f"  • Orders saved in this batch: {processed}")
            print(f"  • Total orders saved: {total_orders_saved}/{total_orders_expected}")
            print(f"  • Progress: {(total_orders_saved / total_orders_expected * 100):.1f}%")
            print(f"  • Memory usage: {data.get('memory_usage', 'N/A')}")
            
            # Check if there are more batches
            has_more = data.get('has_more', False)
            
            if not has_more:
                print_success("\nAll batches processed!")
                break
            
            # Prepare for next batch
            batch += 1
            next_batch = data.get('next_batch')
            
            if next_batch is not None and next_batch != batch:
                print_warning(f"Expected next batch {batch}, but API suggests {next_batch}")
                batch = next_batch
            
            # Small delay between batches
            print_info(f"Waiting {DELAY_BETWEEN_BATCHES}s before next batch...")
            time.sleep(DELAY_BETWEEN_BATCHES)
    
    except KeyboardInterrupt:
        print_error("\n\nDownload interrupted by user")
        sys.exit(1)
    
    except Exception as e:
        print_error(f"\n\nDownload failed: {str(e)}")
        sys.exit(1)
    
    # Final summary
    elapsed_time = time.time() - start_time
    minutes = int(elapsed_time // 60)
    seconds = int(elapsed_time % 60)
    
    print_header("Download Complete!")
    print_success(f"Total orders saved: {total_orders_saved}")
    print_success(f"Storage type: {storage_type}")
    print_success(f"Output directory: {OUTPUT_DIR}")
    print_success(f"Execution time: {minutes}m {seconds}s")
    print_success(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # List some example files
    print_info("\nSample order files:")
    order_files = sorted(Path(OUTPUT_DIR).glob('*.json'))[:5]
    for order_file in order_files:
        file_size = order_file.stat().st_size / 1024
        print(f"  • {order_file.name} ({file_size:.1f} KB)")
    
    if len(order_files) > 5:
        print(f"  ... and {len(order_files) - 5} more files")

if __name__ == "__main__":
    try:
        download_orders()
    except Exception as e:
        print_error(f"Fatal error: {str(e)}")
        sys.exit(1)
