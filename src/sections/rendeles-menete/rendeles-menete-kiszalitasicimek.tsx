'use client'

import { Box, Typography } from "@mui/material";

import F2FIcons from "src/components/f2ficons/f2ficons";

import KiszalitasiCimekTerkep from "./kiszalitasicimek-terkep";
import KiszalitasiCimekKapcsolo from "./kiszalitasicimek-kapcsolo";


export default function RendelesMenetekiszalitasiCimek() {

    return (
        <Box sx={{
            display: "flex",
            gap: "20px",
            flexDirection: { xs: 'column', '@media (min-width:1025px)': { flexDirection: 'row' } },
            alignItems: "start",
            paddingX: { xs: '20px', '@media (min-width:1025px)': { paddingX: '0px' }},
            
        }}>
            <Box sx={{minWidth:"124.338px", height:"105.6px", textAlign:"center"}}>
                <F2FIcons name="PointHouse" height={100} width={100} style={{ color: 'rgb(74,110,80)' }} />
            </Box>
            <Box sx={{ width:{sx:"100%", '@media (min-width:1025px)':{width:"80%"}}, display:"flex", gap:"20px", flexDirection:"column", alingItems:"center",}}>
                <Typography sx={{
                    fontSize: "28px",
                    fontWeight: 600,
                    lineHeight: "36px",
                    textTransform: "uppercase",
                    alignSelf:"start"
                }}
                >Kiszállítási címek</Typography>
                <KiszalitasiCimekKapcsolo />
                <Box sx={{padding:"0px"}}>
                    <KiszalitasiCimekTerkep />
                </Box>
            </Box>
        </Box>
    );
}