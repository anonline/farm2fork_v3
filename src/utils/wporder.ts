import type { InvoiceData } from 'src/types/order';
import type { IAddressItem } from 'src/types/common';
import type { IPaymentMethod } from 'src/types/payment-method';
import type { WPOrder } from 'src/types/woocommerce/orders/order';
import type { WPOrderItem } from 'src/types/woocommerce/orders/orderItem';
import type {
    IOrderData,
    IOrderItem,
    OrderStatus,
    PaymentStatus,
    ShippingMethod,
} from 'src/types/order-management';

import { getUserByWooId } from 'src/actions/user-ssr';

import { WPOrderStatus } from 'src/types/woocommerce/orders/orderstatus';
import { WPOrderItemType } from 'src/types/woocommerce/orders/orderitemtype';

export async function wpOrderToSupabaseOrder(order: WPOrder): Promise<IOrderData> {
    const customer = await getUserByWooId(order.customer_id);

    const output: IOrderData = {
        id: order.id.toString(),
        dateCreated: new Date(order.date_created_gmt).toISOString(),
        customerId: customer.id,
        billingEmails: [order.billing_email],
        notifyEmails: [customer.email || order.billing_email],
        customerName: `${order.billing.last_name} ${order.billing.first_name}`,
        denyInvoice: order.meta_data.innvoice_block_create == '1',
        needVAT: customer.user_metadata?.is_vip == false,
        surchargeAmount: findSurchargeAmount(order),
        items: getItems(order),
        subtotal: getOrderNetValue(order),
        shippingCost: getShippingCost(order),
        vatTotal: order.tax_amount,
        discountTotal: 0,
        total: order.total_amount,
        payedAmount: getPayedAmount(order),
        shippingMethod: getShippingMethod(order),
        paymentMethod: getPaymentMethod(order),
        paymentStatus: getPaymentStatus(order),
        orderStatus: getOrderStatus(order),
        paymentDueDays: Number(order.meta_data.innvoice_payment_due?.toString() || 8),
        courier: order.meta_data.futar?.toString() || null,
        plannedShippingDateTime: getPlannedShippingDate(order),
        simplepayDataJson: getSimplePayData(order),
        history: [],
        shippingAddress: getShippingAddress(order),
        billingAddress: getBillingAddress(order),
        history_for_user: order.meta_data.change_log?.toString() || '',
        shipmentId: order.meta_data.summary_id ? Number(order.meta_data.summary_id) : null,
        shipment_time: getShipmentTime(order),
        wooUserId: order.customer_id,
        note: order.customer_note,
        invoiceDataJson: order.meta_data._innvoice_szamla_url
            ? getInvoiceDataJson(order)
            : undefined,
    };
    return output;
}

function findSurchargeAmount(order: WPOrder): number {
    const surchargeItem = order.line_items.find((item) => item.type === WPOrderItemType.fee);
    if (surchargeItem) {
        const netFee = parseFloat(surchargeItem.meta._line_total?.toString() || '0');
        const taxFee = parseFloat(surchargeItem.meta._line_tax?.toString() || '0');
        return netFee + taxFee;
    }
    return 0;
}

function getOrderNetValue(order: WPOrder): number {
    return order.total_amount - order.tax_amount;
}

function getShippingCost(order: WPOrder): number {
    const shippingItem = order.line_items.find((item) => item.type === 'shipping');
    
    if (shippingItem) {
        const netShipping = parseFloat(shippingItem.meta.cost?.toString() || '0');
        const taxShipping = parseFloat(shippingItem.meta.total_tax?.toString() || '0');
        return netShipping + taxShipping;
    }
    return 0;
}

function getPayedAmount(order: WPOrder): number {
    if (order.status == 'wc-completed') {
        return order.total_amount;
    }

    if (order.payment_method == 'otp_simple') {
        return parseFloat(order.meta_data.approved?.toString() ?? '0');
    }

    return 0;
}

