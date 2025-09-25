import type { IOrderDelivery } from 'src/types/order';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';

import { useGetPickupLocations } from 'src/actions/pickup-location';

// ----------------------------------------------------------------------

type Props = {
    delivery?: IOrderDelivery;
    isEditable?: boolean;
};

export function OrderDetailsDelivery({ delivery, isEditable }: Readonly<Props>) {
    const pickuplocations = useGetPickupLocations();

    const selectedPickupLocation = (delivery?.shipBy == 'Személyes átvétel' && delivery?.address && pickuplocations?.locations.find(loc => loc.id.toString() === delivery.address?.id)) ?? null;

    return (
        <>
            <CardHeader
                title="Szállítási mód"
            />
            <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Szállítás módja
                    </Box>

                    {delivery?.shipBy}
                </Box>
            </Stack>

            {selectedPickupLocation && (
                <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box
                            component="span"
                            sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                        >
                            Átvételi pont
                        </Box>

                        {selectedPickupLocation?.name}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box
                            component="span"
                            sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                        >
                            Cím
                        </Box>

                        {selectedPickupLocation?.postcode} {selectedPickupLocation?.city} {selectedPickupLocation?.address}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box
                            component="span"
                            sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                        >
                            Megjegyzés
                        </Box>

                        {selectedPickupLocation?.note}
                    </Box>
                </Stack>
            )}
        </>
    );
}
