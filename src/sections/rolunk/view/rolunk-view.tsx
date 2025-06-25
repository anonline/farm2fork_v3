import { Stack, Container, Box } from '@mui/material';

import RolunkHero from '../rolunk-hero';
import RolunkTeam from '../rolunk-team';
import RolunkWhat from '../rolunk-what';
import RolunkArticles from '../rolunk-articles';


export default function RolunkView() {
    return (
        <Box sx={{alignItems:"center", rowGap:"10px", columnGap:"10px",}}>
            <Stack spacing={5} >
                <Stack sx={{alignItems:"start"}}>
                    <RolunkHero />
                </Stack>

                <Stack sx={{ bgcolor: "rgb(245, 245, 245)", width: "100%" }}>
                    <RolunkTeam />
                </Stack>

                <Stack >
                    <RolunkWhat />
                </Stack>

                <Stack sx={{ bgcolor: "rgb(245, 245, 245)", width: "100%" }}>
                    <RolunkArticles />
                </Stack>
            </Stack>
        </Box>
    );
}