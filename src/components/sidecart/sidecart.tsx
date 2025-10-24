import type { ICheckoutItem } from 'src/types/checkout';

import { useTheme } from '@mui/material/styles';
import {
    Box,
    Stack,
    Alert,
    Drawer,
    Button,
    Divider,
    Tooltip,
    Typography,
    IconButton,
    useMediaQuery,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';

import { themeConfig } from 'src/theme';
import { useGetOption } from 'src/actions/options';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { NumberInput } from 'src/components/number-input';

import { useCheckoutContext } from 'src/sections/checkout/context';

import { useAuthContext } from 'src/auth/hooks';

import { OptionsEnum } from 'src/types/option';

import F2FIcons from '../f2ficons/f2ficons';

// ----------------------------------------------------------------------

type SideCartProps = {
    open: boolean;
    onClose: () => void;
};

export function SideCart({ open, onClose }: Readonly<SideCartProps>) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, authenticated } = useAuthContext();

    const {
        state: checkoutState,
        onDeleteCartItem,
        onChangeItemQuantity,
        onAddNote,
        onDeleteNote,
    } = useCheckoutContext();

    // Determine user type for minimum purchase check
    const getUserType = () => {
        if (!authenticated) return 'public';
        if (user?.user_metadata?.is_admin) return 'public'; // admin treated as public
        if (user?.user_metadata?.is_vip) return 'vip';
        if (user?.user_metadata?.is_corp) return 'company';
        return 'public';
    };

    const userType = getUserType();

    // Get the appropriate minimum purchase option based on user type
    const getMinimumPurchaseOption = () => {
        switch (userType) {
            case 'vip':
                return OptionsEnum.MinimumPurchaseForVIP;
            case 'company':
                return OptionsEnum.MinimumPurchaseForCompany;
            default:
                return OptionsEnum.MinimumPurchaseForPublic;
        }
    };

    const { option: minimumPurchaseAmount } = useGetOption(getMinimumPurchaseOption());

    const isCartEmpty = !checkoutState.items.length;
    const isUnderMinimum = minimumPurchaseAmount && checkoutState.subtotal < minimumPurchaseAmount;

    const getSubtotalToShow = () => {
        if (userType === 'vip' || userType === 'company') {
            return checkoutState.items.reduce((total, item) => total + item.netPrice * item.quantity, 0);
        }

        return checkoutState.subtotal;
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: isMobile ? '100vw' : 520,
                        height: isMobile ? '100dvh' : '100vh', // Use dynamic viewport height on mobile
                        maxHeight: isMobile ? '100dvh' : '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        // Ensure proper mobile viewport handling
                        ...(isMobile && {
                            '@supports (height: 100dvh)': {
                                height: '100dvh',
                                maxHeight: '100dvh',
                            },
                            // Fallback for older browsers
                            '@supports not (height: 100dvh)': {
                                height: '100vh',
                                maxHeight: '100vh',
                            },
                        }),
                    },
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 3,
                    position: 'relative',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                }}
            >
                <Typography sx={{ fontWeight: 700, fontFamily: themeConfig.fontFamily.bricolage, fontSize: '18px', textTransform: 'uppercase' }}>
                    Kosár{' '}
                    {checkoutState.items.length > 0
                        ? '(' + checkoutState.items.length + ' db)'
                        : ''}
                </Typography>

                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 10,
                    }}
                >
                    <Iconify icon="mingcute:close-line" />
                </IconButton>

                {/* Minimum Purchase Alert */}
                {!isCartEmpty && isUnderMinimum && (
                    <Alert
                        severity="warning"
                        sx={{
                            mt: 2,
                            '& .MuiAlert-message': {
                                fontSize: '14px',
                            },
                        }}
                    >
                        A minimum rendelési összeg {fCurrency(minimumPurchaseAmount)}. Módosítsd a
                        kosarad tartalmát itt, vagy adj hozzá termékeket!
                    </Alert>
                )}
            </Box>

            {/* Cart Items */}
            <Box
                sx={{
                    flex: 1,
                    overflow: 'hidden',
                    // Ensure proper mobile scrolling
                    ...(isMobile && {
                        minHeight: 0, // Allow flex item to shrink
                        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                    }),
                }}
            >
                {isCartEmpty ? (
                    <Box
                        sx={{
                            p: 3,
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                        }}
                    >
                        <Iconify
                            icon="solar:cart-3-bold"
                            width={64}
                            sx={{ color: 'text.disabled', mb: 2 }}
                        />
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            A kosár üres
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Nézd meg termékeinket és adj hozzá a kosárhoz!
                        </Typography>
                        <Button
                            component={RouterLink}
                            href={paths.product.root}
                            variant="contained"
                            sx={{ mt: 3 }}
                            onClick={onClose}
                        >
                            Termékek böngészése
                        </Button>
                    </Box>
                ) : (
                    <Scrollbar
                        sx={{
                            height: '100%',
                            // Mobile-specific scrolling improvements
                            ...(isMobile && {
                                '& .simplebar-content-wrapper': {
                                    paddingBottom: 'env(safe-area-inset-bottom)', // Extra space for mobile safe areas
                                },
                                '& .simplebar-content': {
                                    minHeight: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                },
                            }),
                        }}
                    >
                        <Stack
                            spacing={0}
                            sx={{
                                p: 2,
                                // Add extra bottom padding on mobile to ensure content is not hidden
                                ...(isMobile && {
                                    pb: 3,
                                }),
                            }}
                        >
                            {checkoutState.items.map((item, index) => (
                                <Box key={item.id}>
                                    <SideCartItem
                                        item={item}
                                        onDeleteCartItem={onDeleteCartItem}
                                        onChangeItemQuantity={onChangeItemQuantity}
                                        onAddNote={onAddNote}
                                        onDeleteNote={onDeleteNote}
                                    />
                                    {index < checkoutState.items.length - 1 && (
                                        <Divider sx={{ my: 2 }} />
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Scrollbar>
                )}
            </Box>

            {/* Footer - Only show if cart has items */}
            {!isCartEmpty && (
                <Box
                    sx={{
                        p: 3,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        bgcolor: 'background.paper',
                        // Improve mobile positioning and safe area handling
                        ...(isMobile && {
                            pb: 'max(24px, env(safe-area-inset-bottom))', // Account for home indicator on iOS
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 1,
                            borderTop: `1px solid ${theme.palette.divider}`,
                            boxShadow: `0 -2px 8px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'}`,
                        }),
                    }}
                >
                    <Stack spacing={2}>
                        {/* Summary */}
                        <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Részösszeg
                                </Typography>
                                <Typography variant="subtitle2">
                                    {fCurrency(getSubtotalToShow())}
                                </Typography>
                            </Box>

                            {getUserType() !== 'public' && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        ÁFA
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        {fCurrency(checkoutState.subtotal - getSubtotalToShow())}
                                    </Typography>
                                </Box>
                            )}

                            {checkoutState.discount > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Kedvezmény
                                    </Typography>
                                    <Typography variant="subtitle2" color="error.main">
                                        -{fCurrency(checkoutState.discount)}
                                    </Typography>
                                </Box>
                            )}

                            {checkoutState.surcharge > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-start' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Zárolási felár
                                        </Typography>
                                        <Tooltip title="A végleges árat a rendelés feldolgozása után tudjuk pontosítani.">
                                            <span style={{ display: 'inline-block', marginLeft: '4px', paddingTop: '4px' }}>
                                                <F2FIcons name="InfoCircle" width={18} height={18} />
                                            </span>
                                        </Tooltip>
                                    </Box>
                                    <Typography variant="subtitle2">
                                        {fCurrency(checkoutState.surcharge)}
                                    </Typography>
                                </Box>
                            )}

                            <Divider />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Összesen
                                </Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: '28px' }}>
                                    kb. {fCurrency(checkoutState.subtotal + checkoutState.surcharge)}
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Actions */}
                        <Stack spacing={1.5}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1,
                                }}
                            >
                                <Iconify
                                    icon="solar:info-circle-bold"
                                    width={18}
                                    sx={{ color: 'text.secondary' }}
                                />
                                A végleges árat a rendelés feldolgozása után tudjuk pontosítani.
                            </Typography>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                component={RouterLink}
                                href={paths.product.checkout}
                                onClick={onClose}
                                color='primary'
                            >
                                Tovább a megrendeléshez
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            )}
        </Drawer>
    );
}

