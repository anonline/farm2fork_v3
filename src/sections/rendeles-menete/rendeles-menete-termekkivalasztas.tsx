import { Box, List, ListItem, Typography, } from "@mui/material";
import F2FIcons from "src/components/f2ficons/f2ficons";

export default function RendelesMeneteTermekkivalasztas() {
    const h1Style = {
        fontSize: { xs: "20px", "@media (min-width:767px)": { fontSize: "28px" } },
        lineHeight: "30px",
        fontWeight: 600,
        textTransform: "uppercase",
        TextDecoder: "bold",
    };

    const textStyle = {
        lineHeight: "28px",
        fontSize: "16px",
        fontWeight: 400,
        textSizeadjust: "100%",
        display: 'list-item',
        listStyleType: 'disc',
        verticalAlign: 'baseline',
        textAlign: "left",
        padding: "0px"
    }
    return (
        <Box sx={{
            display: "flex",
            gap: "20px",
            flexDirection: { xs: 'column', '@media (min-width:1025px)': { flexDirection: 'row' } },
            alignItems: "start",
            paddingX: { xs: '20px', '@media (min-width:1025px)': { paddingX: '0px' }},
            
        }}>
            <Box sx={{ minWidth: "124.338px", height: "105.6px", textAlign: "center" }}>
                <F2FIcons name="ScreenIcon" height={100} width={100} style={{ color: 'rgb(74,110,80)' }} />
            </Box>
            <Box sx={{ display: "flex", gap: "20px", flexDirection: "column", padding: "10px" }}>
                <Typography component="h1" sx={h1Style}>Termékek kiválasztása</Typography>
                <List sx={{ paddingLeft: "40px", paddingY: "0px" }}>
                    <ListItem sx={textStyle}>
                        Bejelentkezés után válogass az elérhető zöldségek, gyümölcsök és egyéb termékek között. Az árucikkeket szűrheted típus, termelő, és a bio- vagy konvencionális termelés módja szerint is. <b>Minden egyes termék Magyarországról származik.</b>
                    </ListItem>
                    <ListItem sx={textStyle}>
                        A kiválasztott terméknél add meg a rendelni kívánt mennyiséget, majd tedd a kosárba.
                    </ListItem>
                    <ListItem sx={textStyle}>
                        A kosár megtekintésénél tudod ellenőrizni a kiválogatott termékeket. Itt módosíthatod a mennyiséget és leadhatod az extra igényeidet.
                    </ListItem>
                </List>
            </Box>
        </Box>
    );
}