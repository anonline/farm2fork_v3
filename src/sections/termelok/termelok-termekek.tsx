'use client';

import type { IProductItem } from 'src/types/product';

import React, { useMemo, useState, useEffect } from 'react';

import { Box, Grid, Button, Typography, CircularProgress } from '@mui/material';

import { useInfiniteScroll } from 'src/hooks/use-infinite-scroll';

import { themeConfig } from 'src/theme';
import { CONFIG } from 'src/global-config';
import { useTranslate } from 'src/locales';
import { useProducts } from 'src/contexts/products-context';

import ProductCard from 'src/components/product-card/product-card';

interface ProducerProductsProps {
    producerId: string;
}

export default function TermelokTermekek({ producerId }: Readonly<ProducerProductsProps>) {
    const { products, loading, error } = useProducts();
    const [producerProducts, setProducerProducts] = useState<IProductItem[]>([]);
    const [displayedCount, setDisplayedCount] = useState(15);
    const { t: producerTranslate } = useTranslate('producer');

    console.log('Producer ID:', producerId);
    useEffect(() => {
        const filteredProducts = products.filter((product) => product.producerId === producerId);
        setProducerProducts(filteredProducts);
        // Reset displayed count when producer changes
        setDisplayedCount(CONFIG.pagination.productsPerPage);
    }, [products, producerId]);

    console.log('All products:', products);

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
        <Box>
            <Typography
                sx={{
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontFamily: themeConfig.fontFamily.bricolage,
                    mb: 3,
                    mt: 3,
                    fontSize: { xs: '28px', md: '40px' },
                    lineHeight: { xs: '33.6px', md: '48px' },
                }}
            >
                {producerTranslate('products')}
            </Typography>
            <Grid container spacing={2}>
                {displayedProducts.map((product) => (
                    <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
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
