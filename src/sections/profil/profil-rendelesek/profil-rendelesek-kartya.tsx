'use client';

import type { OrderStatusEnum } from 'src/types/order';

import { useRouter } from 'next/navigation';

import { Box, Chip, Grid, Paper, Stack, Avatar, Typography } from '@mui/material';

interface IOrderProduct {
    id: number;
    imageUrl: string;
    name: string;
}

interface IOrder {
    id: number;
    orderNumber: string;
    orderDate: string;
    deliveryDate: string;
    status: OrderStatusEnum;
    totalPrice: number;
    products: IOrderProduct[];
}

export default function ProfilRendelesekKartya({ order }: Readonly<{ order: IOrder }>) {
    const router = useRouter();
    const displayProducts = order.products.slice(0, 3);
    const hasMoreProducts = order.products.length > 3;

    const imageStyle = {
        width: '100%',
        height: 'auto',
        aspectRatio: '1 / 1',
        objectFit: 'cover',
        borderRadius: '4px',
    };

    return (
        <Paper
            variant="outlined"
            sx={{ p: { xs: 2, md: 3 }, borderRadius: '4px', borderColor: '#e0e0e0', width: '100%' }}
        >
            <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 7 }}>
                    <Stack spacing={1}>
                        <Typography
                            variant="body1"
                            sx={{ fontSize: '18px', lineHeight: '28px', fontWeight: 700 }}
                        >
                            Rendelés dátuma: {order.orderDate}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '16px', lineHeight: '24px', fontWeight: 500 }}
                        >
                            Azonosító: {order.orderNumber}
                        </Typography>
                        <Chip
                            label={order.status}
                            size="small"
                            sx={{
                                width: 'fit-content',
                                backgroundColor: 'rgb(228, 235, 194)',
                                color: 'rgb(60, 86, 56)',
                                fontSize: '16px',
                                lineHeight: '24px',
                                fontWeight: 400,
                                paddingX: '8px',
                                paddingY: '4px',
                                height: 'auto',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'rgb(228, 235, 194)',
                                },
                            }}
                        />
                        <Typography variant="h6" fontWeight={700}>
                            {order.totalPrice.toLocaleString('hu-HU')} Ft
                        </Typography>
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Stack spacing={1.5} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                        <DeliveryChip deliveryDateString={order.deliveryDate} />

                        <Grid container spacing={1} sx={{ marginLeft: 'auto' }}>
                            {displayProducts.map((product, index) => {
                                const showOverlay = index === 2 && hasMoreProducts;
                                return (
                                    <Grid size={{ xs: 4 }} key={product.id}>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    transition: 'transform 0.2s ease-in-out',
                                                },
                                            }}
                                        >
                                            <Avatar
                                                src={product.imageUrl}
                                                variant="rounded"
                                                sx={imageStyle}
                                            />
                                            {showOverlay && (
                                                <Box
                                                    onClick={() =>
                                                        router.push(`/rendelesek/${order.id}`)
                                                    }
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                        borderRadius: '4px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        transition:
                                                            'background-color 0.2s ease-in-out',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                                        },
                                                    }}
                                                >
                                                    <Typography variant="caption" fontWeight={600}>
                                                        Összes
                                                    </Typography>
                                                    <Typography variant="caption" fontWeight={600}>
                                                        termék
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Stack>
                </Grid>
            </Grid>
        </Paper>
    );
}

function DeliveryChip({ deliveryDateString }: Readonly<{ deliveryDateString: string }>) {
    return (
        <Chip
            label={`Kiszállítás: ${deliveryDateString}`}
            size="small"
            sx={{
                backgroundColor: 'rgb(149, 196, 249)',
                color: 'white',
                fontSize: '14px',
                lineHeight: '22px',
                fontWeight: 500,
                paddingX: '12px',
                paddingY: '8px',
                height: 'auto',
                marginLeft: 'auto',
            }}
        />
    );
}
