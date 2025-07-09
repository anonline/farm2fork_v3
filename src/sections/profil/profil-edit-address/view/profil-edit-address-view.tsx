'use client'

import { Box, Container, Grid } from "@mui/material";
import { ProfilNavigation } from "../../Profil-navigation";
import ProfilEditAddress from "../profil-edit-address";

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