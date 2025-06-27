import RendelesMeneteHero from '../rendeles-menete-hero';
import RendelesMeneteRendelesiIdopontok from '../rendeles-menete-rendelesiidopontok';
import RendelesMeneteTermekkivalasztas from '../rendeles-menete-termekkivalasztas';
import RendelesMeneteRegisztracio from '../rendeles-menete-regisztracio';
import RendelesMenetekiszalitasiCimek from '../rendeles-menete-kiszalitasicimek';
import RendelesMeneteSzalitas from '../rendeles-menete-szalitas';
import RendelesMeneteFizetes from '../rendeles-menete-fizetes';
import { Container } from '@mui/material';

export default function RendelesMeneteView() {
    return (
        
            <Container sx={{
                marginX: "auto",
                display:"flex",
                flexDirection:"column",
                width: "80%",
                alignItems: "achor-center",
                transition: "widht 0.3s ease-in-out",
                gap:"20px"
                }}> 
                <RendelesMeneteHero />
                <RendelesMeneteRegisztracio />
                <RendelesMeneteTermekkivalasztas />
                <RendelesMenetekiszalitasiCimek />
                <RendelesMeneteRendelesiIdopontok />
                <RendelesMeneteFizetes/>
                <RendelesMeneteSzalitas />
            </Container>
        
    );
}