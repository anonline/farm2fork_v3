'use client';

import React, { useMemo, useState } from 'react';

import { Box, Grid, Button, Typography, CircularProgress } from '@mui/material';

import { CONFIG } from 'src/global-config';
import { useProducts } from 'src/contexts/products-context';
import { useInfiniteScroll } from 'src/hooks/use-infinite-scroll';

import ProductCard from 'src/components/product-card/product-card';

interface ProducerProductsProps {
    producerId: string;
    excludeProductId?: string;
}

export default function ProducerProducts({ producerId, excludeProductId }: Readonly<ProducerProductsProps>) {
    const { products, loading, error } = useProducts();
    const [displayedCount, setDisplayedCount] = useState(10);

    // Filter products for this producer
    const producerProducts = useMemo(
        () => products.filter((product) => product.producerId === producerId && product.id !== excludeProductId),
        [products, producerId, excludeProductId]
    );

    // Get currently displayed products
    const displayedProducts = useMemo(
        () => producerProducts.slice(0, displayedCount),
        [producerProducts, displayedCount]
    );

    const hasMore = displayedCount < producerProducts.length;
    const loadingMore = false; // Client-side pagination, so no loading state

    // Load more products
    const loadMore = () => {
        if (hasMore && !loading) {
            setDisplayedCount((prev) => prev + CONFIG.pagination.productsPerPage);
        }
    };

    // Set up infinite scroll
    useInfiniteScroll({
        hasMore,
        loading: loadingMore,
        onLoadMore: loadMore,
        threshold: CONFIG.pagination.infiniteScrollThreshold,
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">Hiba a termékek betöltésekor: {error}</Typography>;
    }

    if (producerProducts.length === 0) {
        return null;
    }

    return (
        <Box sx={{ my: 5 }}>
            <Typography
                sx={{
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    mb: 3,
                    fontSize: { sm: '16px', md: '24px' },
                }}
            >
                További termékek ({producerProducts.length})
            </Typography>
            <Grid container spacing={2}>
                {displayedProducts.map((product) => (
                    <Grid key={product.id} size={{ xs: 6, sm: 6, md: 3, lg: 2.4 }}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>

            {/* Load More Button - Fallback for users without scroll or manual loading */}
            {hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button
                        variant="outlined"
                        onClick={loadMore}
                        disabled={loading || loadingMore}
                        sx={{
                            minWidth: 200,
                            textTransform: 'uppercase',
                            fontWeight: 600,
                        }}
                    >
                        {loadingMore ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                Betöltés...
                            </>
                        ) : (
                            `További termékek betöltése (${producerProducts.length - displayedCount})`
                        )}
                    </Button>
                </Box>
            )}

            {/* Loading indicator for infinite scroll */}
            {loadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
}
