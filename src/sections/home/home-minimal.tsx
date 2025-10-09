import type { IProductItem } from 'src/types/product';

import { Box, Grid, Skeleton, Typography } from '@mui/material';

import { themeConfig } from 'src/theme';
import { useStarProducts, useFeaturedProducts } from 'src/contexts/products-context';

import ProductCard from 'src/components/product-card/product-card';
import FeaturedProductCard from 'src/components/product-card/featured-product-card';

import HomeMinimalProductsRedirectButton from './home-minimal-products-redirect-button';

export function HomeMinimal() {
    const h2Style = {
        fontSize: { xs: '28px', md: '40px !important' },
        lineHeight: '48px',
        textTransform: 'uppercase',
        fontWeight: 600,
        mb: 3,
        fontFamily: themeConfig.fontFamily.bricolage,
    };

    return (
        <Box my={4}>
            <Typography sx={h2Style} >
                Új termékek
            </Typography>

            <Grid container spacing="5px" sx={{ rowGap: { xs: '5px', md: '54px' } }}>
                <StarProductsWrapper />

                <FeaturedProductWrapper />
            </Grid>
            <HomeMinimalProductsRedirectButton />
        </Box>
    );
}

type StarProductsWrapper = {
    products: IProductItem[];
};

function StarProductsWrapper() {
    const { products, loading } = useStarProducts();
    return (
        <>
            {loading && <Skeleton variant="rounded" width="100%" height={505} />}
            {!loading &&
                products.filter((product) => (product.stock === null || product.stock > 0 || product.backorder))
                    .map((starProduct) => (
                        <Grid key={starProduct.id} size={12}>
                            <FeaturedProductCard product={starProduct} />
                        </Grid>
                    ))}
        </>
    );
}

function FeaturedProductWrapper() {
    const { products, loading } = useFeaturedProducts();
    return (
        <>
            {loading && (
                <>
                    <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
                        <Skeleton variant="rounded" height={513} width="100%" />
                    </Grid>
                    <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
                        <Skeleton variant="rounded" height={513} width="100%" />
                    </Grid>
                    <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
                        <Skeleton variant="rounded" height={513} width="100%" />
                    </Grid>
                    <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
                        <Skeleton variant="rounded" height={513} width="100%" />
                    </Grid>
                    <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
                        <Skeleton variant="rounded" height={513} width="100%" />
                    </Grid>
                </>
            )}
            {!loading &&
                products.filter((product) => (product.stock === null || product.stock > 0 || product.backorder))
                    .map((featuredProduct) => (
                        <Grid key={featuredProduct.id} size={{ xs: 6, md: 4, lg: 2.4 }}>
                            <ProductCard product={featuredProduct} />
                        </Grid>
                    ))}
        </>
    );
}
