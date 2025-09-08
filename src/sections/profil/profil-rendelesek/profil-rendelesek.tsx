'use client';

import { useState } from 'react';

import { Box, Grid, Stack, Button, Typography, CircularProgress } from '@mui/material';

import { useGetOrders } from 'src/actions/order';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

import { OrderStatusEnum } from 'src/types/order';

import ProfilNavigation from '../profil-navigation';
import ProfilRendelesekKartya from './profil-rendelesek-kartya';

export default function ProfilRendelesek() {
    const { user } = useAuthContext();
    const [currentPage, setCurrentPage] = useState(1); // Changed to 1-based for API
    const itemsPerPage = 10;

    // Fetch orders for the logged-in user
    const { orders, ordersLoading, ordersError, ordersTotalCount } = useGetOrders({
        customerId: user?.id,
        page: currentPage,
        limit: itemsPerPage,
    });

    // Transform the order data to match the component's expected format
    const transformedOrders = orders.map((order, index) => ({
        id: (currentPage - 1) * itemsPerPage + index + 1, // Unique ID across pages
        orderNumber: `#${order.id.slice(-6).toUpperCase()}`,
        orderDate: new Date(order.dateCreated).toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }),
        deliveryDate: order.plannedShippingDateTime 
            ? new Date(order.plannedShippingDateTime).toLocaleDateString('hu-HU')
            : 'N/A',
        status: mapOrderStatusToEnum(order.orderStatus),
        totalPrice: order.total,
        products: order.items.map((item) => ({
            id: item.id,
            imageUrl: item.coverUrl || 'https://placehold.co/100',
            name: item.name,
        })),
    }));

    const totalPages = Math.ceil(ordersTotalCount / itemsPerPage);

    // Helper function to map order status to enum
    function mapOrderStatusToEnum(status: string): OrderStatusEnum {
        switch (status) {
            case 'delivered':
                return OrderStatusEnum.Completed;
            case 'processing':
            case 'confirmed':
                return OrderStatusEnum.Processing;
            case 'cancelled':
                return OrderStatusEnum.Cancelled;
            case 'pending':
                return OrderStatusEnum.Pending;
            case 'shipping':
                return OrderStatusEnum.Shipped;
            case 'refunded':
                return OrderStatusEnum.Refunded;
            default:
                return OrderStatusEnum.Pending;
        }
    }

    if (!user) {
        return (
            <Box sx={{ py: 2, mx: 'auto' }}>
                <Grid container spacing={{ xs: 3, md: 4 }}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <ProfilNavigation />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 9 }}>
                        <Typography variant="h6">Kérjük, jelentkezzen be a rendelések megtekintéséhez.</Typography>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (ordersLoading) {
        return (
            <Box sx={{ py: 2, mx: 'auto' }}>
                <Grid container spacing={{ xs: 3, md: 4 }}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <ProfilNavigation />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 9 }}>
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                            <CircularProgress />
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (ordersError) {
        return (
            <Box sx={{ py: 2, mx: 'auto' }}>
                <Grid container spacing={{ xs: 3, md: 4 }}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <ProfilNavigation />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 9 }}>
                        <Typography variant="h6" color="error">
                            Hiba történt a rendelések betöltése során: {ordersError}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 2, mx: 'auto' }}>
            <Grid container spacing={{ xs: 3, md: 4 }}>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <ProfilNavigation />
                </Grid>
                <Grid size={{ xs: 12, sm: 9 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Rendelések
                        </Typography>
                        {transformedOrders.length > 0 ? (
                            <Stack spacing={2}>
                                {transformedOrders.map((order) => (
                                    <ProfilRendelesekKartya key={order.id} order={order} />
                                ))}
                            </Stack>
                        ) : (
                            <Typography>Nincsenek korábbi rendeléseid.</Typography>
                        )}

                        {totalPages > 1 && (
                            <Stack
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                                spacing={2}
                                sx={{ mt: 4 }}
                            >
                                <Button
                                    onClick={() => setCurrentPage((prev) => prev - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Előző
                                </Button>
                                <Typography>
                                    Oldal {currentPage} / {totalPages}
                                </Typography>
                                <Button
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                    disabled={currentPage >= totalPages}
                                >
                                    Következő
                                </Button>
                            </Stack>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
