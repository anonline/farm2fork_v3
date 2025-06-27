import { Box, List, ListItem, Typography, } from "@mui/material";
import F2FIcons from "src/components/f2ficons/f2ficons";

export default function RendelesMeneteTermekkivalasztas() {
    const h1Style = {
        fontSize: { xs: "20px", "@media (min-width:767px)": { fontSize: "28px" } },
        lineHeight: "30px",
        fontWeight: 600,
        textTransform: "uppercase",
        TextDecoder: "bold",
        paddingLeft:"15px"
    };

    const textStyle = {
        lineHeight: "28px",
        fontSize: "16px",
        fontWeight: 400,
        textSizeadjust: "100%",
        paddingLeft:"55 px",
        paddingY:"8px"
    }
    return (
        <Box sx={{display:"flex"}}>
            <Box>
                <F2FIcons name="ScreenIcon" height={100} width={100} style={{ color: 'rgb(74,110,80)' }} />
            </Box>
            <Box>
                <Typography component="h1" sx={h1Style}>Termékek kiválasztása</Typography>
                <List sx={textStyle}> 
                    <ListItem  sx={{ display: 'list-item', listStyleType: 'disc', p: 0, pl: 1 }}>
                        Bejelentkezés után válogass az elérhető zöldségek, gyümölcsök és egyéb termékek között. Az árucikkeket szűrheted típus, termelő, és a bio- vagy konvencionális termelés módja szerint is. <b>Minden egyes termék Magyarországról származik.</b>
                    </ListItem>
                    <ListItem  sx={{ display: 'list-item', listStyleType: 'disc', p: 0, pl: 1 }}>
                        A kiválasztott terméknél add meg a rendelni kívánt mennyiséget, majd tedd a kosárba. 
                    </ListItem>
                    <ListItem  sx={{ display: 'list-item', listStyleType: 'disc', p: 0, pl: 1 }}>
                        A kosár megtekintésénél tudod ellenőrizni a kiválogatott termékeket. Itt módosíthatod a mennyiséget és leadhatod az extra igényeidet.
                    </ListItem>
                </List>
            </Box>
        </Box>
    );
}