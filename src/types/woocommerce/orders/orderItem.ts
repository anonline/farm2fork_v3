import { WPOrderItemMeta } from "./orderitemmeta";
import { WPOrderItemType } from "./orderitemtype";

export interface WPOrderItem {
    id: number;
    name: string;
    type: WPOrderItemType;
    order_id: number;
    meta: WPOrderItemMeta;
}