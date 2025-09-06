import type { IPickupLocation } from 'src/types/pickup-location';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Radio from '@mui/material/Radio';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type PickupLocationCardProps = {
    location: IPickupLocation;
    isSelected: boolean;
    value: number;
    onChange?: (locationId: number) => void;
};

export function PickupLocationCard({
    location,
    isSelected,
    value,
    onChange,
}: PickupLocationCardProps) {
    const handleChange = () => {
        if (onChange) {
            onChange(location.id);
        }
    };

    return (
        <Card
            sx={{
                mb: 2,
                border: isSelected ? '2px solid' : '1px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                cursor: onChange ? 'pointer' : 'default',
            }}
            onClick={onChange ? handleChange : undefined}
        >
            <CardContent sx={{ px: '12px !important', py: '12px !important' }}>
                <FormControlLabel
                    value={value}
                    control={<Radio checked={isSelected} />}
                    label={
                        <Box sx={{ width: '100%', pl: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {location.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {location.postcode} {location.city}, {location.address}
                                {location.note && (
                                    <Tooltip title={location.note} arrow>
                                        <IconButton size="small" sx={{ ml: 1 }}>
                                            <Iconify icon="solar:info-circle-bold" width={16} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Typography>
                        </Box>
                    }
                    sx={{ margin: 0, width: '100%' }}
                />
            </CardContent>
        </Card>
    );
}
