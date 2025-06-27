'use client'

import { Box, List, ListItem } from "@mui/material";
import KiszalitasiCimekKapcsolo from "./kiszalitasicimek-kapcsolo";
import KiszalitasiCimekTerkep from "./kiszalitasicimek-terkep";
import F2FIcons from "src/components/f2ficons/f2ficons";


export default function RendelesMenetekiszalitasiCimek() {

    const textStyle = {
        lineHeight: "28px",
        fontSize: "16px",
        fontWeight: 400,
        textSizeadjust: "100%",
        gap: "10px",
        paddingLeft:"40px",
    }
    return (
        //todo:befejezni a térképet és át rakni a tartalmat a gombhoz, hogy azzal jeleenjen meg
        <Box sx={{display:"flex"}}>
            <Box>
                <F2FIcons name="PointHouse" height={100} width={100} style={{ color: 'rgb(74,110,80)' }}/>
            </Box>
            <Box> 
                <KiszalitasiCimekKapcsolo />
                <List sx={textStyle}>
                    <ListItem sx={{ display: 'list-item', listStyleType: 'disc', p: 0, pl: 1 }}>
                        A rendelés leadása után e-mailes visszaigazolást küldünk, amiben megadjuk a kiszállítás napját. A rendeléseket hétfő és csütörtök délelőtt dolgozzuk fel. 
                    </ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: 'disc', p: 0, pl: 1 }}>
                        A szerda 12:00-ig leadott rendeléseket csütörtökön szállítjuk ki, a vasárnap 12:00-ig leadott rendeléseket pedig kedden.
                    </ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: 'disc', p: 0, pl: 1 }}>
                        Éttermeknek ingyenes a kiszállítás. A minimális rendelési összeg nettó 18 000 Ft
                    </ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: 'disc', p: 0, pl: 1 }}>
                        Magánszemélyek esetében a minimális rendelési összeg 5000 Ft. A szállítási költség 5-10.000 Ft-os rendelés esetén 1790 Ft. 10-18.000 Ft között pedig 1290 Ft. A 18 000 Ft feletti rendelésedet ingyenesen kiszállítjuk. 
                    </ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: 'disc', p: 0, pl: 1 }}>
                        <b>Kérlek ellenőrizd a térképen, hogy szállítunk-e hozzád.</b>
                    </ListItem>
                </List>
                <Box>
                    <KiszalitasiCimekTerkep/>
                </Box>
            </Box>
        </Box>
    );
}