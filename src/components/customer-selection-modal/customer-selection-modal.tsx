'use client';

import type { IRole } from 'src/types/user';
import type { IOrderCustomer } from 'src/types/order';
import type { ICustomerData } from 'src/types/customer';

import { useState, useEffect, useCallback } from 'react';

import {
    Box,
    List,
    Alert,
    Dialog,
    Button,
    Avatar,
    ListItem,
    TextField,
    Typography,
    DialogTitle,
    ListItemText,
    DialogContent,
    DialogActions,
    ListItemButton,
    ListItemAvatar,
    InputAdornment,
    CircularProgress,
} from '@mui/material';

import { supabase } from 'src/lib/supabase';
import { getUsersRoles } from 'src/actions/user-ssr';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    onSelectCustomer: (customer: IOrderCustomer) => void;
    currentCustomerId?: string;
};

export function CustomerSelectionModal({
    open,
    onClose,
    onSelectCustomer,
    currentCustomerId,
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState<ICustomerData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<ICustomerData | null>(null);
    const [roles, setRoles] = useState<IRole[]>([]);

    const searchCustomers = useCallback(async (search: string) => {
        if (!search || search.length < 2) {
            setCustomers([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: searchError } = await supabase
                .from('CustomerDatas')
                .select('*')
                .or(`firstname.ilike.%${search}%,lastname.ilike.%${search}%,companyName.ilike.%${search}%`)
                .limit(20);

            if (searchError) {
                throw new Error(searchError.message);
            }

            setRoles(await getUsersRoles());

            setCustomers(data || []);
        } catch (err) {
            console.error('Error searching customers:', err);
            setError(err instanceof Error ? err.message : 'Hiba történt a keresés során');
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const getUserRole = (uid: string) => roles.find(role => role.uid === uid) || { is_admin: false, is_vip: false, is_corp: false, uid }

    const isVip = (customer: ICustomerData) => {
        const role = getUserRole(customer.uid || customer.id.toString());
        return role.is_vip;
    }

    const isCompany = (customer: ICustomerData) => {
        const role = getUserRole(customer.uid || customer.id.toString());
        return role.is_corp;
    }

    const isAdmin = (customer: ICustomerData) => {
        const role = getUserRole(customer.uid || customer.id.toString());
        return role.is_admin;
    }

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchCustomers(searchTerm);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, searchCustomers]);

    const handleCustomerSelect = useCallback((customer: ICustomerData) => {
        setSelectedCustomer(customer);
    }, []);

    const handleConfirm = useCallback(() => {
        if (!selectedCustomer) return;

        // Convert ICustomerData to IOrderCustomer format
        const orderCustomer: IOrderCustomer = {
            id: selectedCustomer.uid || selectedCustomer.id.toString(),
            name: `${selectedCustomer.lastname || ''} ${selectedCustomer.firstname || ''}`.trim() || 
                  'Névtelen vásárló',
            email: selectedCustomer.billingAddress?.[0]?.email || '', // Get email from billing address if available
            avatarUrl: '',
            ipAddress: '',
            userType: isCompany(selectedCustomer) && 'company' || isVip(selectedCustomer) && 'vip' || 'public',
        };

        onSelectCustomer(orderCustomer);
        handleClose();
    }, [selectedCustomer, onSelectCustomer]);

    const handleClose = useCallback(() => {
        setSearchTerm('');
        setCustomers([]);
        setSelectedCustomer(null);
        setError(null);
        onClose();
    }, [onClose]);

    const renderCustomerItem = (customer: ICustomerData) => {
        const customerName = `${customer.lastname || ''} ${customer.firstname || ''}`.trim() || 
                           'Névtelen vásárló';
        
        const isCurrentCustomer = customer.uid === currentCustomerId || 
                                customer.id.toString() === currentCustomerId;
        
        const isSelected = selectedCustomer?.id === customer.id;

        return (
            <ListItem key={customer.id} disablePadding>
                <ListItemButton
                    selected={isSelected}
                    onClick={() => handleCustomerSelect(customer)}
                    disabled={isCurrentCustomer}
                >
                    <ListItemAvatar>
                        <Avatar
                            color={
                                (isCompany(customer) && 'primary' ) ||
                                (isVip(customer) && 'warning' ) ||
                                (isAdmin(customer) && 'error') || 'default'
                            }
                        >
                            <Iconify
                                icon={(isCompany(customer) && 'solar:buildings-3-line-duotone') || 
                                    (isVip(customer) && 'eva:star-fill') || 
                                    (isAdmin(customer) && 'solar:shield-check-bold') || 
                                    'solar:user-rounded-bold' }
                                width={24}
                                height={24}
                            />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2">
                                    {customerName}
                                </Typography>
                                {isCurrentCustomer && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'primary.main',
                                            bgcolor: 'primary.alpha8',
                                            px: 1,
                                            py: 0.25,
                                            borderRadius: 1,
                                        }}
                                    >
                                        Jelenlegi
                                    </Typography>
                                )}
                            </Box>
                        }
                        secondary={
                            <Typography variant="body2" color="text.secondary">
                                {isCompany(customer) && 'Céges vásárló'}
                                {isVip(customer) && 'VIP'}
                                {isAdmin(customer) && 'Admin'}
                                {!isCompany(customer) && !isVip(customer) && !isAdmin(customer) && 'Magánszemély'}
                                {customer.billingAddress?.[0]?.email && ` • ${customer.billingAddress[0].email}`}
                            </Typography>
                        }
                    />
                </ListItemButton>
            </ListItem>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { height: '80vh' },
            }}
        >
            <DialogTitle>
                Vásárló kiválasztása
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Keresés név vagy cégnév alapján..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Iconify icon="eva:search-fill" />
                                </InputAdornment>
                            ),
                            endAdornment: loading && (
                                <InputAdornment position="end">
                                    <CircularProgress size={20} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {searchTerm.length < 2 && !error && (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 4,
                            color: 'text.secondary',
                        }}
                    >
                        <Iconify
                            icon="eva:search-fill"
                            width={48}
                            height={48}
                            sx={{ mb: 2, opacity: 0.5 }}
                        />
                        <Typography variant="body2">
                            Írjon be legalább 2 karaktert a kereséshez
                        </Typography>
                    </Box>
                )}

                {searchTerm.length >= 2 && customers.length === 0 && !loading && !error && (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 4,
                            color: 'text.secondary',
                        }}
                    >
                        <Iconify
                            icon="solar:file-text-bold"
                            width={48}
                            height={48}
                            sx={{ mb: 2, opacity: 0.5 }}
                        />
                        <Typography variant="body2">
                            Nincs találat a keresési feltételekhez
                        </Typography>
                    </Box>
                )}

                {customers.length > 0 && (
                    <Scrollbar sx={{ maxHeight: 400 }}>
                        <List disablePadding>
                            {customers.map(renderCustomerItem)}
                        </List>
                    </Scrollbar>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>
                    Mégse
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!selectedCustomer}
                >
                    Kiválasztás
                </Button>
            </DialogActions>
        </Dialog>
    );
}