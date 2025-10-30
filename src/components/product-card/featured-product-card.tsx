'use client';

import type { IProductItem } from 'src/types/product';

import { useRouter } from 'next/navigation';

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { themeConfig } from 'src/theme';

import { useCheckoutContext } from 'src/sections/checkout/context';

import { useAuthContext } from 'src/auth/hooks';

import ProducerInfo from './producer-info';
import { ProductPriceDetails, ProductQuantitySelector } from './product-card';



interface FeaturedProductCardProps {
    product: IProductItem;
}

export default function FeaturedProductCard({ product }: Readonly<FeaturedProductCardProps>) {
    const { user } = useAuthContext();
    const { onAddToCart, state } = useCheckoutContext();
    const router = useRouter();

    const openProductPage = () => {
        router.push(paths.product.details(product.url));
    };

    const getNetPrice = () => {
        if (user?.user_metadata.is_vip) {
            return Math.min(product.netPriceVIP, product.netPriceVIP * (1 - (state.discountPercent || 0) / 100));
        }

        if (user?.user_metadata.is_corp) {
            return Math.min(product.netPriceCompany, product.netPriceCompany * (1 - (state.discountPercent || 0) / 100));
        }

        return Math.min(product.netPrice, product.netPrice * (1 - (state.discountPercent || 0) / 100));
    }

    const getVatPercent = () => {
        if (user?.user_metadata.is_vip) {
            return 0;
        }

        return product.vat;
    }

    const getGrossPrice = () => getNetPrice() * (1 + getVatPercent() / 100)

    const getPriceToDisplay = () =>{
        if (user?.user_metadata.is_vip || user?.user_metadata.is_corp) {
            return getNetPrice();
        }

        return getGrossPrice();
    }

    return (
        <Paper
            elevation={0}
            
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',

            }}
        >
            <Box
                onClick={openProductPage}
                sx={{
                    width: { xs: '100%', md: '50%' },
                    aspectRatio: '1/1',
                    cursor: 'pointer',
                    flexShrink: 0,
                    overflow: 'hidden',
                    maxHeight: { xs: 'none', md: 470 },
                    '& img': {
                        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                    },
                    '&:hover img': {
                        transform: 'scale(1.07)',
                    },
                }}
            >
                <img
                    src={product.featuredImage ?? 'https://placehold.co/640x472'}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </Box>

            <Box
                sx={{
                    px: { xs: 2, md: 5 },
                    py: { xs: 2, md: 5 },
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                }}
            >
                <Stack spacing={3}>
                    <Chip
                        label="Szezonális sztár"
                        size="small"
                        sx={{
                            width: 'fit-content',
                            color: 'rgb(13, 52, 95)',
                            backgroundColor: '#E3F2FD',
                            fontWeight: '600 !important',
                            fontSize: '14px !important',
                            px: 1,
                            py: 2,
                            '&:hover': {
                                backgroundColor: '#E3F2FD',
                            },
                        }}
                    />

                    <Typography
                        variant="h4"
                        onClick={openProductPage}
                        sx={{
                            cursor: 'pointer',
                            fontSize: '32px',
                            lineHeight: '40px',
                            fontWeight: 600,
                            color: '#262626',
                            fontFamily: themeConfig.fontFamily.bricolage,
                        }}
                    >
                        {product.name}
                    </Typography>

                    {product.shortDescription && product.shortDescription.trim().length > 0 &&(<Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontWeight: 400,
                            fontSize: '16px',
                            lineHeight: '24px',
                            marginBlockEnd: '14.4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            '& p': {
                                margin: 0,
                            },
                        }}
                        dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                    />)}

                    {product.producer && (
                        <ProducerInfo
                            name={product.producer.name}
                            location={product.producer.location}
                            img={product.producer.featuredImage}
                        />
                    )}
                </Stack>

                <Box sx={{ flexGrow: 1 }} />

                <Stack direction="column" spacing={1.5} alignItems="flex-start" sx={{ mt: 3 }}>
                    <ProductPriceDetails grossPrice={getPriceToDisplay()} unit={product.unit} cardText={product.cardText} />
                    <ProductQuantitySelector
                        product={product}
                        onAddToCart={onAddToCart}
                        unit={product.unit}
                        min={product.mininumQuantity}
                        max={product.maximumQuantity}
                        step={product.stepQuantity}
                        discountPercent={state.discountPercent || 0}
                        format="row"
                    />
                </Stack>
            </Box>
        </Paper>
    );
}
