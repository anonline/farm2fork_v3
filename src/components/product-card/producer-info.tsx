import { Box, Stack, Typography } from "@mui/material";

import { themeConfig } from "src/theme";

import F2FIcons from "../f2ficons/f2ficons";

export default function ProducerInfo({ name, location, img }: Readonly<{ name: string; location: string; img: string }>) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <img
                src={img || 'https://placehold.co/48x48'}
                alt={name}
                style={{ width: 40, height: 40, borderRadius: '50%' }}
            />
            <Box>
                <Typography variant="subtitle2" fontWeight={700} fontSize={18} lineHeight="24px" fontFamily={themeConfig.fontFamily.bricolage}>
                    {name}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <F2FIcons name="Map" width={15} height={20} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px', fontWeight: 600, lineHeight: '20px' }}>
                        {location}
                    </Typography>
                </Stack>
            </Box>
        </Stack>
    );
}