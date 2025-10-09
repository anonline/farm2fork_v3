'use client';

import type { UserOrderItem } from 'src/actions/user-orders';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, useMediaQuery } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

type Props = {
    orders: UserOrderItem[];
};

export function AdminUserOrders({ orders }: Props) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const getOrderStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'teljesítve':
                return 'success';
            case 'processing':
            case 'feldolgozás alatt':
                return 'info';
            case 'pending':
            case 'függőben':
                return 'warning';
            case 'cancelled':
            case 'visszamondva':
                return 'error';
            case 'refunded':
            case 'visszatérítve':
                return 'error';
            case 'shipped':
            case 'kiszállítva':
                return 'primary';
            default:
                return 'default';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
            case 'kifizetve':
                return 'success';
            case 'pending':
            case 'függőben':
                return 'warning';
            case 'failed':
            case 'sikertelen':
                return 'error';
            case 'refunded':
            case 'visszatérítve':
                return 'error';
            default:
                return 'default';
        }
    };

    const getOrderStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            'pending': 'Függőben',
            'processing': 'Feldolgozás alatt',
            'completed': 'Teljesítve',
            'cancelled': 'Visszamondva',
            'refunded': 'Visszatérítve',
            'shipped': 'Kiszállítva',
        };
        return statusMap[status.toLowerCase()] || status;
    };

    const getPaymentStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            'pending': 'Függőben',
            'paid': 'Kifizetve',
            'failed': 'Sikertelen',
            'refunded': 'Visszatérítve',
        };
        return statusMap[status.toLowerCase()] || status;
    };

    const renderMobileView = () => (
        <Stack spacing={2} sx={{ p: 2 }}>
            {orders.map((order) => (
                <Card 
                    key={order.id} 
                    component={RouterLink}
                    href={paths.dashboard.order.details(order.id)}
                    sx={{ 
                        p: 2, 
                        border: (t) => `1px solid ${t.palette.divider}`,
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                            boxShadow: (t) => t.customShadows.z8,
                            borderColor: 'primary.main',
                        },
                    }}
                >
                    <Stack spacing={1.5}>
                        {/* Order Number and Date */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: 'primary.main',
                                    fontWeight: 600,
                                }}
                            >
                                #{order.orderNumber}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {fDate(order.dateCreated)}
                            </Typography>
                        </Box>

                        {/* Status Labels */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Label
                                variant="soft"
                                color={getOrderStatusColor(order.orderStatus)}
                            >
                                {getOrderStatusLabel(order.orderStatus)}
                            </Label>
                            <Label
                                variant="soft"
                                color={getPaymentStatusColor(order.paymentStatus)}
                            >
                                {getPaymentStatusLabel(order.paymentStatus)}
                            </Label>
                        </Box>

                        {/* Amounts */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Nettó:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {fCurrency(order.subtotal)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Bruttó:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {fCurrency(order.total)}
                            </Typography>
                        </Box>

                        {/* Payment & Shipping Methods */}
                        {order.paymentMethod?.name && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Fizetés:
                                </Typography>
                                <Typography variant="body2">
                                    {order.paymentMethod.name}
                                </Typography>
                            </Box>
                        )}
                        {order.shippingMethod?.name && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Szállítás:
                                </Typography>
                                <Typography variant="body2">
                                    {order.shippingMethod.name}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </Card>
            ))}
        </Stack>
    );

    const renderDesktopView = () => (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Rendelésszám</TableCell>
                        <TableCell>Dátum</TableCell>
                        <TableCell>Státusz</TableCell>
                        <TableCell>Fizetési státusz</TableCell>
                        <TableCell align="right">Nettó érték</TableCell>
                        <TableCell align="right">Bruttó érték</TableCell>
                        <TableCell>Fizetési mód</TableCell>
                        <TableCell>Szállítási mód</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id} hover>
                            <TableCell>
                                <Box
                                    component={RouterLink}
                                    href={paths.dashboard.order.details(order.id)}
                                    sx={{
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    #{order.orderNumber}
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" noWrap>
                                    {fDate(order.dateCreated)}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Label
                                    variant="soft"
                                    color={getOrderStatusColor(order.orderStatus)}
                                >
                                    {getOrderStatusLabel(order.orderStatus)}
                                </Label>
                            </TableCell>
                            <TableCell>
                                <Label
                                    variant="soft"
                                    color={getPaymentStatusColor(order.paymentStatus)}
                                >
                                    {getPaymentStatusLabel(order.paymentStatus)}
                                </Label>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="body2" fontWeight="medium">
                                    {fCurrency(order.subtotal)}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="body2" fontWeight="medium">
                                    {fCurrency(order.total)}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" noWrap>
                                    {order.paymentMethod?.name || '-'}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" noWrap>
                                    {order.shippingMethod?.name || '-'}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderContent = () => {
        if (orders.length === 0) {
            return (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 5 }}>
                    Nincsenek rendelések
                </Typography>
            );
        }

        return isMobile ? renderMobileView() : renderDesktopView();
    };

    return (
        <Card>
            <CardHeader title="Rendelések" />
            {renderContent()}
        </Card>
    );
}
