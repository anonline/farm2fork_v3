import { Box, Typography } from "@mui/material";

import F2FIcons from "src/components/f2ficons/f2ficons";


export default function RendelesMeneteRendelesiIdopontok() { 
    const textstyleA = {
        lineHeight: "28px",
        fontSize: "16px",
        fontWeight: 700
    };
    const textstyleB = {
        lineHeight: "28px",
        fontSize: "16px",
        fontWeight: 400,
        marginBlockEnd:"14.4px",
    };
    return (
        <Box sx={{
            display: "flex",
            gap: "20px",
            flexDirection: { xs: 'column', '@media (min-width:1025px)': { flexDirection: 'row' } },
            alignItems: "start",
            paddingX: { xs: '20px', '@media (min-width:1025px)': { paddingX: '0px' }},
            
        }}>
            <Box sx={{minWidth:"124.338px", height:"105.6px", textAlign:"center"}}>
                <F2FIcons name="RendelesDate" height={100} width={100} style={{color:"#4A6E51"}}/>
            </Box>
            <Box sx={{textSizeAdjust:"100%", paddingBlock:"10px", paddingInline:"10px"}}>
                <Typography sx={{
                    fontSize:"28px",
                    fontWeight:600,
                    lineHeight:"36px",
                    textTransform:"uppercase",
                    }}>
                    Rendelési időpontok</Typography>
                
                <Typography sx={textstyleB}>
                    A szállítási időpontok a rendelés leadásától és a szállítási helytől is függenek. Ez időpont a rendelés közben pontosítódik, azonban általánosan elmondhatóak az alábbiak:
                </Typography>
                
                <Typography sx={textstyleA}>Szerda 12-ig</Typography>
                
                <Typography sx={textstyleB}>Csütörtökön kerülnek szállításra</Typography>
                
                <Typography sx={textstyleA}>Vasárnap 12-ig</Typography>
                
                <Typography sx={textstyleB}>Hétfőn vagy kedden kerülnek szállításra</Typography>
            </Box>
        </Box>
    );
}