function getPaymentMethod(order: WPOrder): IPaymentMethod {
    const method: IPaymentMethod = {
        slug: 'utanvet',
        name: 'Utánvét',
        id: 1,
        type: 'cod',
        additionalCost: 0,
        protected: true,
        enablePublic: true,
        enableVIP: true,
        enableCompany: true,
    };

    switch (order.payment_method) {
        case 'otp_simple':
            method.id = 2;
            method.slug = 'simple';
            method.name = 'SimplePay fizetés';
            method.type = 'online';
            break;
        case 'cheque':
            method.id = 3;
            method.slug = 'utalas';
            method.name = 'Átutalás';
            method.type = 'wire';
            break;
        default:
            method.id = 1;
            method.slug = 'utanvet';
            method.name = 'Utánvét';
            method.type = 'cod';
    }

    return method;
}

function getShippingMethod(order: WPOrder): ShippingMethod {
    const method_id = order.line_items.find((item) => item.type === WPOrderItemType.shipping)?.meta
        .method_id;
    if (method_id) {
        const method: ShippingMethod = {
            id: 0,
            name:
                method_id.toString() == 'pickup_location' ? 'Személyes átvétel' : 'Házhozszállítás',
            cost: getShippingCost(order),
            description: '',
        };
        return method;
    }
    const method: ShippingMethod = {
        id: 0,
        name: 'Nincs kiszállítás',
        cost: 0,
        description: '',
    };
    return method;
}

function getPaymentStatus(order: WPOrder): PaymentStatus {
    switch (order.status) {
        case WPOrderStatus.Pending:
        case WPOrderStatus.NewOrder:
        case WPOrderStatus.OnHold:
            if (order.payment_method == 'otp_simple') {
                return 'paid';
            }
            return 'pending';
        case WPOrderStatus.Shipping:
        case WPOrderStatus.Processing:
            if (order.payment_method == 'otp_simple') {
                return 'closed';
            }
            return 'pending';
        case WPOrderStatus.Completed:
            return 'closed';
        case WPOrderStatus.Failed:
            return 'failed';
        case WPOrderStatus.Cancelled:
        case WPOrderStatus.Trash:
            return 'refunded';
        case WPOrderStatus.AutoDraft:
            return 'pending';
        default:
            return 'pending';
    }
}

function getOrderStatus(order: WPOrder): OrderStatus {
    switch (order.status) {
        case WPOrderStatus.Pending:
            return 'pending';
        case WPOrderStatus.NewOrder:
            return 'pending';
        case WPOrderStatus.Shipping:
            return 'shipping';
        case WPOrderStatus.Processing:
            return 'processing';
        case WPOrderStatus.Completed:
            return 'delivered';
        case WPOrderStatus.OnHold:
            return 'pending';
        case WPOrderStatus.Failed:
        case WPOrderStatus.Cancelled:
        case WPOrderStatus.Trash:
            return 'cancelled';
        case WPOrderStatus.AutoDraft:
            return 'pending';
        default:
            return 'pending';
    }
}

function getSimplePayData(order: WPOrder): string {
    if (order.payment_method == 'otp_simple') {
        const simpleData = {
            r: 0, //válasz kód
            t: order.meta_data.simple_id, // tranzakciós azonosító
            e: '', // hibaüzenet
            m: order.meta_data.simple_status, // státusz üzenet
            o: '', // egyéb információ
        };

        return JSON.stringify(simpleData);
    }
    return '';
}

function getPlannedShippingDate(order: WPOrder): Date | null {
    const shipping = order.line_items.find((item) => item.type === WPOrderItemType.shipping);
    if (shipping) {
        let dateStr = shipping.meta.pickup_time?.toString();
        if (dateStr) {
            let date = new Date(dateStr);
            if (dateStr.indexOf(' ') > 0) {
                dateStr = dateStr.split(' ')[0].replaceAll('.', '-');
                date = new Date(dateStr + 'T00:00:00Z');
            } else {
                date = new Date(dateStr.replaceAll('.', '-') + 'T00:00:00Z');
            }

            return date;
        }
    }

    return null;
}

function getShipmentTime(order: WPOrder): string {
    const shipping = order.line_items.find((item) => item.type === WPOrderItemType.shipping);
    if (shipping) {
        const timeStr = shipping.meta.pickup_time?.toString();
        if (timeStr) {
            return timeStr.split(' ')[1] || '';
        }
    }

    return '';
}

