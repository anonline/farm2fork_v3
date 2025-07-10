'use client'

import { Container, Box, Grid } from "@mui/material";
import { ProfilNavigation } from "../../Profil-navigation";
import ProfilEditAccount from "../profil-edit-account";

export default function ProfilEditAccountView(){
    return (
        <Container maxWidth="lg">
            <Box sx={{ p: 2, maxWidth: '1200px', mx: 'auto' }}>
                <Grid container spacing={{ xs: 3, md: 4 }}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <ProfilNavigation />
                    </Grid>
                    <Grid size={{ xs: 12, md: 9 }}>
                        <ProfilEditAccount />
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}