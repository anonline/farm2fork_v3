import type { WPOrderItemMeta } from "./orderitemmeta";
import type { WPOrderItemType } from "./orderitemtype";

export interface WPOrderItem {
    id: number;
    name: string;
    type: WPOrderItemType;
    order_id: number;
    meta: WPOrderItemMeta;
}