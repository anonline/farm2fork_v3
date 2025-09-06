'use client';

import { Box, Grid, Skeleton, Stack } from '@mui/material';

import { Image } from '../image';
import { on } from 'events';

// ----------------------------------------------------------------------

interface ProductGalleryProps {
    images?: string[];
    loading?: boolean;
    productName?: string;
}

export default function ProductGallery({ images, loading, productName }: ProductGalleryProps) {

    const heights = {
        single: 640,
        two: {
            one: 640,
            two: 640,
        },
        three: {
            one: 640,
            two: 420,
            three: 205,
        },
    };

    if (loading) {
        return <ProductGallerySkeleton />;
    }

    if (!images || images.length === 0) {
        return null;
    }

    const renderSingleImage = () => (
        <Grid container spacing={2} sx={{ width: '100%' }}>
            <Grid size={{ xs: 12, md: 12 }} sx={{height: `${heights.single}px`}}>
            <Image
                alt={productName ?? 'Product image'}
                src={images[0]}
                sx={{
                    borderRadius: '8px',
                    width: '100%',
                    height: `${heights.single}px`,
                }}
            />
            </Grid>
        </Grid>
    );

    const renderTwoImages = () => (
        <Grid container spacing={2}
            sx={{
                   width: '100%',
            }}
        >
            <Grid size={{ xs: 12, md: 8 }} sx={{ height: `${heights.two.one}px` }}>
            <Image
                alt={`${productName ?? 'Product'} image 1`}
                src={images[0]}
                sx={{
                    borderRadius: '8px',
                    width: '100%',
                    height: `${heights.two.one}px`,
                }}
            />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ height: `${heights.two.two}px` }}>
            <Image
                alt={`${productName ?? 'Product'} image 2`}
                src={images[1]}
                sx={{
                    borderRadius: '8px',
                    width: '100%',
                    height: `${heights.two.two}px`,
                }}
            />
            </Grid>
        </Grid>
    );

    const renderThreeImages = () => (
        <Grid container spacing={2}
            sx={{
                width: '100%',
                height: '100%',
                maxHeight: `${heights.single}px`,
            }}
        >
            <Grid size={{ xs: 12, md: 8 }} sx={{ height: `${heights.three.one}px` }}>
                <Image
                    alt={`${productName ?? 'Product'}`}
                    src={images[0]}
                    ratio="16/9"
                    sx={{
                        borderRadius: '8px',
                        width: '100%',
                        height: `${heights.three.one}px`,
                    }}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ height: `${heights.three.one}px` }}>
                <Stack spacing={2}>
                    <Image
                        alt={`${productName ?? 'Product'}`}
                        src={images[1]}
                        sx={{
                            borderRadius: '8px',
                            width: '100%',
                            objectFit: 'cover',
                            height: `${heights.three.two}px`,
                        }}
                    />
                    <Image
                        alt={`${productName ?? 'Product'}`}
                        src={images[2]}
                        sx={{
                            borderRadius: '8px',
                            width: '100%',
                            height: `${heights.three.three}px`,
                        }}
                    />
                </Stack>
            </Grid>
        </Grid>
    );

    const renderGallery = () => {
        switch (images.length) {
            case 1:
                return renderSingleImage();
            case 2:
                return renderTwoImages();
            case 3:
            default:
                return renderThreeImages();
        }
    };

    return (
        <Box
            sx={{
                width: '100%',
                marginY: 4,
                display: 'flex',
                justifyContent: 'center',
                maxHeight: '640px',
                minHeight: '640px',
            }}
        >
            {renderGallery()}
        </Box>
    );
}

// ----------------------------------------------------------------------

function ProductGallerySkeleton() {
    return (
        <Box
            sx={{
                width: '100%',
                marginY: 4,
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '70% 30%',
                    gap: 2,
                    width: '100%',
                }}
            >
                <Skeleton
                    variant="rectangular"
                    sx={{
                        borderRadius: '8px',
                        width: '100%',
                        height: '640px',
                    }}
                />
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateRows: '2fr 1fr',
                        gap: 2,
                        height: '640px',
                    }}
                >
                    <Skeleton
                        variant="rectangular"
                        sx={{
                            borderRadius: '8px',
                            width: '100%',
                            height: '420px',
                        }}
                    />
                    <Skeleton
                        variant="rectangular"
                        sx={{
                            borderRadius: '8px',
                            width: '100%',
                            height: '205px',
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}
