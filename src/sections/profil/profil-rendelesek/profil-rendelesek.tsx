'use client';

import { useState } from 'react';

import { Box, Grid, Stack, Button, Typography } from '@mui/material';

import { OrderStatusEnum } from 'src/types/order';

import ProfilNavigation from '../profil-navigation';
import ProfilRendelesekKartya from './profil-rendelesek-kartya';

const orderData = [
    {
        id: 1,
        orderNumber: '#34972',
        orderDate: '2025.03.01 10:00',
        deliveryDate: '2025.03.07',
        status: OrderStatusEnum.Completed,
        totalPrice: 10000,
        products: [
            { id: 1, imageUrl: 'https://placehold.co/100', name: 'Termék 1' },
            { id: 2, imageUrl: 'https://placehold.co/100', name: 'Termék 2' },
        ],
    },
    {
        id: 2,
        orderNumber: '#34973',
        orderDate: '2025.03.02 11:00',
        deliveryDate: '2025.03.08',
        status: OrderStatusEnum.Processing,
        totalPrice: 15000,
        products: [
            { id: 3, imageUrl: 'https://placehold.co/100', name: 'Termék 3' },
            { id: 4, imageUrl: 'https://placehold.co/100', name: 'Termék 4' },
        ],
    },
    {
        id: 3,
        orderNumber: '#34974',
        orderDate: '2025.03.03 12:00',
        deliveryDate: '2025.03.09',
        status: OrderStatusEnum.Cancelled,
        totalPrice: 20000,
        products: [{ id: 5, imageUrl: 'https://placehold.co/100', name: 'Termék 5' }],
    },
];

export default function ProfilRendelesek() {
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentOrders = orderData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(orderData.length / itemsPerPage);

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
                        {currentOrders.length > 0 ? (
                            <Stack spacing={2}>
                                {currentOrders.map((order) => (
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
                                    disabled={currentPage === 0}
                                >
                                    Előző
                                </Button>
                                <Typography>
                                    Oldal {currentPage + 1} / {totalPages}
                                </Typography>
                                <Button
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                    disabled={currentPage >= totalPages - 1}
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
