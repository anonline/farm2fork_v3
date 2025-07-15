'use client'

import TermelokTermekek from "../termelok-termekek";
import { Container, Box, Typography } from "@mui/material";
import { useProducers } from "src/contexts/producers-context";
import TermelokHero from "../termelok-hero";

export default function TermelokView({ viewslug }: any) {
    const { producers, loading, error } = useProducers();

    if (loading) {
            return (
                <></>
            );
        }
        if (error) {
            return <Typography color="error">Hiba: {error}</Typography>;
        }
    console.log(viewslug)
    console.log(producers)
    const SelectedProducer = producers.find(p => p.slug === viewslug);
    
    return (
        <Container maxWidth="lg">
            {SelectedProducer ? (
                <>
                    <TermelokHero producerId={SelectedProducer.id} />
                    <TermelokTermekek producerId={SelectedProducer.id} />
                </>
            ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        A keresett oldal nem található
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Sajnos nem találtunk a megadott azonosítóval rendelkező termelőt.
                    </Typography>
                </Box>
            )}
        </Container>
    );
}