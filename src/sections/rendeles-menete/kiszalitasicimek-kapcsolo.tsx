'use client'

import { useState } from 'react';
import { ToggleButton, ToggleButtonGroup, Box, SxProps, Theme, List, ListItem, Typography, } from '@mui/material';

interface AtveteliPontInfoProps {
    readonly adat: readonly { title: string; text: string }[];
    readonly titlestyle: React.CSSProperties | SxProps<Theme>;
}

function AtveteliPontInfo({ adat, titlestyle }: AtveteliPontInfoProps) {
    return (
        <Box sx={{ pt: 2, }}>
            {adat.map((pont) => (
                <Box key={pont.title} sx={{ mb: 2, border: "1px solid rgb(223, 220, 209)", borderRadius: "4px", padding: "18px" }}>
                    <Typography sx={titlestyle}>{pont.title}</Typography>
                    <Typography variant="body2">{pont.text}</Typography>
                </Box>
            ))}
        </Box>
    );
}

interface HazhozSzallitasInfoProps {
    readonly adat: readonly {text: string }[];
}
function HazhozszallitasInfo({adat}:HazhozSzallitasInfoProps) {
    const listItemStyle = { display: 'list-item', listStyleType: 'disc', p: 0, pl: 1, mb: 1 };

    return (
        <>
            {adat.map((pont) => (
                <ListItem key={pont.text} sx={listItemStyle}>
                    <Typography variant="body1">{pont.text}</Typography>
                </ListItem>
            ))}
        </>
    );
};

interface HazhozSzallitasKeruletInfoProps {
    readonly adat: readonly { title: string; text: string }[];
    readonly titlestyle: React.CSSProperties | SxProps<Theme>;
}

function HazhozSzallitasKeruletInfo({ adat, titlestyle }: HazhozSzallitasKeruletInfoProps) {
    return <AtveteliPontInfo adat={adat} titlestyle={titlestyle} />;
}

