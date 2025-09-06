'use client';

import type { IOrderItem } from 'src/types/order';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { ORDER_STATUS_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { OrderDetailsItems } from '../order-details-items';
import { OrderDetailsToolbar } from '../order-details-toolbar';
import { OrderDetailsHistory } from '../order-details-history';
import { OrderDetailsPayment } from '../order-details-payment';
import { OrderDetailsCustomer } from '../order-details-customer';
import { OrderDetailsDelivery } from '../order-details-delivery';
import { OrderDetailsShipping } from '../order-details-shipping';

// ----------------------------------------------------------------------

type Props = {
    readonly order?: IOrderItem;
    readonly orderError?: string | null;
};

export function OrderDetailsView({ order, orderError }: Props) {
    const [status, setStatus] = useState(order?.status);

    const handleChangeStatus = useCallback((newValue: string) => {
        setStatus(newValue);
    }, []);

    if (orderError) {
        return (
            <DashboardContent>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" color="error">
                            Hiba történt a rendelés betöltése során
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {orderError}
                        </Typography>
                    </Box>
                    <Button variant="contained" href={paths.dashboard.order.root}>
                        Vissza a rendelésekhez
                    </Button>
                </Card>
            </DashboardContent>
        );
    }

    if (!order) {
        return (
            <DashboardContent>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6">
                        Rendelés nem található
                    </Typography>
                    <Button variant="contained" href={paths.dashboard.order.root} sx={{ mt: 2 }}>
                        Vissza a rendelésekhez
                    </Button>
                </Card>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent>
            <OrderDetailsToolbar
                status={status}
                createdAt={order?.createdAt}
                orderNumber={order?.orderNumber}
                backHref={paths.dashboard.order.root}
                onChangeStatus={handleChangeStatus}
                statusOptions={ORDER_STATUS_OPTIONS}
            />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box
                        sx={{
                            gap: 3,
                            display: 'flex',
                            flexDirection: { xs: 'column-reverse', md: 'column' },
                        }}
                    >
                        <OrderDetailsItems
                            items={order?.items}
                            taxes={order?.taxes}
                            shipping={order?.shipping}
                            discount={order?.discount}
                            subtotal={order?.subtotal}
                            totalAmount={order?.totalAmount}
                        />

                        <OrderDetailsHistory history={order?.history} />
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <OrderDetailsCustomer customer={order?.customer} />

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <OrderDetailsDelivery delivery={order?.delivery} />

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <OrderDetailsShipping shippingAddress={order?.shippingAddress} />

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <OrderDetailsPayment payment={order?.payment} />
                    </Card>
                </Grid>
            </Grid>
        </DashboardContent>
    );
}
