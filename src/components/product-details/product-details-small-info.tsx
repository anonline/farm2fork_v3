'use client';

import type { IProductItem } from 'src/types/product';

import { useRouter } from 'next/navigation';

import { Box, Grid, Button, Typography } from '@mui/material';

import { themeConfig } from 'src/theme';
import { useTranslate } from 'src/locales';

interface ProductDetailsSmallInfoProps {
    product: IProductItem | null;
}

export default function ProductDetailsSmallInfo({
    product,
}: Readonly<ProductDetailsSmallInfoProps>) {
    const router = useRouter();
    const { t } = useTranslate('productpage');

    if (!product) {
        return null;
    }

    const titleStyle = {
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: { xs: '24px', md: '32px', lg: '40px' },
        fontFamily: themeConfig.fontFamily.bricolage,
        lineHeight: '48px',
        mb: 1.5,
    };

    const textStyle = {
        fontFamilye: themeConfig.fontFamily.primary,
        fontSize: { xs: '16px', md: '16px' },
        lineHeight: '28px',
        fontWeight: 500,
        whiteSpace: 'pre-line'
    }

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
        },
    };

    let usageText = product?.usageInformation?.trim();
        let storingText = product?.storingInformation?.trim();

        if (!usageText || !storingText) {
            if (product?.category && product?.category?.length > 0) {
                const cat = product.category[0];

                if (!usageText && cat.usageInformation) {
                    usageText = cat.usageInformation;
                }

                if (!storingText && cat.storingInformation) {
                    storingText = cat.storingInformation;
                }
            }
        }

    return (
        <Grid container spacing={{ xs: 3, md: 5 }} sx={{ my: 7 }}>
            {usageText && (
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography sx={titleStyle}>{t('usage')}</Typography>
                    <Typography variant="body1" sx={textStyle}>
                        {usageText}
                    </Typography>
                </Grid>
            )}

            {storingText && (
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography sx={titleStyle}>{t('storage')}</Typography>
                            <Typography variant="body1" sx={textStyle}>
                                {storingText}
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
}
