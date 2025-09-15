import type { IOrderItem } from 'src/types/order';
import type { IOrderData } from 'src/types/order-management';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

/**
 * Transform our order management data to the format expected by the dashboard table
 */
export async function transformOrderDataToTableItem(orderData: IOrderData): Promise<IOrderItem> {
    // Calculate totals from items
    const totalQuantity = orderData.items.reduce((total, item) => total + item.quantity, 0);
    
    // Map order status to the expected format
    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'pending':
                return 'pending';
            case 'confirmed':
                return 'inprogress';
            case 'processing':
                return 'inprogress';
            case 'shipping':
                return 'inprogress';
            case 'delivered':
                return 'completed';
            case 'cancelled':
                return 'cancelled';
            case 'refunded':
                return 'cancelled';
            default:
                return 'pending';
        }
    };

    // Extract customer information
    const customerName = orderData.customerName || 'Unknown Customer';
    const customerEmail = orderData.billingEmails[0] || orderData.notifyEmails[0] || '';

    // Generate avatar URL from name initials
    const generateAvatarUrl = (name: string): string => {
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=00AB55&color=fff&size=128`;
    };
    const userType = await getUserType(orderData.customerId);
    return {
        id: orderData.id,
        orderNumber: orderData.id,
        status: getStatusLabel(orderData.orderStatus),
        totalAmount: orderData.total,
        totalQuantity,
        subtotal: orderData.subtotal,
        taxes: orderData.vatTotal,
        shipping: orderData.shippingCost,
        discount: orderData.discountTotal,
        deposit: orderData.surchargeAmount || 0,
        createdAt: orderData.dateCreated,
        planned_shipping_date_time: orderData.plannedShippingDateTime,
        customer: {
            id: orderData.customerId || 'guest',
            name: customerName,
            email: customerEmail,
            avatarUrl: generateAvatarUrl(customerName),
            ipAddress: '192.168.1.1', // Not tracked in our system
            userType,
        },
        payment: {
            cardType: orderData.paymentMethod?.name || 'Unknown',
            cardNumber: '**** **** **** ****', // Not stored for security
        },
        delivery: {
            shipBy: orderData.shippingMethod?.name || 'Unknown',
            speedy: 'Standard',
            trackingNumber: orderData.courier || 'N/A',
        },
        shippingAddress: {
            postcode: orderData.shippingAddress?.postcode || '',
            city: orderData.shippingAddress?.city || '',
            street: orderData.shippingAddress?.street || '',
            floor: orderData.shippingAddress?.floor || '',
            houseNumber: orderData.shippingAddress?.houseNumber || '',
            doorbell: orderData.shippingAddress?.doorbell || '',
            note: orderData.shippingAddress?.note || '',
            name: orderData.shippingAddress?.name || customerName,
            company: orderData.shippingAddress?.company || '',
            fullAddress: orderData.shippingAddress?.fullAddress || 'No address provided',
            phoneNumber: orderData.shippingAddress?.phoneNumber || '',
        },
        items: orderData.items.map(item => ({
            id: item.id.toString(),
            sku: `SKU-${item.id}`,
            name: item.name,
            price: item.price,
            coverUrl: item.coverUrl || 'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp',
            quantity: item.quantity,
            unit: item.unit || 'db',
            subtotal: item.subtotal,
            note: item.note || '',
            slug: item.slug || '',
        })),
        history: {
            orderTime: orderData.dateCreated,
            paymentTime: orderData.paymentStatus === 'paid' ? orderData.dateCreated : null,
            deliveryTime: orderData.orderStatus === 'delivered' ? orderData.plannedShippingDateTime?.toLocaleDateString('hu-HU') || null : null,
            completionTime: orderData.orderStatus === 'delivered' ? orderData.plannedShippingDateTime?.toLocaleDateString('hu-HU') || null : null,
            timeline: orderData.history.map(h => ({
                title: `Status: ${h.status}${h.note ? ` - ${h.note}` : ''}`,
                time: h.timestamp,
            })),
        },
        shipmentId: orderData.shipmentId || null,
    };
}

async function getUserType(customerId: string | null): Promise<'public' | 'vip' | 'company'> {
    if (!customerId) return 'public';
    
    try {
        // Import Supabase client
        const { createClient } = await import('@supabase/supabase-js');
               
        const supabase = createClient(
            CONFIG.supabase.url,
            CONFIG.supabase.key
        );
        
        // Call the database function with the specific user ID parameter
        const { data, error } = await supabase.rpc('get_user_type_by_id', {
            user_id: customerId
        });
        
        console.log('User type fetched from Supabase function for user:', customerId, 'result:', data);
        
        if (error) {
            console.error('Error fetching user type from Supabase:', error);
            return 'public';
        }
        
        // The function returns the user type directly
        return data as 'public' | 'vip' | 'company' || 'public';
    } catch (error) {
        console.error('Error fetching user type from Supabase:', error);
        return 'public';
    }
}

/**
 * Transform multiple order data items to table items
 */
export async function transformOrdersDataToTableItems(ordersData: IOrderData[]): Promise<IOrderItem[]> {
    let orders = await Promise.all(ordersData.map(transformOrderDataToTableItem));
    orders = orders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
    return orders;
}
