'use client';

import type { CardProps } from '@mui/material/Card';
import type { InvoiceHistoryItem } from 'src/actions/user-billing';

import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = CardProps & {
    invoices: InvoiceHistoryItem[];
};

export function AdminUserBillingHistory({ invoices, sx, ...other }: Props) {
    const showMore = useBoolean();

    const displayedInvoices = showMore.value ? invoices : invoices.slice(0, 8);

    return (
        <Card sx={sx} {...other}>
            <CardHeader title="Számlatörténet" />

            {invoices.length === 0 ? (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                        Nincsenek számlák
                    </Typography>
                </Box>
            ) : (
                <>
                    <Box
                        sx={{
                            px: 3,
                            pt: 3,
                            gap: 1.5,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {displayedInvoices.map((invoice) => (
                            <Box
                                key={invoice.invoiceId}
                                sx={{
                                    display: 'flex',
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    gap: { xs: 1, sm: 0 },
                                }}
                            >
                                <ListItemText
                                    primary={
                                        invoice.orderId ? (
                                            <Box
                                                component={RouterLink}
                                                href={paths.dashboard.order.details(invoice.orderId)}
                                                sx={{
                                                    color: 'primary.main',
                                                    textDecoration: 'none',
                                                    '&:hover': {
                                                        textDecoration: 'underline',
                                                    },
                                                }}
                                            >
                                                {invoice.invoiceNumber}
                                            </Box>
                                        ) : (
                                            invoice.invoiceNumber
                                        )
                                    }
                                    secondary={fDate(invoice.createdAt)}
                                    slotProps={{
                                        primary: { sx: { typography: 'body2', fontWeight: 600 } },
                                        secondary: {
                                            sx: { 
                                                mt: 0.5, 
                                                typography: 'caption', 
                                                color: 'text.disabled' 
                                            },
                                        },
                                    }}
                                    sx={{ flex: 1, minWidth: 0 }}
                                />

                                <Typography
                                    variant="body2"
                                    sx={{
                                        mr: { xs: 0, sm: 5 },
                                        fontWeight: 600,
                                        minWidth: { xs: 'auto', sm: 100 },
                                        textAlign: { xs: 'left', sm: 'right' },
                                    }}
                                >
                                    {fCurrency(invoice.totalAmount)}
                                </Typography>

                                {invoice.downloadUrl && (
                                    <Link
                                        href={invoice.downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        color="inherit"
                                        underline="always"
                                        variant="body2"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            textDecoration: 'none',
                                            gap: 0.5,
                                            minWidth: 50,
                                        }}
                                    >
                                        <Iconify icon="eva:cloud-download-fill" width={16} />
                                        PDF
                                    </Link>
                                )}
                            </Box>
                        ))}

                        <Divider sx={{ borderStyle: 'dashed' }} />
                    </Box>

                    {invoices.length > 8 && (
                        <Box sx={{ p: 2 }}>
                            <Button
                                fullWidth
                                size="small"
                                color="inherit"
                                startIcon={
                                    <Iconify
                                        width={16}
                                        icon={
                                            showMore.value
                                                ? 'eva:arrow-ios-upward-fill'
                                                : 'eva:arrow-ios-downward-fill'
                                        }
                                        sx={{ mr: -0.5 }}
                                    />
                                }
                                onClick={showMore.onToggle}
                            >
                                {showMore.value 
                                    ? 'Kevesebb mutatása' 
                                    : `További ${invoices.length - 8} számla mutatása`
                                }
                            </Button>
                        </Box>
                    )}
                </>
            )}
        </Card>
    );
}
