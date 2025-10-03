import type { IAddressItem } from 'src/types/common';
import type { IPaymentMethod } from 'src/types/payment-method';
import type { WPOrder } from 'src/types/woocommerce/orders/order';
import type { WPOrderItem } from 'src/types/woocommerce/orders/orderItem';
import type { IOrderData, IOrderItem, OrderStatus, PaymentStatus, ShippingMethod } from 'src/types/order-management';

import { getUserByWooId } from 'src/actions/user-ssr';

import { WPOrderStatus } from 'src/types/woocommerce/orders/orderstatus';
import { WPOrderItemType } from 'src/types/woocommerce/orders/orderitemtype';
import { WPPaymentMethod } from 'src/types/woocommerce/orders/paymentmethod';

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
    const shippingItem = order.line_items.find((item) => item.type === WPOrderItemType.shipping);
    if (shippingItem) {
        const netShipping = parseFloat(shippingItem.meta._line_total?.toString() || '0');
        const taxShipping = parseFloat(shippingItem.meta._line_tax?.toString() || '0');
        return netShipping + taxShipping;
    }
    return 0;
}

function getPayedAmount(order: WPOrder): number {
    if (order.status == WPOrderStatus.Completed) {
        return order.total_amount;
    }

    if (order.payment_method == WPPaymentMethod.OTPSimplepay) {
        return parseFloat(order.meta_data.approved?.toString() || '0');
    }

    return 0;
}

function getPaymentMethod(order: WPOrder): IPaymentMethod {
    const method: IPaymentMethod = {
        slug: '',
        name: '',
        id: 0,
        type: 'cod',
        additionalCost: 0,
        protected: false,
        enablePublic: true,
        enableVIP: true,
        enableCompany: true,
    };

    switch (order.payment_method) {
        case WPPaymentMethod.OTPSimplepay:
            method.slug = 'simple';
            method.name = 'SimplePay fizetés';
            method.type = 'online';
            break;
        case WPPaymentMethod.CHEQUQE:
            method.slug = 'utalas';
            method.name = 'Átutalás';
            method.type = 'wire';
            break;
        default:
            method.slug = 'utanvet';
            method.name = 'Utánvét';
            method.type = 'cod';
    }

    return method;
}

function getShippingMethod(order: WPOrder): ShippingMethod {
    const method_id = order.line_items.find((item) => item.type === WPOrderItemType.shipping)?.meta.method_id;
    if (method_id) {
        const method: ShippingMethod = {
            id: 0,
            name: method_id.toString() == 'pickup_location' ? 'Személyes átvétel' : 'Házhozszállítás',
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
            return 'pending';
        case WPOrderStatus.NewOrder:
            return 'pending';
        case WPOrderStatus.Shipping:
        case WPOrderStatus.Processing:
            if (order.payment_method == WPPaymentMethod.OTPSimplepay) {
                return 'paid';
            }
            return 'pending';
        case WPOrderStatus.Completed:
            return 'closed';
        case WPOrderStatus.OnHold:
            return 'pending';
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
    if (order.payment_method == WPPaymentMethod.OTPSimplepay) {
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
        const dateStr = shipping.meta.pickup_time?.toString();
        if (dateStr) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date;
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

function getShippingAddress(order: WPOrder): IAddressItem {
    const address: IAddressItem = {
        id: '0',
        company: order.shipping.company || '',
        name: `${order.shipping.last_name} ${order.shipping.first_name}`.trim(),
        city: order.shipping.city || '',
        postcode: order.shipping.postcode || '',
        street: order.shipping.address_1 || '',
        houseNumber: order.shipping.address_2 || '',
        doorbell: '',
        floor: '',
        fullAddress: `${order.shipping.postcode || ''} ${order.shipping.city || ''} ${order.shipping.address_1 || ''} ${order.shipping.address_2 || ''}`.trim(),
        phone: order.shipping.phone || '',
        email: order.shipping.email || order.billing_email || '',
        note: '',
        addressType: 'shipping',
    };
    return address;
}

function getBillingAddress(order: WPOrder): IAddressItem {
const address: IAddressItem = {
        id: '0',
        company: order.shipping.company || '',
        name: `${order.shipping.last_name} ${order.shipping.first_name}`.trim(),
        city: order.shipping.city || '',
        postcode: order.shipping.postcode || '',
        street: order.shipping.address_1 || '',
        houseNumber: order.shipping.address_2 || '',
        doorbell: '',
        floor: '',
        fullAddress: `${order.shipping.postcode || ''} ${order.shipping.city || ''} ${order.shipping.address_1 || ''} ${order.shipping.address_2 || ''}`.trim(),
        phone: order.shipping.phone || '',
        email: order.shipping.email || order.billing_email || '',
        note: '',
        taxNumber: order.meta_data._billing_tax_number?.toString() || '',
        addressType: 'billing',
    };
    return address;
}

function getItems(order: WPOrder): IOrderItem[] {
    const items: IOrderItem[] = order.line_items
        .filter((item) => item.type === WPOrderItemType.line_item)
        .map((item: WPOrderItem) => ({
            id: item.id.toString(),
            productId: item.meta._product_id ? parseInt(item.meta._product_id.toString()) : 0,
            name: item.name,
            quantity: item.meta._qty ? parseFloat(item.meta._qty.toString()) : 1,
            netPrice: parseFloat(item.meta._line_subtotal?.toString() || '0') - (item.meta._line_tax ? parseFloat(item.meta._line_tax.toString()) : 0) / (item.meta._qty ? parseFloat(item.meta._qty.toString()) : 1),
            grossPrice: parseFloat(item.meta._line_total?.toString() || '0') / (item.meta._qty ? parseFloat(item.meta._qty.toString()) : 1),
            subtotal: item.meta._line_total ? parseFloat(item.meta._line_total.toString()) : 0,
            note: (item.meta.note ? item.meta.note.toString() : '') + ' ' + (item.meta.custom_note ? item.meta.custom_note.toString() : ''),
            taxAmount: item.meta._line_tax ? parseFloat(item.meta._line_tax.toString()) : 0,
            coverUrl: 'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp',
        }));
    return items;
}