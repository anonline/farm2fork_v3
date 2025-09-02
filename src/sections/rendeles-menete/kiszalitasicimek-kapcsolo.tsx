'use client';

import type { Theme, SxProps } from '@mui/material';

import { useState } from 'react';

import { Box, List, ListItem, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

const HAZHOZSZALLITAS_KERULET_INFO_ADAT = [
    { title: 'Budapest - Budai oldal', text: 'I., II. és III. XI. és XII. kerületek' },
    { title: 'Budapest - Pesti oldal', text: 'V., VI., VII.,VIII., XIII. IX. XIV. kerületek' },
    { title: 'Budaörs - Biatorbágy - Törökbálint', text: 'Teljes településre szállítunk' },
    {
        title: 'Szentendre - Pilisszentlászló - Budakalász - Üröm',
        text: 'Teljes településre szállítunk',
    },
    { title: 'Tata', text: 'Teljes településre szállítunk' },
    { title: 'Veszprém', text: 'Teljes településre szállítunk' },
    { title: 'További városok ahol átveheted a rendelésedet', text: 'Miskolc Eger' },
    {
        title: 'Balaton',
        text: 'Nyári szezonban Balatonakarattyától Tihanyig (71-es út mentén) szállítunk',
    },
] as AtveteliKartya[];

const HAZHOZSZALLITAS_INFO_ADAT = [
    'A rendelés leadása után e-mailes visszaigazolást küldünk, amiben megadjuk a kiszállítás napját. A rendeléseket hétfő és csütörtök délelőtt dolgozzuk fel.',
    'A szerda 12:00-ig leadott rendeléseket csütörtökön szállítjuk ki, a vasárnap 12:00-ig leadott rendeléseket pedig kedden.',
    'Éttermeknek ingyenes a kiszállítás. A minimális rendelési összeg nettó 18 000 Ft',
    'Magánszemélyek esetében a minimális rendelési összeg 5000 Ft. A szállítási költség 5-10.000 Ft-os rendelés esetén 1790 Ft. 10-18.000 Ft között pedig 1290 Ft. A 18 000 Ft feletti rendelésedet ingyenesen kiszállítjuk.',
    'Kérlek ellenőrizd a térképen, hogy szállítunk-e hozzád.',
];

const ATVETELIPONT_INFO_ADAT = [
    {
        title: 'Farm2Fork raktár',
        text: '1097 Budapest, Ecseri út 14-16. E épület - Gyáli út felől a telephely bejárat',
    },
    { title: 'Caphe by Hai Nam', text: '1114 Budapest, Bartók Béla út 35.' },
    { title: 'Czakó Kert - ODA', text: '1016 Budapest, Czakó u. 15.' },
    { title: 'Replacc', text: '1024 Budapest, Lövőház u. 28.' },
    { title: 'Oázis Kertészet - Pasarét', text: '1022 Budapest, Zilah u. 6.' },
    { title: 'Emma Tortaműhely', text: '1116 Budapest Vegyész utca 71.' },
    { title: 'Bio Bárka / Greenland', text: '1136 Budapest, Pannónia u. 19.' },
    { title: 'Nor/ma Hall - Telekom székház', text: '1097 Budapest, Könyves Kálmán krt. 36.' },
    { title: 'Vegan Garden Étterem', text: '1061 Budapest, Király utca 8-10. Central passage' },
    {
        title: 'Oázis Kertészet - Budakeszi',
        text: '2092 Budakeszi Szőlőskert Ipari Park 2756/23 (Tesco-nál)',
    },
] as AtveteliKartya[];

type AtveteliKartya = {
    title: string;
    text: string;
};

interface AtveteliPontInfoProps {
    data: AtveteliKartya[];
    titleStyle: SxProps<Theme>;
}

interface HazhozSzallitasInfoListaProps {
    data: string[];
}

enum ShippingMethodsEnum {
    hazhozszallitas = 'Házhozszállítás',
    atveteli_pontok = 'Átvételi pontok',
}

export default function KiszalitasiCimekKapcsolo() {
    const toggleButtonStyle: SxProps<Theme> = {
        textTransform: 'none',
        border: 'none',
        padding: '12px 24px',
        fontWeight: 600,
        transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
        width: { xs: '100%', md: 'auto' },
        flexGrow: { md: 1 },
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

    // Kerületi és átvételi pontok cím stílusa
    const infoCardtitleStyle: SxProps<Theme> = {
        lineHeight: '28px',
        fontSize: '16px',
        fontWeight: 600,
        color: 'rgb(74, 110, 80)',
    };

    const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(
        ShippingMethodsEnum.hazhozszallitas
    );

    const handleDeliveryChange = (
        event: React.MouseEvent<HTMLElement>,
        newMethod: ShippingMethodsEnum
    ) => {
        if (newMethod !== null) {
            setSelectedDeliveryMethod(newMethod);
        }
    };

    const shippingMethods = [
        ShippingMethodsEnum.hazhozszallitas,
        ShippingMethodsEnum.atveteli_pontok,
    ] as ShippingMethodsEnum[];

    return (
        <Box sx={{ padding: '0px', width: '100%', maxWidth: '800px', mx: 'auto' }}>
            <ToggleButtonGroup
                value={selectedDeliveryMethod}
                exclusive
                onChange={handleDeliveryChange}
                aria-label="szállítási mód"
                sx={{
                    width: '100%',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '12px',
                    p: '5px',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: '5px',
                }}
            >
                {shippingMethods.map((method) => (
                    <ToggleButton key={method} value={method} sx={toggleButtonStyle}>
                        {method}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>

            <Box sx={{ mt: 3 }}>
                {selectedDeliveryMethod == ShippingMethodsEnum.hazhozszallitas && (
                    <>
                        <HazhozszallitasInfoLista data={HAZHOZSZALLITAS_INFO_ADAT} />
                        <AtveteliPontInfo
                            data={HAZHOZSZALLITAS_KERULET_INFO_ADAT}
                            titleStyle={infoCardtitleStyle}
                        />
                    </>
                )}

                {selectedDeliveryMethod == ShippingMethodsEnum.atveteli_pontok && (
                    <>
                        <Typography
                            sx={{
                                fontWeight: 400,
                                lineHeight: '28px',
                                fontSize: '16px',
                                marginBlockEnd: '14.4px',
                            }}
                        >
                            A személyes átvétel ingyenes.
                        </Typography>
                        <AtveteliPontInfo
                            data={ATVETELIPONT_INFO_ADAT}
                            titleStyle={infoCardtitleStyle}
                        />
                    </>
                )}
            </Box>
        </Box>
    );
}

function HazhozszallitasInfoLista({ data: adat }: Readonly<HazhozSzallitasInfoListaProps>) {
    const listItemStyle = { display: 'list-item', listStyleType: 'disc', p: 0, pl: 1, mb: 1 };

    return (
        <List sx={{ paddingLeft: '40px', pt: 2 }}>
            {adat.map((bekezdes) => (
                <ListItem key={bekezdes} sx={listItemStyle}>
                    <Typography variant="body1">{bekezdes}</Typography>
                </ListItem>
            ))}
        </List>
    );
}

function AtveteliPontInfo({ data, titleStyle }: Readonly<AtveteliPontInfoProps>) {
    return (
        <Box sx={{ pt: 2 }}>
            {data.map((card) => (
                <Box
                    key={card.title}
                    sx={{
                        mb: 2,
                        border: '1px solid rgb(223, 220, 209)',
                        borderRadius: '4px',
                        padding: '18px',
                    }}
                >
                    <Typography sx={titleStyle}>{card.title}</Typography>
                    <Typography variant="body2">{card.text}</Typography>
                </Box>
            ))}
        </Box>
    );
}
