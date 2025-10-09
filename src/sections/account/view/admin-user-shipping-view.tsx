'use client';

import type { IDeliveryAddress } from 'src/types/customer';

import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';

import { getUserShippingAddresses } from 'src/actions/user-shipping';

import { AdminUserShippingAddress } from '../admin-user-shipping-address';

// ----------------------------------------------------------------------

type Props = {
    userId: string;
};

export function AdminUserShippingView({ userId }: Props) {
    const [addresses, setAddresses] = useState<IDeliveryAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const addressResult = await getUserShippingAddresses(userId);

            if (addressResult.error) {
                setError(addressResult.error);
            } else {
                setAddresses(addressResult.addresses || []);
            }
        } catch (err) {
            console.error('Error fetching shipping data:', err);
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
                <AdminUserShippingAddress
                    userId={userId}
                    addressBook={addresses}
                    onUpdate={fetchData}
                />
            </Grid>
        </Grid>
    );
}
