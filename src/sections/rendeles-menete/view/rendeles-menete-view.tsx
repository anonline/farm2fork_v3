import { Box, Container } from '@mui/material';

import { PostcodeProvider } from 'src/contexts/postcode-context';

import RendelesMeneteHero from '../rendeles-menete-hero';
import RendelesMeneteFizetes from '../rendeles-menete-fizetes';
import RendelesMeneteSzalitas from '../rendeles-menete-szalitas';
import RendelesMeneteRegisztracio from '../rendeles-menete-regisztracio';
import RendelesMeneteKiszalitasiCimek from '../rendeles-menete-kiszalitasicimek';
import RendelesMeneteTermekKivalasztas from '../rendeles-menete-termekkivalasztas';
import RendelesMeneteRendelesiIdopontok from '../rendeles-menete-rendelesiidopontok';

export default function RendelesMeneteView() {
    return (
        <PostcodeProvider>
            <Container maxWidth="md">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'widht 0.3s ease-in-out',
                        gap: { xs: '40px', md: '20px' },
                        paddingTop: '50px',
                    }}
                >
                    <RendelesMeneteHero />
                    <RendelesMeneteRegisztracio />
                    <RendelesMeneteTermekKivalasztas />
                    <RendelesMeneteKiszalitasiCimek />
                    <RendelesMeneteRendelesiIdopontok />
                    <RendelesMeneteFizetes />
                    <RendelesMeneteSzalitas />
                </Box>
            </Container>
        </PostcodeProvider>
    );
}
