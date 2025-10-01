import type { IOrderData } from 'src/types/order-management';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
    orders: IOrderData[];
    selectedOrders: string[];
    onOrderToggle: (orderId: string) => void;
    loading?: boolean;
    hideCheckboxes?: boolean;
};

export function OrdersTable({ orders, selectedOrders, onOrderToggle, loading, hideCheckboxes = false }: Props) {
    const theme = useTheme();

    const [searchQuery, setSearchQuery] = useState('');

    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return orders;

        const query = searchQuery.toLowerCase();
        return orders.filter(order =>
            order.customerName.toLowerCase().includes(query) ||
            order.id.toLowerCase().includes(query) ||
            order.note.toLowerCase().includes(query)
        );
    }, [orders, searchQuery]);

    const getOrderStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'confirmed': return 'info';
            case 'processing': return 'primary';
            case 'shipping': return 'secondary';
            case 'delivered': return 'success';
            case 'cancelled': return 'error';
            case 'refunded': return 'error';
            default: return 'default';
        }
    };

    const getOrderStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Új rendelés';
            case 'confirmed': return 'Megerősítve';
            case 'processing': return 'Feldolgozva';
            case 'shipping': return 'Szállítás alatt';
            case 'delivered': return 'Kiszállítva';
            case 'cancelled': return 'Törölve';
            case 'refunded': return 'Visszatérítve';
            default: return status;
        }
    };

    const handleRowClick = (orderId: string) => {
        onOrderToggle(orderId);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 200
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <TextField
                    fullWidth
                    placeholder="Keresés rendelés ID, ügyfélnév vagy megjegyzés alapján..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                />
            </Box>

            <Box sx={{ flex: 1, minHeight: 0 }}>
                <Scrollbar sx={{ height: '100%' }}>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {!hideCheckboxes && (
                                        <TableCell padding="checkbox" sx={{ width: 48 }}>
                                            <Checkbox
                                                indeterminate={
                                                    selectedOrders.length > 0 &&
                                                    selectedOrders.length < filteredOrders.length
                                                }
                                                checked={
                                                    filteredOrders.length > 0 &&
                                                    selectedOrders.length === filteredOrders.length
                                                }
                                                onChange={(event) => {
                                                    if (event.target.checked) {
                                                        const allOrderIds = filteredOrders.map(order => order.id);
                                                        allOrderIds.forEach(id => {
                                                            if (!selectedOrders.includes(id)) {
                                                                onOrderToggle(id);
                                                            }
                                                        });
                                                    } else {
                                                        selectedOrders.forEach(id => {
                                                            if (filteredOrders.some(order => order.id === id)) {
                                                                onOrderToggle(id);
                                                            }
                                                        });
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell>Rendelés</TableCell>
                                    <TableCell>Vásárló</TableCell>
                                    <TableCell>Összeg</TableCell>
                                    <TableCell align='center'>Státusz</TableCell>
                                    <TableCell align='right'>Jelenlegi összesítő</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.map((order) => {
                                    const isSelected = selectedOrders.includes(order.id);

                                    return (
                                        <TableRow
                                            key={order.id}
                                            hover
                                            selected={isSelected}
                                            onClick={() => handleRowClick(order.id)}
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                                },
                                                ...(isSelected && {
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                                }),
                                            }}
                                        >
                                            {!hideCheckboxes && (
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={() => onOrderToggle(order.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </TableCell>
                                            )}

                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {order.id}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {fDate(order.dateCreated)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2">
                                                    {order.customerName}
                                                </Typography>
                                                {order.note && (
                                                    <Typography variant="caption" color="text.secondary" noWrap>
                                                        {order.note}
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {fCurrency(order.total)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {order.items.length} termék
                                                </Typography>
                                            </TableCell>

                                            <TableCell align='center'>
                                                <Label
                                                    color={getOrderStatusColor(order.orderStatus) as any}
                                                    variant="soft"
                                                >
                                                    {getOrderStatusLabel(order.orderStatus)}
                                                </Label>
                                            </TableCell>

                                            <TableCell align='right'>
                                                {order.shipmentId ? (
                                                    <Chip
                                                        label={fDate(order.plannedShippingDateTime)}
                                                        size="small"
                                                        color="default"
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Nincs hozzárendelve
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {filteredOrders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {searchQuery ? 'Nincs találat a keresésre.' : 'Nincsenek elérhető rendelések.'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>
            </Box>

            {selectedOrders.length > 0 && (
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.neutral' }}>
                    <Typography variant="body2" color="text.secondary">
                        {selectedOrders.length} rendelés kiválasztva {filteredOrders.length} közül
                    </Typography>
                </Box>
            )}
        </Card>
    );
}