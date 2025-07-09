'use client'

import { Box, Grid, Container } from "@mui/material";

import ProfilEditAddress from "../profil-edit-address";
import { ProfilNavigation } from "../../Profil-navigation";

export default function ProfilEditAddressView() {
    return (
        <Container maxWidth="md">
            <Box sx={{ p: 2, maxWidth: '1200px', mx: 'auto' }}>
                <Grid container spacing={{ xs: 3, md: 4 }}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <ProfilNavigation />
                    </Grid>
                    <Grid size={{ xs: 12, md: 9 }}>
                        <ProfilEditAddress />
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}