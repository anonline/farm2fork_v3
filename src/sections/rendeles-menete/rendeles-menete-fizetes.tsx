import { Box, Typography } from "@mui/material";

import F2FIcons from "src/components/f2ficons/f2ficons";

export default function RendelesMeneteFizetes() {
    return (
        <Box sx={{
            display: "flex",
            gap: "20px",
            flexDirection: { xs: 'column', '@media (min-width:1025px)': { flexDirection: 'row' } },
            alignItems: "start",
            paddingX: { xs: '20px', '@media (min-width:1025px)': { paddingX: '0px' }},
            
        }}>
            <Box sx={{minWidth:"124.338px", height:"105.6px", textAlign:"center"}}>
                <F2FIcons name="Card" height={100} width={100} style={{color:"#4A6E51"}}/>
            </Box>
            <Box sx={{display:"flex", gap:"20px", flexDirection:"column"}}>
                <Typography sx={{
                    fontSize: "28px",
                    fontWeight: 600,
                    lineHeight: "36px",
                    textTransform: "uppercase",
                }}
                >Fizetés</Typography>
                <Typography sx={{
                    lineHeight: "28px",
                    fontSize: "16px",
                    fontWeight: 400,
                    marginBlockEnd: "14.4px"
                }}>A megrendelt áru ellenértékét a vásárlás során egyeztetett módon tudod kiegyenlíteni. Magánszemélyként SimplePay-el vagy készpénzzel is fizethetsz, éttermek és cégek számára pedig készpénzes fizetés és banki átutalás áll rendelkezésre. 
                </Typography>
            </Box>
        </Box>
    );
}