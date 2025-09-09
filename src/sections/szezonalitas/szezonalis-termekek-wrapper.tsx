import type { ProductsContextType } from 'src/contexts/products-context';

import { Grid, Skeleton, Typography } from '@mui/material';

import { useProductsInMonthInCategory } from 'src/contexts/products-context';

import ProductCard from 'src/components/product-card/product-card';

type SzezonalitasTermekekProps = {
    productsData: ProductsContextType;
};

export function SzezonalitasTermekekWrapper() {
    const productsData = useProductsInMonthInCategory();
    
    // Show loading state while fetching data
    if (productsData.loading) {
        return (
            <Grid container spacing={2}>
                {[...Array(4)].map((_, index) => (
                    <Grid key={index} size={{ xs: 12, sm: 4, md: 3, lg: 2.4 }}>
                        <Skeleton variant="rectangular" height={200} />
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="60%" />
                    </Grid>
                ))}
            </Grid>
        );
    }

    // Show error state if there's an error
    if (productsData.error) {
        return (
            <Typography
                color="error"
                sx={{
                    textAlign: 'center',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 400,
                    width: '100%',
                }}
            >
                Hiba történt a termékek betöltése során: {productsData.error}
            </Typography>
        );
    }

    // Show products or empty state
    const filteredProducts = productsData.products.filter((product) => product != null);
    
    if (filteredProducts.length === 0) {
        return (
            <Typography
                sx={{
                    textAlign: 'center',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 400,
                    width: '100%',
                }}
            >
                Sajnos nem találtunk terméket.
            </Typography>
        );
    }

    return <SzezonalitasTermekek productsData={productsData} />;
}

export function SzezonalitasTermekek({ productsData }: Readonly<SzezonalitasTermekekProps>) {
    const { products: categoryGroup } = productsData;

    // Filter out null products
    const validProducts = categoryGroup.filter((product) => product != null);

    if (validProducts.length === 0) {
        return null;
    }

    return (
        <>
            {validProducts.map((product) => (
                <Grid key={product.id} size={{ xs: 12, sm: 4, md: 3, lg: 2.4 }}>
                    <ProductCard product={product} />
                </Grid>
            ))}
        </>
    );
}
