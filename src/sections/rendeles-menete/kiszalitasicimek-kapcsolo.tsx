import { useState } from 'react';
import { ToggleButton, ToggleButtonGroup, Box, SxProps, Theme } from '@mui/material';

const toggleButtonStyle: SxProps<Theme> = {
    textTransform: 'none',
    border: 'none',
    paddingX: '24px',
    fontWeight: 600,
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
    width: {xs: '100%', '@media (min-width:767px)': { width: '49%' }},
    borderRadius: '8px !important',
    '&.Mui-selected': {
        backgroundColor: '#ffffff',
        color: '#111',
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    },
    '&:not(.Mui-selected):hover': {
        backgroundColor: '#ffffff',
        color: '#333',
    },
    '&:not(.Mui-selected):active': {
        backgroundColor: '#ffffff',
        color: '#111',
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    },
};


export default function DeliveryMethodToggle() {
    const [deliveryMethod, setDeliveryMethod] = useState('hazhozszallitas');

    const handleDeliveryChange = (
        event: React.MouseEvent<HTMLElement>,
        newMethod: string | null,
    ) => {
        if (newMethod !== null) {
            setDeliveryMethod(newMethod);
        }
    };

    return (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
                value={deliveryMethod}
                exclusive
                onChange={handleDeliveryChange}
                aria-label="szállítási mód"
                sx={{
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px',
                    padding: '5px',
                    border: '1px solid #e0e0e0',
                    width: "100%",
                    flexDirection: { xs: 'column', md: 'row' },
                    display: "flex",

                }}
            >
                <ToggleButton
                    value="hazhozszallitas"
                    aria-label="házhozszállítás"
                    sx={toggleButtonStyle}
                >
                    Házhozszállítás
                </ToggleButton>

                <ToggleButton
                    value="atveteli_pontok"
                    aria-label="átvételi pontok"
                    sx={toggleButtonStyle}
                >
                    Átvételi pontok
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}