function splitAddressToStreetAndNumber(address: string): { 
    street: string; 
    houseNumber: string;
    floor: string;
    doorbell: string;
} {
    const trimmedAddress = address.trim();
    
    // Hungarian street type patterns (full and abbreviated forms)
    const streetTypePattern = /\b(utca|út|sétány|körút|köz|tér|park|fasor|sugárút|dűlő|sor|liget|u\.|ú\.|ut|stny|krt|kz|tr|prk|fsr|sgú|dl|sr|lgt)\.?\b/i;
    
    // Find the last occurrence of a street type
    const match = trimmedAddress.match(new RegExp(streetTypePattern.source + '\\s+(.+)$', 'i'));
    
    if (match) {
        // Extract street name (everything up to and including the street type)
        const streetEndIndex = match.index! + match[0].length - match[2].length;
        const street = trimmedAddress.substring(0, streetEndIndex).trim();
        
        // Extract house number and additional info (everything after street type)
        const remaining = match[2].trim();
        
        // Parse house number with potential suffixes like /A, .a, /B, etc.
        // and additional info like floor, doorbell
        const houseNumberMatch = remaining.match(/^(\d+(?:[\/\.][A-Za-z0-9]+)?)\s*(.*)$/);
        
        if (houseNumberMatch) {
            const houseNumber = houseNumberMatch[1];
            const additionalInfo = houseNumberMatch[2].trim();
            
            // Try to extract floor and doorbell from additional info
            // Common patterns: "2. em. 5", "3/5", "em. 2 ajtó 5", etc.
            let floor = '';
            let doorbell = '';
            
            if (additionalInfo) {
                // Pattern: "2. em. 5" or "em. 2 ajtó 5" or "3/5" or "3. emelet 5"
                const floorDoorbellMatch = additionalInfo.match(/(?:(\d+)\.?\s*(?:em|emelet|floor)\.?\s*)?(?:ajtó|ajto|door)?\s*(\d+)/i);
                if (floorDoorbellMatch) {
                    floor = floorDoorbellMatch[1] || '';
                    doorbell = floorDoorbellMatch[2] || '';
                } else {
                    // Try simple slash pattern: "3/5" (floor/door)
                    const slashMatch = additionalInfo.match(/^(\d+)\s*\/\s*(\d+)$/);
                    if (slashMatch) {
                        floor = slashMatch[1];
                        doorbell = slashMatch[2];
                    } else {
                        // If we can't parse it, put everything in floor
                        floor = additionalInfo;
                    }
                }
            }
            
            return { street, houseNumber, floor, doorbell };
        }
        
        return { street, houseNumber: remaining, floor: '', doorbell: '' };
    }
    
    // Fallback: try to find first number as house number start
    const numberMatch = trimmedAddress.match(/^(.+?)\s+(\d+(?:[\/\.][A-Za-z0-9]+)?)\s*(.*)$/);
    if (numberMatch) {
        const street = numberMatch[1].trim();
        const houseNumber = numberMatch[2].trim();
        const additionalInfo = numberMatch[3].trim();
        
        let floor = '';
        let doorbell = '';
        
        if (additionalInfo) {
            const floorDoorbellMatch = additionalInfo.match(/(?:(\d+)\.?\s*(?:em|emelet|floor)\.?\s*)?(?:ajtó|ajto|door)?\s*(\d+)/i);
            if (floorDoorbellMatch) {
                floor = floorDoorbellMatch[1] || '';
                doorbell = floorDoorbellMatch[2] || '';
            } else {
                const slashMatch = additionalInfo.match(/^(\d+)\s*\/\s*(\d+)$/);
                if (slashMatch) {
                    floor = slashMatch[1];
                    doorbell = slashMatch[2];
                } else {
                    floor = additionalInfo;
                }
            }
        }
        
        return { street, houseNumber, floor, doorbell };
    }
    
    // If no pattern matches, return the whole address as street
    return { street: trimmedAddress, houseNumber: '', floor: '', doorbell: '' };
}

