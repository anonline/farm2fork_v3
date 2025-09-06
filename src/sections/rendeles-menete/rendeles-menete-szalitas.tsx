import { Box, List, Typography } from '@mui/material';

import F2FIcons from 'src/components/f2ficons/f2ficons';

import SzalitasiLista from './szalitasilista';

const SZALLITASI_IDOPONTOK = [
    'Éttermeknek ingyenes a kiszállítás. A minimális rendelési összeg nettó 18 000 Ft',
    'Magánszemélyeknek pedig a budai oldalon I., II. és III. XI. és XII. és a pesti oldalon az V., VI., VII.,VIII., XIII. IX. XIV. kerületekben szállítunk ki.',
    'Budaörs, Biatorbágy, Törökbálint és Tata – hétfőn 12-16 óra között',
    'Buda (kiv. III.  és XI. ker) – kedden 8-12 és csütörtökön 12-18 óra között',
    'Buda – III. kerület: kedden 12-16 és csütörtökön 16-20 óra között',
    'Buda – XI. ker – hétfőn 12-16 és csütörtökön 12-16 óra között',
    'Pest – magánszemélyek részére kedden és csütörtökön 12-19 óra között',
    'Szentendre/Pilisszentlászló/Budakalász/Üröm: kedd délután (12-16 óra között) van szállítás.',
    'Balaton: a nyári szezonban Balatonakarattyától Tihanyig (71-es út mentén) szállítunk keddi napokon.',
    'Veszprém – kedd délután (12-16 óra között) van szállítás.',
];

export default function RendelesMeneteSzalitas() {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: '20px',
                flexDirection: { xs: 'column', lg: 'row' },
                paddingX: { xs: '20px', lg: '0px' },
            }}
        >
            <Box sx={{ minWidth: '124.338px', height: '105.6px' }}>
                <F2FIcons name="Truck" height={100} width={100} style={{ color: '#4A6E51' }} />
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    gap: '20px',
                    flexDirection: 'column',
                    paddingLeft: '10px',
                    paddingTop: '15px',
                }}
            >
                <Typography
                    sx={{
                        fontSize: '28px',
                        fontWeight: 600,
                        lineHeight: '36px',
                        textTransform: 'uppercase',
                    }}
                >
                    Szállítás
                </Typography>

                <List sx={{ paddingLeft: '5%' }}>
                    <SzalitasiLista data={SZALLITASI_IDOPONTOK} />
                </List>
            </Box>
        </Box>
    );
}
