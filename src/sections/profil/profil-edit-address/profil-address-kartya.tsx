import { useState } from "react";

import { Box, Chip, Paper, Stack, Button, Typography } from "@mui/material";

import F2FIcons from "src/components/f2ficons/f2ficons";

interface IAddress {
    id: number;
    type: 'shipping' | 'billing';
    name: string; address: string;
    phone: string; email?: string;
    taxNumber?: string;
    isDefault: boolean;
}

export default function ProfilAddressKartya({ address }: Readonly<{ address: IAddress }>) {
    const [isHovered, setIsHovered] = useState(false);
    const TextStyle = {
        fontSize: "16px",
        fontWeight: 500,
        lineHeight: "24px",
        color: "rgb(75, 75, 74)",
        letterSpacing: "0.14px"
    }

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Stack spacing={0.5}>
                <Typography sx={{
                    fontSize: "20px",
                    fontWeight: 700,
                    lineHeight: "28px",
                }}>
                    {address.name}
                </Typography>
                <Typography sx={TextStyle}>{address.address}</Typography>
                <Typography sx={TextStyle}>{address.phone}</Typography>
                {address.email && <Typography sx={TextStyle}>{address.email}</Typography>}
                {address.taxNumber && <Typography sx={TextStyle}>Adószám: {address.taxNumber}</Typography>}
            </Stack>
            <Stack spacing={1} alignItems="flex-end">
                {address.isDefault && <Chip label="Alapértelmezett cím" size="small" />}
                <Stack direction="row">
                    <Button 
                        variant="outlined" 
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        sx={{
                            borderColor: '#E0E0E0',
                            color: 'rgb(38, 38, 38)',
                            display: "flex",
                            flexDirection: "row",
                            fontSize: "16px",
                            fontWeight: 600,
                            lineHeight: "24px",
                            letterSpacing:"0.16px",
                            textTransform: 'none',
                            transition: 'all 0.2s ease-in-out',

                            '&:hover': {
                                backgroundColor: 'black',
                                color: 'white',
                                borderColor: 'black',
                            }
                        }}
                    >
                        <Box sx={{ pr: 1, pb:0.8, display: 'flex', alignItems: 'center' }}><F2FIcons name="EditPen" height={16} width={16} style={{color: isHovered ? 'white' : 'rgb(38, 38, 38)'}} /></Box>
                        <Box>Szerkesztés</Box>
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}