export default function KiszalitasiCimekKapcsolo() {
    const HazhozSzallitasKeruletInfoAdat=[
        {title:'Budapest - Budai oldal', text:'I., II. és III. XI. és XII. kerületek'},
        {title:'Budapest - Pesti oldal', text:'V., VI., VII.,VIII., XIII. IX. XIV. kerületek'},
        {title:'Budaörs - Biatorbágy - Törökbálint', text:'Teljes településre szállítunk'},
        {title:'Szentendre - Pilisszentlászló - Budakalász - Üröm', text:'Teljes településre szállítunk'},
        {title:'Tata', text:'Teljes településre szállítunk'},
        {title:'Veszprém', text:'Teljes településre szállítunk'},
        {title:'További városok ahol átveheted a rendelésedet', text:'Miskolc Eger'},
        {title:'Balaton', text:'Nyári szezonban Balatonakarattyától Tihanyig (71-es út mentén) szállítunk'},
    ];

    const HazhozSzallitasInfoAdat = [
        {text:"A rendelés leadása után e-mailes visszaigazolást küldünk, amiben megadjuk a kiszállítás napját. A rendeléseket hétfő és csütörtök délelőtt dolgozzuk fel."},
            {text:"A szerda 12:00-ig leadott rendeléseket csütörtökön szállítjuk ki, a vasárnap 12:00-ig leadott rendeléseket pedig kedden."},
            {text:"Éttermeknek ingyenes a kiszállítás. A minimális rendelési összeg nettó 18 000 Ft"},
            {text:"Magánszemélyek esetében a minimális rendelési összeg 5000 Ft. A szállítási költség 5-10.000 Ft-os rendelés esetén 1790 Ft. 10-18.000 Ft között pedig 1290 Ft. A 18 000 Ft feletti rendelésedet ingyenesen kiszállítjuk."},
            {text:"Kérlek ellenőrizd a térképen, hogy szállítunk-e hozzád."},
    ];

    const AtveteliPontInfoAdat = [
        { title: "Farm2Fork raktár", text: "1097 Budapest, Ecseri út 14-16. E épület - Gyáli út felől a telephely bejárat" },
        { title: "Caphe by Hai Nam", text: "1114 Budapest, Bartók Béla út 35." },
        { title: "Czakó Kert - ODA", text: "1016 Budapest, Czakó u. 15." },
        { title: "Replacc", text: "1024 Budapest, Lövőház u. 28." },
        { title: "Oázis Kertészet - Pasarét", text: "1022 Budapest, Zilah u. 6." },
        { title: "Emma Tortaműhely", text: "1116 Budapest Vegyész utca 71." },
        { title: "Bio Bárka / Greenland", text: "1136 Budapest, Pannónia u. 19." },
        { title: "Nor/ma Hall - Telekom székház", text: "1097 Budapest, Könyves Kálmán krt. 36." },
        { title: "Vegan Garden Étterem", text: "1061 Budapest, Király utca 8-10. Central passage" },
        { title: "Oázis Kertészet - Budakeszi", text: "2092 Budakeszi Szőlőskert Ipari Park 2756/23 (Tesco-nál)" }
    ];

    const toggleButtonStyle: SxProps<Theme> = {
        textTransform: 'none',
        border: 'none',
        padding: '12px 24px',
        fontWeight: 600,
        transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
        width: { xs: '100%', '@media (min-width:767px)': { width: 'auto' } },
        flexGrow: { '@media (min-width:767px)': { flexGrow: 1 } },
        borderRadius: '8px !important',
        '&.Mui-selected': {
            backgroundColor: '#ffffff',
            color: '#111',
            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
        },
        '&:not(.Mui-selected):hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            color: '#333',
        },
    };

    const titlestyle: SxProps<Theme> = {
        lineHeight: "28px",
        fontSize: "16px",
        fontWeight: 600,
        color: "rgb(74, 110, 80)",
        textDecoration: "solid",
        textDecorationColor: "rgba(74, 110, 80, 0.4)"
    };

    const [deliveryMethod, setDeliveryMethod] = useState('hazhozszallitas');

    const handleDeliveryChange = (
        event: React.MouseEvent<HTMLElement>,
        newMethod: string | null,
    ) => {
        if (newMethod !== null) {
            setDeliveryMethod(newMethod);
        }
    };

    return (
        <Box sx={{ padding:"0px", width: '100%', maxWidth: '800px', mx: 'auto' }}>
            <ToggleButtonGroup
                value={deliveryMethod}
                exclusive
                onChange={handleDeliveryChange}
                aria-label="szállítási mód"
                sx={{
                    width: '100%',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '12px',
                    p: '5px',
                    flexDirection: { xs: 'column', '@media (min-width:767px)': { flexDirection: 'row' } },
                    gap: '5px',
                }}
            >
                <ToggleButton value="hazhozszallitas" sx={toggleButtonStyle}>
                    Házhozszállítás
                </ToggleButton>
                <ToggleButton value="atveteli_pontok" sx={toggleButtonStyle}>
                    Átvételi pontok
                </ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ mt: 3 }}>
                {deliveryMethod === 'hazhozszallitas' ? (
                    <>
                        <List sx={{ paddingLeft: "40px", pt: 2 }}>
                            <HazhozszallitasInfo adat={HazhozSzallitasInfoAdat} />
                        </List>
                        <HazhozSzallitasKeruletInfo adat={HazhozSzallitasKeruletInfoAdat} titlestyle={titlestyle}/>
                    </>
                ) : (
                    <>
                        <Typography sx={{
                            fontWeight: 400,
                            lineHeight: "28px",
                            fontSize: "16px",
                            marginBlockEnd: "14.4px"
                        }}>A személyes átvétel ingyenes.</Typography>
                        <AtveteliPontInfo adat={AtveteliPontInfoAdat} titlestyle={titlestyle} />
                    </>
                )}
            </Box>
        </Box>
    );
}