function getShippingAddress(order: WPOrder): IAddressItem {
    // Combine address_1 and address_2 for parsing
    const fullAddressString = `${order.shipping.address_1 || ''} ${order.shipping.address_2 || ''}`.trim();
    const parsedAddress = splitAddressToStreetAndNumber(fullAddressString);
    const shippingMethod = getShippingMethod(order);

    const address: IAddressItem = {
        id: Math.random().toString(36).substring(2, 15), // Generate a random id
        company: order.shipping.company || '',
        name: `${order.shipping.last_name} ${order.shipping.first_name}`.trim(),
        city: order.shipping.city || '',
        postcode: order.shipping.postcode || '',
        street: parsedAddress.street,
        houseNumber: parsedAddress.houseNumber,
        doorbell: parsedAddress.doorbell,
        floor: parsedAddress.floor,
        fullAddress:
            `${order.shipping.postcode || ''} ${order.shipping.city || ''} ${parsedAddress.street} ${parsedAddress.houseNumber} ${parsedAddress.floor} ${parsedAddress.doorbell}`.trim(),
        phoneNumber: order.shipping.phone || '',
        email: order.shipping.email || order.billing_email || '',
        note: '',
        addressType: shippingMethod.name == 'Személyes átvétel' ? 'pickup' : 'delivery',
    };
    return address;
}

function getBillingAddress(order: WPOrder): IAddressItem {
    // Combine billing address_1 and address_2 for parsing
    const fullAddressString = `${order.billing.address_1 || ''} ${order.billing.address_2 || ''}`.trim();
    const parsedAddress = splitAddressToStreetAndNumber(fullAddressString);
    
    const address: IAddressItem = {
        id: Math.random().toString(36).substring(2, 15), // Generate a random id
        company: order.billing.company || '',
        name: `${order.billing.last_name} ${order.billing.first_name}`.trim(),
        city: order.billing.city || '',
        postcode: order.billing.postcode || '',
        street: parsedAddress.street,
        houseNumber: parsedAddress.houseNumber,
        doorbell: parsedAddress.doorbell,
        floor: parsedAddress.floor,
        fullAddress:
            `${order.billing.postcode || ''} ${order.billing.city || ''} ${parsedAddress.street} ${parsedAddress.houseNumber} ${parsedAddress.floor} ${parsedAddress.doorbell}`.trim(),
        phoneNumber: order.billing.phone || '',
        email: order.billing.email || order.billing_email || '',
        note: '',
        taxNumber: order.meta_data._billing_tax_number?.toString() || '',
        addressType: 'billing',
    };
    return address;
}

function getItems(order: WPOrder): IOrderItem[] {
    const items: IOrderItem[] = order.line_items
        .filter((item) => item.type === WPOrderItemType.line_item)
        .map((item: WPOrderItem) => {
            const qty = item.meta._qty ? parseFloat(item.meta._qty.toString()) : 1;

            const subtotal = item.meta._line_total
                ? parseFloat(item.meta._line_total.toString())
                : 0;

            const taxTotal = item.meta._line_tax ? parseFloat(item.meta._line_tax.toString()) : 0;
            const grossUnitPrice = (subtotal + taxTotal) / qty;

            const netPrice = subtotal / qty;

            const vatPercent = taxTotal > 0 ? Math.round(Number((taxTotal / subtotal) * 100)) : 0;

            return {
                id: item.meta._product_id?.toString() ?? item.id.toString(),
                productId: item.meta._product_id ? parseInt(item.meta._product_id.toString()) : 0,
                name: item.name,
                quantity: item.meta._qty ? parseFloat(item.meta._qty.toString()) : 1,
                netPrice,
                unit: item.meta._unit ? item.meta._unit.toString() : 'db',
                grossPrice: grossUnitPrice,
                subtotal: qty * grossUnitPrice,
                note:
                    (item.meta.note ? item.meta.note.toString() : '') +
                    ' ' +
                    (item.meta.custom_note ? item.meta.custom_note.toString() : ''),
                vatPercent,
                coverUrl:
                    'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp',
            };
        });
    return items;
}

function getInvoiceDataJson(order: WPOrder): Partial<InvoiceData> {
    return {
        invoiceId: 0,
        invoiceNumber:
            order.meta_data._innvoice_szamla_sorszam?.toString() || 'Számla sorszám hiányzik',
        downloadUrl: order.meta_data._innvoice_szamla_url?.toString() || '',
    } as Partial<InvoiceData>;
}
