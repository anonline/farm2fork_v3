'use client';


import React from 'react';

import { Box, Grid, Typography, CircularProgress } from '@mui/material';

import { useProducts } from 'src/contexts/products-context'; 

import ProductCard from 'src/components/product-card/product-card'; 

interface ProducerProductsProps {
    producerId: number;
}

export default function ProducerProducts({ producerId }: Readonly<ProducerProductsProps>) {
    const { products, loading, error } = useProducts();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
            </Box>
        );
    }
    console.log('p', products, error, loading);

    const producerProducts = products.filter(product => product.producerId === producerId);

    if (error) {
        return <Typography color="error">Hiba a termékek betöltésekor: {error}</Typography>;
    }

    if (producerProducts.length === 0) {
        return null;
    }

    return (
        <Box sx={{ my: 5 }}>
            <Typography 
                variant="h3" 
                sx={{ 
                    textTransform: 'uppercase', 
                    fontWeight: 600, 
                    mb: 3 
                }}
            >
                További termékek
            </Typography>
            <Grid container spacing={2}>
                {producerProducts.map((product) => (
                    <Grid  key={product.id}  size={{xs:6, sm:6, md:3, lg:2.4}}>
                        <ProductCard product={product}/>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
