'use client';

import type { IProductItem } from 'src/types/product';

import { useRouter } from 'next/navigation';

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

import { useCheckoutContext } from 'src/sections/checkout/context';

import F2FIcons from '../f2ficons/f2ficons';
import { ProductPriceDetails, ProductQuantitySelector } from './product-card';
import { paths } from 'src/routes/paths';

function ProducerInfo({ name, location, img }: Readonly<{ name: string; location: string; img: string }>) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <img
                src={img || 'https://placehold.co/48x48'}
                alt={name}
                style={{ width: 40, height: 40, borderRadius: '50%' }}
            />
            <Box>
                <Typography variant="subtitle2" fontWeight={700} fontSize={16} lineHeight={'24px'} fontFamily={'Bricolage Grotesque'}>
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

interface FeaturedProductCardProps {
    product: IProductItem;
}

export default function FeaturedProductCard({ product }: Readonly<FeaturedProductCardProps>) {
    const { onAddToCart } = useCheckoutContext();
    const router = useRouter();

    const openProductPage = () => {
        router.push(paths.product.details(product.url));
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
                            fontWeight: '700 !important',
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
                            fontFamily: 'Bricolage Grotesque',
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
                    <ProductPriceDetails price={product.netPrice} unit={product.unit} cardText={product.cardText}/>
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
