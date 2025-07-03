'use client';

import { Box, Grid, Typography } from "@mui/material";

import { Image } from "src/components/image";

export default function HomeIntegrations() {
    const h2Style = {
        fontSize: { xs: "32px", md: "40px" },
        lineHeight: { xs: "40px", md: "48px" },
        textTransform: "uppercase",
        fontWeight: 600,
        textAlign: 'center', // Középre igazítjuk a címet is
        mb: { xs: 4, md: 5 },
    };

    // Létrehozunk egy tömböt 30 placeholder kép URL-lel
    const placeholderImg = "https://placehold.co/72";

    return (
        <Box sx={{ my: 5, py: 5}}>
            <Typography variant="h2" sx={h2Style}>Partnereink</Typography>
            <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center" alignItems="center">
                {Array.from({length:30}).map((_, index) => (
                    <Grid key={`partner-logo-${index}`+_} size={{ xs: 6, sm: 6, md: 2.4, lg: 1.2 }}>
                        <Image
                            src={placeholderImg}
                            alt={`Partner logo ${index + 1}`}
                            sx={{
                                width: '72px', 
                                height: '72px',
                                display: 'block',
                                mx: 'auto',
                                filter: 'grayscale(100%)',
                                opacity: 0.7,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    filter: 'grayscale(0%)',
                                    opacity: 1,
                                    transform: 'scale(1.1)'
                                }
                            }}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}