// ----------------------------------------------------------------------

type SideCartItemProps = {
    item: ICheckoutItem;
    onDeleteCartItem?: (itemId: string) => void;
    onChangeItemQuantity?: (itemId: string, quantity: number) => void;
    onAddNote?: (itemId: string, note: string) => void;
    onDeleteNote?: (itemId: string) => void;
    hideControl?: boolean;
};

export function SideCartItem({
    item,
    onDeleteCartItem,
    onChangeItemQuantity,
    onAddNote,
    onDeleteNote,
    hideControl = false,
}: Readonly<SideCartItemProps>) {
    const { user } = useAuthContext();

    const getUserType = () => {
        if (!user) return 'public';
        if (user?.user_metadata?.is_admin) return 'public';
        if (user?.user_metadata?.is_vip) return 'vip';
        if (user?.user_metadata?.is_corp) return 'company';
        return 'public';
    }

    const getPriceToShow = () => {
        const userType = getUserType();
        switch (userType) {
            case 'vip':
                return item.netPrice;
            case 'company':
                return item.netPrice;
            default:
                return item.grossPrice;
        }
    }

    const getSubtotalToShow = () => getPriceToShow() * item.quantity

    return (
        <Box sx={{ display: 'flex', gap: 2, p: 1, alignItems: 'center' }}>
            {/* Product Image */}
            <Box
                component="img"
                src={
                    item.coverUrl ||
                    'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp'
                }
                alt={item.name}
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: 1,
                    objectFit: 'cover',
                    bgcolor: 'background.neutral',
                    flexShrink: 0,
                }}
            />

            {/* Product Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {item.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {fCurrency(getPriceToShow())}/{item.unit || 'db'}
                </Typography>

                {/* Quantity and Delete */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NumberInput
                            disabled={hideControl}
                            value={item.quantity}
                            onChange={(_, newValue) => onChangeItemQuantity?.(item.id, newValue || item.minQuantity || 1)}
                            min={item.minQuantity || 1}
                            max={item.maxQuantity || 999}
                            step={item.stepQuantity || 0.1}
                            sx={{ width: 120 }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {fCurrency(getSubtotalToShow())}
                        </Typography>

                        {!hideControl && (
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => onDeleteCartItem?.(item.id)}
                            >
                                <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                            </IconButton>
                        )}
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}
