'use client'

import { useTarolas } from "src/contexts/tarolas-context";
import TarolasKartya from "./tarolas-kartya";
import { Grid, CircularProgress, Typography } from "@mui/material";

export default function TarolasGrid() {
    const { tarolasMod, loading, error } = useTarolas();

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">Hiba a tárolási módok betöltésekor: {error}</Typography>;
    }

    return (
        <Grid container spacing={2}>
            {tarolasMod.map((method) => (
                <Grid key={method.id} size={{xs:12, md:6, lg:4}}>
                    <TarolasKartya method={method} />
                </Grid>
            ))}
        </Grid>
    );
}