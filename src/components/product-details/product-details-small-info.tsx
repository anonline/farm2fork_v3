'use client';

import type { IProductItem } from "src/types/product";

import { useRouter } from 'next/navigation';

import { Box, Grid, Button, Typography } from "@mui/material";

interface ProductDetailsSmallInfoProps {
    product: IProductItem | null;
}

export default function ProductDetailsSmallInfo({ product }: Readonly<ProductDetailsSmallInfoProps>) { 
    const router = useRouter();

    if (!product) {
        return null;
    }

    const titleStyle = {
        fontWeight: 700,
        textTransform: 'uppercase',
        mb: 1.5,
    };

    const buttonStyle = {
        mt: 2,
        alignSelf: 'flex-start',
        border: '2px solid black',
        color: 'black',
        fontWeight: 600,
        px: 2,
        py: 1,
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: 'rgb(70, 110, 80)',
            color: 'white',
            border: '2px solid rgb(70, 110, 80)',
        }
    };

    return (
        <Grid container spacing={{ xs: 3, md: 5 }} sx={{ my: 4 }}>
            {product.usageInformation && (
                <Grid size={{xs:12,md:6}}>
                    <Typography sx={titleStyle}>Felhasználás</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {product.usageInformation}
                    </Typography>
                </Grid>
            )}

            {product.storingInformation && (
                <Grid size={{xs:12,md:6}}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography sx={titleStyle}>Tárolás</Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                {product.storingInformation}
                            </Typography>
                        </Box>
                        <Button sx={buttonStyle} onClick={() => router.push('/tarolas')}>
                            Tovább a tároláshoz
                        </Button>
                    </Box>
                </Grid>
            )}
        </Grid>
    );
};