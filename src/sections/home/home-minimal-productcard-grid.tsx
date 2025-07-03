import { Grid } from "@mui/material";
import ProductCard from "src/components/product-card/product-card";
import { ProductProvider } from "src/contexts/product-context";


export default function HomeMinimalProductcardGrid() {
    return(
        <Grid>
            <ProductCard product={ProductProvider{createdAt}} />
        </Grid>
    );
};