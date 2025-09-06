import type { IOrderData } from 'src/types/order-management';
import type { IOrderItem } from 'src/types/order';

// ----------------------------------------------------------------------

/**
 * Transform our order management data to the format expected by the dashboard table
 */
export function transformOrderDataToTableItem(orderData: IOrderData): IOrderItem {
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
        createdAt: orderData.dateCreated,
        customer: {
            id: orderData.customerId || 'guest',
            name: customerName,
            email: customerEmail,
            avatarUrl: generateAvatarUrl(customerName),
            ipAddress: '192.168.1.1', // Not tracked in our system
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
            fullAddress: orderData.shippingAddress?.fullAddress || 'No address provided',
            phoneNumber: orderData.shippingAddress?.phoneNumber || '',
        },
        items: orderData.items.map(item => ({
            id: item.id.toString(),
            sku: `SKU-${item.id}`,
            name: item.name,
            price: item.price,
            coverUrl: item.coverUrl || '/assets/placeholder.jpg',
            quantity: item.quantity,
        })),
        history: {
            orderTime: orderData.dateCreated,
            paymentTime: orderData.paymentStatus === 'paid' ? orderData.dateCreated : null,
            deliveryTime: orderData.orderStatus === 'delivered' ? orderData.plannedShippingDateTime || null : null,
            completionTime: orderData.orderStatus === 'delivered' ? orderData.plannedShippingDateTime || null : null,
            timeline: orderData.history.map(h => ({
                title: `Status: ${h.status}${h.note ? ` - ${h.note}` : ''}`,
                time: h.timestamp,
            })),
        },
    };
}

/**
 * Transform multiple order data items to table items
 */
export function transformOrdersDataToTableItems(ordersData: IOrderData[]): IOrderItem[] {
    return ordersData.map(transformOrderDataToTableItem);
}
