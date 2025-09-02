import type { ChangeEvent } from 'react';

import { useState } from 'react';

import { Box, Alert, TextField, InputAdornment } from '@mui/material';

import { useEnabledPostcodes } from 'src/contexts/postcode-context';

import F2FIcons from 'src/components/f2ficons/f2ficons';

export default function KiszallitasiCimekTerkep() {
    const searchSuccessStyle = {
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: '22px',
        color: 'rgb(60, 86, 56)',
    };

    const searchErrorStyle = {
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: '22px',
        color: 'rgb(136, 44, 51)',
    };

    const mapEmbedUrl =
        'https://www.google.com/maps/d/embed?mid=1Wpj3OxUVcJZ5Ohw-6iZ894PP-rrcyHB-&amp;ehbc=2E312F';

    const [found, setFound] = useState<boolean | null>(null);

    const { postcodes } = useEnabledPostcodes();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (newValue.trim().length < 4) {
            setFound(null);
            return;
        }

        if (postcodes.filter((x) => x.postcode == newValue).length > 0) {
            setFound(true);
        } else {
            setFound(false);
        }
    };
    return (
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <TextField
                fullWidth
                id="postcode-search"
                label="Irányítószám"
                variant="outlined"
                onChange={handleInputChange}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <F2FIcons name="Search2" height={22} width={22} />
                            </InputAdornment>
                        ),
                    },
                }}
            />

            {found !== null &&
                (found === true ? (
                    <Alert variant="standard" severity="success" sx={searchSuccessStyle}>
                        Az adott címre szállítunk
                    </Alert>
                ) : (
                    <Alert variant="standard" severity="error" sx={searchErrorStyle}>
                        Az adott irányítószámra jelenleg sajnos nem szállítunk ki. Kérjük, hogy nézz
                        szét az átvételi pontok között!
                    </Alert>
                ))}

            <Box
                sx={{
                    aspectRatio: { xs: 'initial', lg: '16/9' },
                    width: '100%',
                    height: { xs: '400px', md: '400px', lg: 'auto' },
                }}
            >
                <Box
                    component="iframe"
                    src={mapEmbedUrl}
                    title="Farm2Fork szállítási terület"
                    sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '8px',
                        border: 'none',
                    }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </Box>
        </Box>
    );
}
