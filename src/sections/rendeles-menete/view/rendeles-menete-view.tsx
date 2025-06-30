import { Box, Container } from '@mui/material';

import { PostcodeProvider } from 'src/contexts/postcode-context';

import RendelesMeneteHero from '../rendeles-menete-hero';
import RendelesMeneteFizetes from '../rendeles-menete-fizetes';
import RendelesMeneteSzalitas from '../rendeles-menete-szalitas';
import RendelesMeneteRegisztracio from '../rendeles-menete-regisztracio';
import RendelesMenetekiszalitasiCimek from '../rendeles-menete-kiszalitasicimek';
import RendelesMeneteTermekkivalasztas from '../rendeles-menete-termekkivalasztas';
import RendelesMeneteRendelesiIdopontok from '../rendeles-menete-rendelesiidopontok';

export default function RendelesMeneteView() {
    return (
        <PostcodeProvider>
            <Container>
                <Container>
                    <Container>
                        <Box sx={{
                            marginX: "auto",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "achor-center",
                            transition: "widht 0.3s ease-in-out",
                            gap: "10px",
                            paddingTop: "50px",
                        }}>
                            <RendelesMeneteHero />
                            <RendelesMeneteRegisztracio />
                            <RendelesMeneteTermekkivalasztas />
                            <RendelesMenetekiszalitasiCimek />
                            <RendelesMeneteRendelesiIdopontok />
                            <RendelesMeneteFizetes />
                            <RendelesMeneteSzalitas />
                        </Box>
                    </Container>
                </Container>
            </Container>
        </PostcodeProvider>
    );
}