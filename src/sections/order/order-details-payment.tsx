import type { IPaymentMethod } from 'src/types/payment-method';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';

import { fCurrency } from 'src/utils/format-number';

import { useGetPaymentMethods } from 'src/actions/payment-method';

import { Iconify } from 'src/components/iconify';


// ----------------------------------------------------------------------

type Props = {
    paymentMethod?: IPaymentMethod | null;
    simplepayDataJson?: string | null;
    onPaymentMethodChange?: (paymentMethodId: number) => void;
    editable?: boolean;
};

type SimplePayResponse = {
    r: number, //válasz kód
    t: number, // tranzakciós azonosító
    e: string, // hibaüzenet
    m: string, // státusz üzenet
    o: string // egyéb információ
}

export function OrderDetailsPayment({
    paymentMethod,
    simplepayDataJson,
    onPaymentMethodChange,
    editable = false
}: Readonly<Props>) {
    const { methods: paymentMethods, methodsLoading } = useGetPaymentMethods();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethod?.id || '');

    const handlePaymentMethodChange = (paymentMethodId: number) => {
        setSelectedPaymentMethod(paymentMethodId);
        onPaymentMethodChange?.(paymentMethodId);
    };

    const getPaymentMethodIcon = (method: IPaymentMethod) => {
        switch (method.type) {
            case 'online':
                return 'solar:cart-3-bold';
            case 'cod':
                return 'solar:wad-of-money-bold';
            case 'wire':
                return 'solar:inbox-bold';
            default:
                return 'solar:heart-bold';
        }
    };

    const getPaymentMethodColor = (method: IPaymentMethod) => {
        switch (method.type) {
            case 'online':
                return 'primary';
            case 'cod':
                return 'warning';
            case 'wire':
                return 'info';
            default:
                return 'default';
        }
    };

    // Helper function to render SimplePay data in a user-friendly format
    const renderSimplePayData = (data: SimplePayResponse) => {

        const getDisplayLabel = (key: string) => {
            const labels: Record<string, string> = {
                // SimplePay Success Response fields (matching the type)
                r: 'Válasz kód',
                t: 'Tranzakció azonosító',
                e: 'Állapot',
                m: 'Státusz üzenet',
                o: 'További információ',

                // Payment response fields
                transactionId: 'Tranzakció azonosító',
                orderRef: 'Rendelés hivatkozás',
                merchant: 'Kereskedő',
                timeout: 'Időtúllépés',
                total: 'Összeg',
                paymentUrl: 'Fizetési URL',
                currency: 'Pénznem',
                salt: 'Biztonsági hash',

                // Finish response fields
                originalTotal: 'Eredeti összeg',
                approveTotal: 'Jóváhagyott összeg',
                status: 'Állapot',
                errorCodes: 'Hibakódok',

                // Other common fields
                timestamp: 'Időbélyeg',
                sdkVersion: 'SDK verzió',
            };

            return labels[key];
        };
        console.log(data);
        const entries = Object.entries(data);

        return (
            <Stack spacing={1.5}>
                {entries.map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', minWidth: 140 }}>
                            {getDisplayLabel(key)}:
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'right', wordBreak: 'break-word', maxWidth: 200 }}>
                            {value}
                        </Typography>
                    </Box>
                ))}
            </Stack>
        );
    };

    return (
        <Card>
            <CardHeader
                title="Fizetési mód"
                action={
                    editable && (
                        <IconButton>
                            <Iconify icon="solar:pen-bold" />
                        </IconButton>
                    )
                }
            />
            <CardContent>
                {editable ? (
                    <FormControl fullWidth>
                        <InputLabel>Fizetési mód kiválasztása</InputLabel>
                        <Select
                            value={selectedPaymentMethod}
                            label="Fizetési mód kiválasztása"
                            onChange={(e) => handlePaymentMethodChange(Number(e.target.value))}
                            disabled={methodsLoading}
                        >
                            {paymentMethods.map((method) => (
                                <MenuItem key={method.id} value={method.id}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Iconify icon={getPaymentMethodIcon(method)} />
                                        <Typography variant="body2">{method.name}</Typography>
                                        {method.additionalCost > 0 && (
                                            <Typography variant="caption" color="text.secondary">
                                                (+{fCurrency(method.additionalCost)})
                                            </Typography>
                                        )}
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    paymentMethod && (
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Iconify icon={getPaymentMethodIcon(paymentMethod)} width={24} />
                                <Typography variant="body1" fontWeight="medium">
                                    {paymentMethod.name}
                                </Typography>
                                <Chip
                                    label={paymentMethod.type.toUpperCase()}
                                    color={getPaymentMethodColor(paymentMethod) as any}
                                    size="small"
                                />
                            </Box>

                            {paymentMethod.additionalCost > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    Plusz költség: {fCurrency(paymentMethod.additionalCost)}
                                </Typography>
                            )}
                        </Stack>
                    )
                )}

                {simplepayDataJson && (

                    <Box sx={{ p: 1 }}>
                        {renderSimplePayData(JSON.parse(simplepayDataJson))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
