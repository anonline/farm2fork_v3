'use client';

import type { IProductItem } from 'src/types/product';

import React, { useState, useEffect } from 'react';

import { Box, Grid, Typography, CircularProgress } from '@mui/material';

import { useProducts } from 'src/contexts/products-context';

import ProductCard from 'src/components/product-card/product-card';

interface ProducerProductsProps {
    producerId: string;
}

export default function TermelokTermekek({ producerId }: Readonly<ProducerProductsProps>) {
    const { products, loading, error } = useProducts();
    const [producerProducts, setProducerProducts] = useState<IProductItem[]>([]);

    console.log('Producer ID:', producerId);
    useEffect(() => {
        const filteredProducts = products.filter((product) => product.producerId === producerId);
        setProducerProducts(filteredProducts);
    }, [products, producerId]);

    console.log('All products:', products);
    
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
                    mb: 3,
                    fontSize: { xs: '28px', md: '40px' },
                    lineHeight: { xs: '33.6px', md: '48px' },
                }}
            >
                Termékek
            </Typography>
            <Grid container spacing={2}>
                {producerProducts.map((product) => (
                    <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
