import type { IOrderItem } from 'src/types/order';
import type { IDateValue } from 'src/types/common';
import type { IOrderData, PaymentStatus } from 'src/types/order-management';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDateTime } from 'src/utils/format-time';
import { generateShippingLabelPDF } from 'src/utils/pdf-generator';

import { useGetPickupLocations } from 'src/actions/pickup-location';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { StatusSplitButton } from 'src/components/status-split-button';
import { DeliveryGuySplitButton } from 'src/components/delivery-guy-split-button';

// ----------------------------------------------------------------------

type DeliveryGuyOption = {
    id: number;
    name: string;
};

type Props = {
    readonly status?: string;
    readonly backHref: string;
    readonly orderNumber?: string;
    readonly createdAt?: IDateValue;
    readonly order?: IOrderItem;
    readonly orderData: IOrderData | null;
    readonly onChangeStatus: (newValue: string) => void;
    readonly statusOptions: { value: string; label: string }[];
    readonly onChangePaymentStatus?: (newValue: PaymentStatus) => void;
    readonly paymentStatusOptions?: { value: string; label: string }[];
    readonly onStartEdit?: () => void;
    readonly isEditing?: boolean;
    readonly deliveryGuys?: DeliveryGuyOption[];
    readonly currentDeliveryGuyId?: number | null;
    readonly onChangeDeliveryGuy?: (newDeliveryGuyId: number | null) => void;
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
    onChangePaymentStatus,
    paymentStatusOptions,
    onStartEdit,
    isEditing,
    deliveryGuys = [],
    currentDeliveryGuyId,
    onChangeDeliveryGuy,
}: Props) {
    const paymentMenuActions = usePopover();
    const { locations: pickupLocations } = useGetPickupLocations();

    const handleGeneratePDF = async () => {
        if (!order) {
            toast.error('Nincs rendelési adat a PDF generálásához');
            return;
        }

        try {
            toast.info('PDF generálása folyamatban...');
            await generateShippingLabelPDF(order, pickupLocations);
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

    const renderPaymentMenuActions = () => (
        <CustomPopover
            open={paymentMenuActions.open}
            anchorEl={paymentMenuActions.anchorEl}
            onClose={paymentMenuActions.onClose}
            slotProps={{ arrow: { placement: 'top-right' } }}
        >
            <MenuList>
                {paymentStatusOptions?.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={option.value === orderData?.paymentStatus}
                        onClick={() => {
                            paymentMenuActions.onClose();
                            onChangePaymentStatus?.(option.value as PaymentStatus);
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
        if (status === 'inprogress' || status === 'processing') return 'Feldolgozva';
        if (status === 'delivered') return 'Teljesítve';
        if (status === 'shipping') return 'Szállítás alatt';
        if (status === 'cancelled') return 'Törölve';
        return 'Ismeretlen';
    };

    const renderActionStatusLabels = () => {
        if (status === 'pending') return 'Feldolgozás';
        if (status === 'inprogress' || status === 'processing') return 'Kiszállítás';
        if (status === 'shipping') return 'Kézbesítés';
        if (status === 'delivered') return 'Kézbesítve';
        if (status === 'cancelled') return 'Újra nyitás';
        if (status === 'refunded') return 'Újra nyitás';
        return 'Ismeretlen';
    };

    const renderPaymentStatusLabel = () => {
        if (orderData?.paymentStatus === 'pending') return ('Nincs fizetve');
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
                            <Button
                                size="small"
                                variant="soft"
                                color={
                                    (status === 'completed' && 'success') ||
                                    (status === 'pending' && 'warning') ||
                                    (status === 'processing' && 'success') ||
                                    (status === 'cancelled' && 'error') ||
                                    'inherit'
                                }
                                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                            >
                                {renderStatusLabel()}
                            </Button>
                            {onChangePaymentStatus && paymentStatusOptions ? (
                                <Button
                                    size="small"
                                    variant="soft"
                                    color={
                                        (orderData?.paymentStatus === 'closed' && 'success') ||
                                        (orderData?.paymentStatus === 'pending' && 'warning') ||
                                        (orderData?.paymentStatus === 'paid' && 'info') ||
                                        (orderData?.paymentStatus === 'failed' && 'error') ||
                                        'inherit'
                                    }
                                    sx={{
                                        display: { xs: 'none', sm: 'inline-flex' },
                                        minWidth: 'auto',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            opacity: 0.8,
                                        },
                                    }}
                                    onClick={paymentMenuActions.onOpen}
                                >
                                    {renderPaymentStatusLabel()}
                                </Button>
                            ) : (
                                <Label
                                    variant="soft"
                                    color={
                                        (orderData?.paymentStatus === 'closed' && 'success') ||
                                        (orderData?.paymentStatus === 'pending' && 'warning') ||
                                        (orderData?.paymentStatus === 'paid' && 'info') ||
                                        (orderData?.paymentStatus === 'failed' && 'error') ||
                                        'default'
                                    }
                                    sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                                >
                                    {renderPaymentStatusLabel()}
                                </Label>
                            )}
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
                    <StatusSplitButton
                        currentStatus={status || 'pending'}
                        statusOptions={statusOptions}
                        onChangeStatus={onChangeStatus}
                        color="inherit"
                        variant="contained"
                        renderLabel={renderActionStatusLabels}
                    />



                    {deliveryGuys && onChangeDeliveryGuy && (
                        <DeliveryGuySplitButton
                            currentDeliveryGuyId={currentDeliveryGuyId || null}
                            deliveryGuys={deliveryGuys}
                            onChangeDeliveryGuy={onChangeDeliveryGuy}
                            color="inherit"
                            variant="outlined"
                        />
                    )}

                    {order?.shipmentId && (
                        <Tooltip title="Összesítő">
                            <IconButton
                                color="inherit"
                                href={paths.dashboard.shipments.details(order.shipmentId)}
                            >
                                <Iconify icon="solar:file-text-bold" />
                            </IconButton>
                        </Tooltip>
                    )}

                    <Tooltip title="Szállítólevél">
                        <IconButton
                            color="error"
                            onClick={handleGeneratePDF}
                            disabled={!order}
                        >
                            <Iconify icon="solar:printer-minimalistic-bold" />
                        </IconButton>
                    </Tooltip>

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

            {renderPaymentMenuActions()}
        </>
    );
}
