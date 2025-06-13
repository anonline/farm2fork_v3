'use client';

import { Fragment  } from "react";

import { Grid } from "@mui/material";

import { useProducts } from "src/contexts/products-context";

import ProductCard from "../product-card/product-card";



export default function ProductsPage() {
    const { products, loading, error } = useProducts();

    return (
        <>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <Grid container spacing={1} justifyContent="start" style={{ marginTop: '20px' }}>
                {products.map(product => (
                    <Grid size={{ xs: 12, sm: 4, md: 2.4, lg: 2.4 }} key={product.id}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
        </>

    );

}