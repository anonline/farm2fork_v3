'use client';

import type { IProductItem } from 'src/types/product';

import { useRouter } from 'next/navigation';

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

import { useCheckoutContext } from 'src/sections/checkout/context';

import F2FIcons from '../f2ficons/f2ficons';
import { ProductPriceDetails, ProductQuantitySelector } from './product-card';

function ProducerInfo({ name, location }: Readonly<{ name: string; location: string }>) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <img
                src="https://placehold.co/48"
                alt={name}
                style={{ width: 40, height: 40, borderRadius: '50%' }}
            />
            <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                    {name}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <F2FIcons name="Map" width={14} height={14} />
                    <Typography variant="body2" color="text.secondary">
                        {location}
                    </Typography>
                </Stack>
            </Box>
        </Stack>
    );
}

interface FeaturedProductCardProps {
    product: IProductItem;
}

export default function FeaturedProductCard({ product }: Readonly<FeaturedProductCardProps>) {
    const { onAddToCart } = useCheckoutContext();
    const router = useRouter();

    const openProductPage = () => {
        router.push(`/termekek/${product.url}`);
    };

    return (
        <Paper
            elevation={2}
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
                    width: { xs: '100%', md: '45%' },
                    aspectRatio: '1/1',
                    cursor: 'pointer',
                    flexShrink: 0,
                    overflow: 'hidden',
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
                    p: { xs: 2, md: 3 },
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
                            fontWeight: 600,
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
                        }}
                    >
                        {product.name}
                    </Typography>

                    <Typography
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
                        }}
                    >
                        {product.shortDescription}
                    </Typography>

                    <ProducerInfo name="Via Bona" location="Esztergom" />
                </Stack>

                <Box sx={{ flexGrow: 1 }} />

                <Stack direction="column" spacing={1.5} alignItems="flex-start" sx={{ mt: 3 }}>
                    <ProductPriceDetails price={product.netPrice} unit={product.unit} />
                    <ProductQuantitySelector
                        product={product}
                        onAddToCart={onAddToCart}
                        unit={product.unit}
                        min={product.mininumQuantity}
                        max={product.maximumQuantity}
                        step={product.stepQuantity}
                        format="row"
                    />
                </Stack>
            </Box>
        </Paper>
    );
}
