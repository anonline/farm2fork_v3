import type { IOrderItem } from 'src/types/order';
import type { IDateValue } from 'src/types/common';
import type { IOrderData } from 'src/types/order-management';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDateTime } from 'src/utils/format-time';
import { generateShippingLabelPDF } from 'src/utils/pdf-generator';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
    readonly status?: string;
    readonly backHref: string;
    readonly orderNumber?: string;
    readonly createdAt?: IDateValue;
    readonly order?: IOrderItem;
    readonly orderData: IOrderData | null;
    readonly onChangeStatus: (newValue: string) => void;
    readonly statusOptions: { value: string; label: string }[];
    readonly onStartEdit?: () => void;
    readonly isEditing?: boolean;
};

export function OrderDetailsToolbar({
    status,
    backHref,
    createdAt,
    orderNumber,
    statusOptions,
    onChangeStatus,
    order,
    orderData,
    onStartEdit,
    isEditing,
}: Props) {
    const menuActions = usePopover();

    const handleGeneratePDF = async () => {
        if (!order) {
            toast.error('Nincs rendelési adat a PDF generálásához');
            return;
        }

        try {
            toast.info('PDF generálása folyamatban...');
            await generateShippingLabelPDF(order);
            toast.success('Szállítólevél sikeresen letöltve!');
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            toast.error('PDF generálása sikertelen volt');
        }
    };

    const handleInvoiceDownload = () => {
        const invoiceData = orderData?.invoiceDataJson;
        if (invoiceData?.downloadUrl) {
            window.open(invoiceData.downloadUrl, '_blank');
            toast.success('Számla megnyitva új ablakban');
        } else {
            toast.error('Számla letöltési link nem elérhető');
        }
    };

    // Check if invoice data exists
    const hasInvoiceData = orderData?.invoiceDataJson && 
                          orderData.invoiceDataJson.success && 
                          orderData.invoiceDataJson.invoiceNumber;

    const renderMenuActions = () => (
        <CustomPopover
            open={menuActions.open}
            anchorEl={menuActions.anchorEl}
            onClose={menuActions.onClose}
            slotProps={{ arrow: { placement: 'top-right' } }}
        >
            <MenuList>
                {statusOptions.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={option.value === status}
                        onClick={() => {
                            menuActions.onClose();
                            onChangeStatus(option.value);
                        }}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </MenuList>
        </CustomPopover>
    );

    const renderStatusLabel = () => {
        if (status === 'pending') return 'Új';
        if (status === 'inprogress') return 'Feldolgozva';
        if (status === 'completed') return 'Teljesítve';
        if (status === 'cancelled') return 'Törölve';
        return 'Ismeretlen';
    };

    const renderPaymentStatusLabel = () => {
        if (orderData?.paymentStatus === 'pending') return 'Nincs fizetve';
        if (orderData?.paymentStatus === 'paid') return 'Foglalva';
        if (orderData?.paymentStatus === 'failed') return 'Sikertelen';
        if (orderData?.paymentStatus === 'refunded') return 'Visszatérítve';
        if (orderData?.paymentStatus === 'closed') return 'Fizetve';
        return 'Ismeretlen fizetési állapot';
    };

    return (
        <>
            <Box
                sx={{
                    gap: 3,
                    display: 'flex',
                    mb: { xs: 3, md: 5 },
                    flexDirection: { xs: 'column', md: 'row' },
                }}
            >
                <Box sx={{ gap: 1, display: 'flex', alignItems: 'flex-start' }}>
                    <IconButton component={RouterLink} href={backHref}>
                        <Iconify icon="eva:arrow-ios-back-fill" />
                    </IconButton>

                    <Stack spacing={0.5}>
                        <Box sx={{ gap: 1, display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h4"> Rendelés {orderNumber} </Typography>
                            <Label
                                variant="soft"
                                color={
                                    (status === 'completed' && 'success') ||
                                    (status === 'pending' && 'warning') ||
                                    (status === 'inprogress' && 'info') ||
                                    (status === 'cancelled' && 'error') ||
                                    'default'
                                }
                                sx={{display:{xs:'none', sm:'inline-flex'}}}
                            >
                                {renderStatusLabel()}
                            </Label>
                            <Label
                                variant="soft"
                                color={
                                    (orderData?.paymentStatus === 'closed' && 'success') ||
                                    (orderData?.paymentStatus === 'pending' && 'warning') ||
                                    (orderData?.paymentStatus === 'paid' && 'info') ||
                                    (orderData?.paymentStatus === 'failed' && 'error') ||
                                    'default'
                                }
                                sx={{display:{xs:'none', sm:'inline-flex'}}}
                            >
                                {renderPaymentStatusLabel()}
                            </Label>
                        </Box>

                        <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                            {fDateTime(createdAt)}
                        </Typography>
                    </Stack>
                </Box>

                <Box
                    sx={{
                        gap: 1.5,
                        flexGrow: 1,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        color="inherit"
                        variant="outlined"
                        endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                        onClick={menuActions.onOpen}
                        sx={{ textTransform: 'capitalize' }}
                    >
                        {renderStatusLabel()}
                    </Button>

                    {order?.shipmentId && (
                        <Button
                            color="inherit"
                            variant="outlined"
                            href={paths.dashboard.shipments.details(order.shipmentId)}
                            startIcon={<Iconify icon="solar:file-text-bold" />}
                        >
                            Összesítő
                        </Button>
                    )}

                    <Button
                        color="error"
                        variant="outlined"
                        startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
                        onClick={handleGeneratePDF}
                        disabled={!order}
                    >
                        Szállítólevél
                    </Button>

                    {hasInvoiceData && (
                        <Button
                            color="success"
                            variant="outlined"
                            startIcon={<Iconify icon="solar:file-text-bold" />}
                            onClick={handleInvoiceDownload}
                        >
                            {orderData?.invoiceDataJson?.invoiceNumber || 'Számla'}
                        </Button>
                    )}



                </Box>
            </Box>

            {renderMenuActions()}
        </>
    );
}
