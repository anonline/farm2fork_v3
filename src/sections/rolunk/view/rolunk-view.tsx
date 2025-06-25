import { Stack, Container } from '@mui/material';

import RolunkHero from '../rolunk-hero';
import RolunkTeam from '../rolunk-team';
import RolunkWhat from '../rolunk-what';
import RolunkArticles from '../rolunk-articles';


export default function RolunkView() {
    return (
        <Container sx={{alignItems:"center", Width:"100%"}}>
            <Stack spacing={5} >
                <Stack sx={{alignItems:"start"}}>
                    <RolunkHero />
                </Stack>

                <Stack sx={{ bgcolor: "rgb(245, 245, 245)", }}>
                    <RolunkTeam />
                </Stack>

                <Stack >
                    <RolunkWhat />
                </Stack>

                <Stack sx={{ bgcolor: "rgb(245, 245, 245)", }}>
                    <RolunkArticles />
                </Stack>
            </Stack>
        </Container>
    );
}