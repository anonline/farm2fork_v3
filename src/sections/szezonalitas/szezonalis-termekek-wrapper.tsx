import type { ProductsContextType } from 'src/contexts/products-context';

import { Grid, Typography } from '@mui/material';

import { useProductsInMonthInCategory } from 'src/contexts/products-context';

import ProductCard from 'src/components/product-card/product-card';

type SzezonalitasTermekekProps = {
    productsData: ProductsContextType;
};

export function SzezonalitasTermekekWrapper() {
    const productsData = useProductsInMonthInCategory();
    if (!productsData.loading && productsData.products.filter((c) => c != null).length > 0) {
        return <SzezonalitasTermekek productsData={productsData} />;
    } else {
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
}

export function SzezonalitasTermekek({ productsData }: Readonly<SzezonalitasTermekekProps>) {
    const { products: categoryGroup, loading } = productsData;

    let content = null;

    if (!loading) {
        if (categoryGroup?.length > 0) {
            content = categoryGroup?.map((p, index) =>
                p == null ? null : (
                    <Grid key={p.id} size={{ xs: 12, sm: 4, md: 3, lg: 2.4 }}>
                        <ProductCard product={p} />
                    </Grid>
                )
            );
        }
        return <>{content}</>;
    }
}
