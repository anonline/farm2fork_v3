import { CircularProgress, Typography, Box, Grid,} from "@mui/material";
import FeaturedProductCard from "src/components/product-card/featured-product-card";
import ProductCard from "src/components/product-card/product-card";
import { useProducts } from "src/contexts/products-context";
import { IProductItem } from "src/types/product";
import HomeMinimalProductsRedirectButton from "./home-minimal-products-redirect-button";

export function HomeMinimal() {
    const { products, loading, error } = useProducts();

    const h2Style = {
        fontSize: "40px",
        lineHeight: "48px",
        textTransform: "uppercase",
        fontWeight: 600,
        mb: 3,
    };

    if (loading) {
        return <CircularProgress />;
    }
    if (error) {
        return <Typography color="error">Hiba történt a termékek betöltésekor: {error}</Typography>;
    }

    const sortedProducts = [...products].sort((a: IProductItem, b: IProductItem) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
    const firstProduct = sortedProducts[0];
    const nextFiveProducts = sortedProducts.slice(1, 6);

    return (
        <Box my={4}>
            <Typography variant="h2" sx={h2Style}>Új termékek</Typography>
            
            <Grid container spacing={1} sx={{rowGap:"54px"}}>
                {firstProduct && (
                    <Grid size={{xs:12}}>
                        <FeaturedProductCard product={firstProduct} />
                    </Grid>
                )}

                {nextFiveProducts.map(product => (
                    <Grid key={product.id} size={{xs:6, md:4, lg:2.4}}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
            <HomeMinimalProductsRedirectButton />
        </Box>
    ); 
}
