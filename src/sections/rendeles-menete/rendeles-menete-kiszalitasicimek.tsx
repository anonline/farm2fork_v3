'use client'

import { Box, Typography } from "@mui/material";

import F2FIcons from "src/components/f2ficons/f2ficons";

import KiszalitasiCimekTerkep from "./kiszalitasicimek-terkep";
import KiszalitasiCimekKapcsolo from "./kiszalitasicimek-kapcsolo";

export default function RendelesMeneteKiszalitasiCimek() {

    return (
        <Box sx={{
            display: "flex",
            gap: "20px",
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: "start",
            paddingX: { xs: '20px', lg: '10px' },

        }}>
            <Box sx={{ minWidth: "124.338px", height: "105.6px", textAlign: "center" }}>
                <F2FIcons name="PointHouse" height={100} width={100} style={{ color: 'rgb(74,110,80)' }} />
            </Box>
            <Box sx={{ width: { md: "100%", lg: "80%" }, display: "flex", gap: "20px", flexDirection: "column",  paddingTop:'15px' }}>
                <Typography sx={{
                    fontSize: { xs: "20px", md: "28px" },
                    lineHeight: "30px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                }} variant="h2"
                >
                    Kiszállítási címek
                </Typography>
                <KiszalitasiCimekKapcsolo />
                <Box sx={{ padding: "0px" }}>
                    <KiszalitasiCimekTerkep />
                </Box>
            </Box>
        </Box>
    );
}