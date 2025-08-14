import { useTheme } from '@mui/material/styles';
import { Box, Stack, Drawer, Button, Divider, Typography, IconButton, useMediaQuery } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { useCheckoutContext } from 'src/sections/checkout/context';

// ----------------------------------------------------------------------

type SideCartProps = {
    open: boolean;
    onClose: () => void;
};

export function SideCart({ open, onClose }: SideCartProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const { 
        state: checkoutState, 
        onDeleteCartItem, 
        onChangeItemQuantity, 
        onAddNote, 
        onDeleteNote 
    } = useCheckoutContext();

    const isCartEmpty = !checkoutState.items.length;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: isMobile ? '100vw' : 420,
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            {/* Header */}
            <Box 
                sx={{ 
                    p: 3, 
                    position: 'relative', 
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper'
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Kosár ({checkoutState.totalItems})
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
            </Box>

            {/* Cart Items */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {isCartEmpty ? (
                    <Box 
                        sx={{ 
                            p: 3, 
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%'
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
                    <Scrollbar sx={{ height: '100%' }}>
                        <Stack spacing={0} sx={{ p: 2 }}>
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
                        bgcolor: 'background.paper'
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
                                    {fCurrency(checkoutState.subtotal)}
                                </Typography>
                            </Box>
                            
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

                            <Divider />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Összesen
                                </Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    {fCurrency(checkoutState.total)}
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Actions */}
                        <Stack spacing={1.5}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                component={RouterLink}
                                href={paths.product.checkout}
                                onClick={onClose}
                            >
                                Kosár megtekintése
                            </Button>
                            
                            <Button
                                fullWidth
                                variant="outlined"
                                size="medium"
                                component={RouterLink}
                                href={paths.product.root}
                                onClick={onClose}
                                startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                            >
                                Vásárlás folytatása
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
    item: any;
    onDeleteCartItem: (itemId: number) => void;
    onChangeItemQuantity: (itemId: number, quantity: number) => void;
    onAddNote: (itemId: number, note: string) => void;
    onDeleteNote: (itemId: number) => void;
};

function SideCartItem({ 
    item, 
    onDeleteCartItem, 
    onChangeItemQuantity,
    onAddNote,
    onDeleteNote 
}: Readonly<SideCartItemProps>) {
    return (
        <Box sx={{ display: 'flex', gap: 2, p: 1 }}>
            {/* Product Image */}
            <Box
                component="img"
                src={item.coverUrl ?? 'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp'}
                alt={item.name}
                sx={{
                    width: 80,
                    height: 80,
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
                    {fCurrency(item.price)}/{item.unit || 'db'}
                </Typography>

                {/* Quantity and Delete */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                            size="small"
                            onClick={() => onChangeItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                        >
                            <Iconify icon='eva:minus-circle-fill' width={16} />
                        </IconButton>
                        
                        <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'center' }}>
                            {item.quantity}
                        </Typography>
                        
                        <IconButton 
                            size="small"
                            onClick={() => onChangeItemQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.available}
                        >
                            <Iconify icon='solar:add-circle-bold' width={16} />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {fCurrency(item.subtotal)}
                        </Typography>
                        
                        <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => onDeleteCartItem(item.id)}
                        >
                            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                        </IconButton>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}