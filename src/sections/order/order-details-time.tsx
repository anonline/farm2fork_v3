import { Stack } from "@mui/material";

import OrderShipmentTimeSelector from "./components/order-shipmenttime-selector";
import OrderShipmentDateSelector from "./components/order-shipmentdate-selector";

type Props = {
    orderId?: string; // Optional, if not provided, won't update Supabase
    shipmentTime?: string; // Current shipment time value
    onRefreshOrder?: () => void;
    additionalPickUpTimes?: string[]; // Array of additional pickup times for the week, indexed 0=Monday to 6=Sunday
    requestedShippingDate?: any; // dayjs object representing the selected date
    isEditable: boolean;
    onShippingDateChange?: (newDate: Date | null) => void;
};

export default function OrderDetailsTime({ orderId, shipmentTime, onRefreshOrder, additionalPickUpTimes, requestedShippingDate, isEditable, onShippingDateChange }: Readonly<Props>) {
    return (
        <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
            <OrderShipmentDateSelector
                orderId={orderId}
                onRefreshOrder={onRefreshOrder}
                requestedShippingDate={requestedShippingDate}
                onShippingDateChange={onShippingDateChange}
            />

            <OrderShipmentTimeSelector
                orderId={orderId}
                shipmentTime={shipmentTime}
                onRefreshOrder={onRefreshOrder}
                additionalPickUpTimes={additionalPickUpTimes}
                requestedShippingDate={requestedShippingDate}
            />
        </Stack>
    );
}