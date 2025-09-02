import type { SxProps } from '@mui/material';

import { useState } from 'react';

import {
    Box,
    Stack,
    Button,
    Divider,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';

import F2FIcons from 'src/components/f2ficons/f2ficons';

import ProfilAddressKartya from './profil-address-kartya';
import NewBillingAddressForm from './new-billing-address';
import NewShippingAddressForm from './new-shipping-address';

interface IAddress {
    id: number;
    type: 'shipping' | 'billing';
    name: string;
    address: string;
    phone: string;
    email?: string;
    taxNumber?: string;
    isDefault: boolean;
}
const exampleAddresses: IAddress[] = [
    {
        id: 1,
        type: 'shipping',
        name: 'Urbán Admin Erik',
        address: '2942 Nagyigmánd Jókai u. 42',
        phone: '06302751483',
        isDefault: true,
    },
    {
        id: 2,
        type: 'shipping',
        name: 'Urbán Tibor Erik',
        address: '1111 Nagycsád Kert utca. 8',
        phone: '+36302751483',
        isDefault: false,
    },
    {
        id: 3,
        type: 'billing',
        name: 'Urbán Tibor Erik (Urbán Tibor Erik e.v.)',
        address: '2942 Nagyigmánd Jókai u. 38',
        phone: '+36302751483',
        email: 'tibor.urban+invoice@cryptonit.hu',
        taxNumber: '55769466-9-31',
        isDefault: true,
    },
];

export default function ProfilEditAddress() {
    const [addressType, setAddressType] = useState<'shipping' | 'billing'>('shipping');
    const [isAdding, setIsAdding] = useState(false);

    const filteredAddresses = exampleAddresses.filter((addr) => addr.type === addressType);

    const handleAddNewAddress = (data: any) => {
        console.log('Új cím mentése:', data);
        setIsAdding(false);
    };

    const toggleButtonStyle: SxProps = {
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: '24px',
        textTransform: 'none',
        border: '1px solid rgba(0,0,0,0)',
        borderRadius: '0px',
        px: 1,
        py: 1.5,
        color: 'text.secondary',
        '&.Mui-selected': {
            fontWeight: 700,
            borderBottom: '3px solid rgb(0, 0, 0)',
            backgroundColor: 'rgba(0, 0, 0, 0)',
        },
    };

    const renderContent = () => {
        if (isAdding) {
            if (addressType === 'shipping') {
                return (
                    <NewShippingAddressForm
                        onSave={handleAddNewAddress}
                        onCancel={() => setIsAdding(false)}
                    />
                );
            } else {
                return (
                    <NewBillingAddressForm
                        onSave={handleAddNewAddress}
                        onCancel={() => setIsAdding(false)}
                    />
                );
            }
        }

        return (
            <>
                <Box>
                    <ToggleButtonGroup
                        value={addressType}
                        exclusive
                        onChange={(e, newType) => {
                            if (newType) {
                                setAddressType(newType);
                                setIsAdding(false);
                            }
                        }}
                        sx={{
                            border: 'none',
                            '& .MuiToggleButtonGroup-grouped': { border: 0 },
                        }}
                    >
                        <ToggleButton value="shipping" sx={toggleButtonStyle}>
                            Szállítási cím
                        </ToggleButton>
                        <ToggleButton value="billing" sx={toggleButtonStyle}>
                            Számlázási cím
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Divider />
                </Box>
                <Stack spacing={2}>
                    {filteredAddresses.map((addr) => (
                        <ProfilAddressKartya key={addr.id} address={addr} />
                    ))}
                </Stack>
            </>
        );
    };

    return (
        <Stack spacing={3}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
            >
                <Typography fontWeight={700} sx={{ fontSize: '32px', lineHeight: '44px' }}>
                    Címadatok
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => setIsAdding(true)}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        letterSpacing: '0.16px',
                        fontWeight: 700,
                        fontSize: '16px',
                        lineHeight: '20px',
                        bgcolor: 'rgb(70, 110, 80)',
                        gap: 1,
                        '&:hover': { bgcolor: 'rgb(60, 90, 65)' },
                    }}
                >
                    <Box sx={{ pt: 0.5 }}>
                        <F2FIcons name="Add" height={14} width={16} style={{ color: 'white' }} />
                    </Box>
                    <Box>Új cím hozzáadása</Box>
                </Button>
            </Stack>

            {/* A feltételes logika most már itt, tisztán hívódik meg */}
            {renderContent()}
        </Stack>
    );
}
