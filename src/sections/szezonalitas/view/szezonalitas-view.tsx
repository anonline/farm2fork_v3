import { Box, Container, Typography } from "@mui/material";
import { Months } from "src/types/months";
import SzezonalisHonapKapcsolo from "../szezonalitas-honap-kapcsolo";
import { ProductsInCategoryProvider, useProductsInCategory } from "src/contexts/products-context";

type SzezonalitasViewProps = {
    month: Months;
};

export default function SzezonalitasView({ month }: SzezonalitasViewProps) {

    return (
        <Container sx={{paddingX:"0px", paddingY:"32px" }}>
            <Box sx={{display:"flex", flexDirection:"column", gap:"40px"}}>
                <Typography variant="h1" sx={{textTransform:'uppercase', fontWeight:600, paddingRight:10, fontSize:"64px", width:"100%"}} >Szezonalitás</Typography>
                <SzezonalisHonapKapcsolo/>
            </Box>
            <ProductsInCategoryProvider categoryId={1}>
                <SzezonalitasTermekek />
            </ProductsInCategoryProvider>
        </Container>
    );
}

function SzezonalitasTermekek(){
    const products = useProductsInCategory();
    
    return (
        <>
            {!products.loading && products.products.map(p => (
                <div key={p.id}>{p.name}</div>
            ))}
        </>
    );
}