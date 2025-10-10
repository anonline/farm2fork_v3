import type { IAddress } from 'src/types/address';
import type { IOrderData } from 'src/types/order-management';
import type { IOrderItem, InvoiceData } from 'src/types/order';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

// Cache for user types to avoid redundant database calls
const userTypeCache = new Map<string, 'public' | 'vip' | 'company'>();

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
                return 'processing';
            case 'processing':
                return 'processing';
            case 'shipping':
                return 'shipping';
            case 'delivered':
                return 'delivered';
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

    const result: IOrderItem = {
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
            companyName: orderData.billingAddress?.company || '',
            taxNumber: orderData.billingAddress?.taxNumber || '',
            phoneNumber: orderData.billingAddress?.phoneNumber || '',
        },
        payment: {
            cardType: orderData.paymentMethod?.name || 'Unknown',
            cardNumber: '**** **** **** ****', // Not stored for security
            status: orderData.paymentStatus,
        },
        delivery: {
            shipBy: orderData.shippingMethod?.name || '',
            locationName: '',
            address: orderData.shippingAddress ? {
                id: orderData.shippingAddress?.id || '',
                postcode: orderData.shippingAddress?.postcode || '',
                city: orderData.shippingAddress?.city || '',
                street: orderData.shippingAddress?.street || '',
                floor: orderData.shippingAddress?.floor || '',
                houseNumber: orderData.shippingAddress?.houseNumber || '',
                doorbell: orderData.shippingAddress?.doorbell || '',
                comment: orderData.shippingAddress?.note || '',
                name: orderData.shippingAddress?.name || customerName,
                company: orderData.shippingAddress?.company || '',
                fullAddress: orderData.shippingAddress?.fullAddress || 'No address provided',
                phoneNumber: orderData.shippingAddress?.phoneNumber || '',
            } as unknown as IAddress : null,
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
            id: item.id?.toString() || '',
            sku: `SKU-${item.id}`,
            name: item.name,
            netPrice: item.netPrice,
            grossPrice: item.grossPrice,
            coverUrl: item.coverUrl || 'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp',
            quantity: item.quantity,
            unit: item.unit || 'db',
            subtotal: item.subtotal,
            note: item.note || '',
            vat: item.netPrice ? Math.round((item.grossPrice-item.netPrice)/item.netPrice * 100) : 0 ,
            slug: item.slug || '',
            type: item.type,
            bundleItems: item.bundleItems,
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
        shipment_time: orderData.shipment_time,
        invoiceData: orderData.invoiceDataJson ? orderData.invoiceDataJson as unknown as InvoiceData : undefined,
    };
    
    return result;
}

export async function getUserType(customerId: string | null): Promise<'public' | 'vip' | 'company'> {
    if (!customerId) return 'public';

    // Check cache first
    if (userTypeCache.has(customerId)) {
        return userTypeCache.get(customerId)!;
    }

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
        const userType = (data as 'public' | 'vip' | 'company') || 'public';
        
        // Cache the result
        userTypeCache.set(customerId, userType);
        
        return userType;
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

/**
 * Clear the user type cache - useful for testing or when user data changes
 */
export function clearUserTypeCache(customerId?: string): void {
    if (customerId) {
        userTypeCache.delete(customerId);
    } else {
        userTypeCache.clear();
    }
}
