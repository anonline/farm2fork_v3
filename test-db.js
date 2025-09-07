// Simple test to verify database connection and order retrieval
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jsbuijundrmmktxupzzh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzYnVpanVuZHJtbWt0eHVwenpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg0Nzk3OSwiZXhwIjoyMDY2NDIzOTc5fQ.3nOuKjQA-wvnjhKu2p4iN7CQaWVf4R6QSyB-b3W3aLk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrders() {
    console.log('Testing database connection...');
    
    // Test getting all orders
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*');
    
    if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return;
    }
    
    console.log('Orders found:', orders.length);
    orders.forEach(order => {
        console.log(`- ID: ${order.id}, Customer: ${order.customer_name}, Status: ${order.order_status}`);
    });
    
    // Test getting a specific order
    if (orders.length > 0) {
        const firstOrderId = orders[0].id;
        console.log(`\nTesting specific order: ${firstOrderId}`);
        
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', firstOrderId)
            .single();
        
        if (orderError) {
            console.error('Error fetching single order:', orderError);
        } else {
            console.log('Single order retrieved successfully:', order.customer_name);
        }
    }
}

testOrders().catch(console.error);
