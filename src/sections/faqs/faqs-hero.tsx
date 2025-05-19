import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import { Typography } from '@mui/material';


// ----------------------------------------------------------------------

export function FaqsHero({ sx, ...other }: BoxProps) {
    return (
        <Box
            component="section"
            sx={[
                (theme) => ({
                    height: { md: 160 },
                    py: { xs: 10, md: 0 },
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
            <Typography variant="h1" sx={{ textTransform: 'uppercase', my: 5 }}>
                Gyakran ismételt kérdések
            </Typography>
        </Box>
    );
}
