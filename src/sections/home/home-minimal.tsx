import { Grid, Typography } from "@mui/material";



export function HomeMinimal() {
   const h2Style = {
    fontSize:"40px",
    lineHeight:"48px",
    textTransform:"uppercase",
    fontWeight:600
   };
   const VisibleCount = 5
    return (
    <>
        <Typography variant="h2" sx={h2Style}>Új termékek</Typography>
        <Grid>
            {sortedproducts.slice(0, VisibleCount).map(product)}
        </Grid>
    </>
    ); 
};