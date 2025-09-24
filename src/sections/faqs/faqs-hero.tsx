import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

import { themeConfig } from 'src/theme';

// ----------------------------------------------------------------------

export function FaqsHero({ sx, ...other }: BoxProps) {
    return (
        <Box
            component="section"
            sx={[
                (theme) => ({
                    height: { md: 160 },
                    py: { xs: 10, md: 10 },
                    alignItems: 'center',
                    alignSelf: 'center',
                    width: '100%',
                    textAlign: 'center',
                    overflow: 'hidden',
                    border: `solid 0px ${theme.palette.divider}`,
                    position: 'relative',
                }),
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            <Typography sx={{ textTransform: 'uppercase', fontFamily: themeConfig.fontFamily.bricolage, fontWeight: '600', fontSize: { xs: '48px', md: '48px', lg: '64px' } }}>
                Gyakran ismételt kérdések
            </Typography>
        </Box>
    );
}
