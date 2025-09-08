'use client';

import { Box, Grid, Link, Typography } from '@mui/material';

import { usePartners } from 'src/contexts/partners-context';

import { Image } from 'src/components/image';
import { themeConfig } from 'src/theme';

export default function HomeIntegrations() {
    const { partners } = usePartners();

    const h2Style = {
        fontSize: { xs: '32px', md: '38px' },
        lineHeight: { xs: '40px', md: '48px' },
        textTransform: 'uppercase',
        fontWeight: 600,
        textAlign: 'left',
        fontFamily: themeConfig.fontFamily.bricolage,
        mb: { xs: 4, md: 5 },
    };

    return (
        <Box sx={{ my: 5, py: 5 }}>
            <Typography variant="h2" sx={h2Style}>
                Partnereink
            </Typography>
            <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center" alignItems="center">
                {partners.map((partner) => (
                    <Grid key={partner.id} size={{ xs: 6, sm: 4, md: 2.4, lg: 1.2 }}>
                        <Link href={partner.link} target="_blank" rel="noopener noreferrer">
                            <Image
                                src={partner.imageUrl}
                                alt={partner.name}
                                sx={{
                                    width: '100%',
                                    height: 'auto',
                                    maxWidth: '72px',
                                    display: 'block',
                                    mx: 'auto',
                                    filter: 'grayscale(100%)',
                                    opacity: 0.7,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        filter: 'grayscale(0%)',
                                        opacity: 1,
                                        transform: 'scale(1.1)',
                                    },
                                }}
                            />
                        </Link>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
