import { Box, Typography } from '@mui/material';

import F2FIcons from 'src/components/f2ficons/f2ficons';

export default function RendelesMeneteRendelesiIdopontok() {
    const boldedTextStyle = {
        lineHeight: '28px',
        fontSize: '16px',
        fontWeight: 700,
    };

    const plainTextStyle = {
        lineHeight: '28px',
        fontSize: '16px',
        fontWeight: 400,
        marginBlockEnd: '14.4px',
    };

    return (
        <Box
            sx={{
                display: 'flex',
                gap: '20px',
                flexDirection: { xs: 'column', lg: 'row' },
                alignItems: 'start',
                paddingX: { xs: '20px', lg: '0px' },
            }}
        >
            <Box sx={{ minWidth: '124.338px', height: '105.6px', textAlign: 'center' }}>
                <F2FIcons
                    name="RendelesDate"
                    height={100}
                    width={100}
                    style={{ color: '#4A6E51' }}
                />
            </Box>
            <Box sx={{ padding: '10px' }}>
                <Typography
                    sx={{
                        fontSize: '28px',
                        fontWeight: 600,
                        lineHeight: '36px',
                        textTransform: 'uppercase',
                    }}
                >
                    Rendelési időpontok
                </Typography>

                <Typography sx={plainTextStyle}>
                    A szállítási időpontok a rendelés leadásától és a szállítási helytől is
                    függenek. Ez időpont a rendelés közben pontosítódik, azonban általánosan
                    elmondhatóak az alábbiak:
                </Typography>

                <Typography sx={boldedTextStyle}>Szerda 12-ig</Typography>

                <Typography sx={plainTextStyle}>Csütörtökön kerülnek szállításra</Typography>

                <Typography sx={boldedTextStyle}>Vasárnap 12-ig</Typography>

                <Typography sx={plainTextStyle}>Hétfőn vagy kedden kerülnek szállításra</Typography>
            </Box>
        </Box>
    );
}
