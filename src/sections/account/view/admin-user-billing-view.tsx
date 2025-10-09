'use client';

import type { IBillingAddress } from 'src/types/customer';
import type { InvoiceHistoryItem } from 'src/actions/user-billing';

import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';

import { getUserInvoiceHistory, getUserBillingAddresses } from 'src/actions/user-billing';

import { AdminUserBillingAddress } from '../admin-user-billing-address';
import { AdminUserBillingHistory } from '../admin-user-billing-history';

// ----------------------------------------------------------------------

type Props = {
    userId: string;
};

export function AdminUserBillingView({ userId }: Props) {
    const [addresses, setAddresses] = useState<IBillingAddress[]>([]);
    const [invoices, setInvoices] = useState<InvoiceHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [addressResult, invoiceResult] = await Promise.all([
                getUserBillingAddresses(userId),
                getUserInvoiceHistory(userId),
            ]);

            if (addressResult.error) {
                setError(addressResult.error);
            } else {
                console.log('Fetched addresses:', addressResult.addresses);
                setAddresses(addressResult.addresses);
            }

            if (invoiceResult.error) {
                setError(invoiceResult.error);
            } else {
                setInvoices(invoiceResult.invoices);
            }
        } catch (err) {
            console.error('Error fetching billing data:', err);
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
                <Grid size={{ xs: 12, md: 8 }}>
                    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                </Grid>
            </Grid>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 3 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
                <AdminUserBillingAddress
                    userId={userId}
                    addressBook={addresses}
                    onUpdate={fetchData}
                />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <AdminUserBillingHistory invoices={invoices} />
            </Grid>
        </Grid>
    );
}
