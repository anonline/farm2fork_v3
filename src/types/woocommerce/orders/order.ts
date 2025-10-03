import type { WPOrderItem } from "./orderItem";
import type { WPOrderMeta } from "./ordermeta";
import type { WPOrderStatus } from "./orderstatus";
import type { WPOrderAddress } from "./orderaddress";
import type { WPPaymentMethod } from "./paymentmethod";

export interface WPOrder {
    id: number;
    parent_id: number;
    status: WPOrderStatus;
    tax_amount: number;
    total_amount: number;
    customer_id: number;
    billing_email: string;
    date_created_gmt: Date;
    date_updated_gmt: Date;
    payment_method: WPPaymentMethod;
    transaction_id: string;
    customer_note: string;
    line_items: WPOrderItem[];
    billing: WPOrderAddress;
    shipping: WPOrderAddress;
    meta_data: WPOrderMeta;
}