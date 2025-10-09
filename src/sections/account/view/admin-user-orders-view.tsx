'use client';

import type { UserOrderItem } from 'src/actions/user-orders';

import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';

import { getUserOrders } from 'src/actions/user-orders';

import { AdminUserOrders } from '../admin-user-orders';

// ----------------------------------------------------------------------

type Props = {
    userId: string;
};

export function AdminUserOrdersView({ userId }: Props) {
    const [orders, setOrders] = useState<UserOrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const ordersResult = await getUserOrders(userId);

            if (ordersResult.error) {
                setError(ordersResult.error);
            } else {
                setOrders(ordersResult.orders || []);
            }
        } catch (err) {
            console.error('Error fetching user orders:', err);
            setError('Hiba történt az adatok betöltése során.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    if (loading) {
        return (
            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                </Grid>
            </Grid>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
                <AdminUserOrders orders={orders} />
            </Grid>
        </Grid>
    );
}
