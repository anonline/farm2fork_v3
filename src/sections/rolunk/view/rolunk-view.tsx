import { Stack } from '@mui/material';
import  RolunkHero  from '../rolunk-hero';
import RolunkTeam from '../rolunk-team';
import RolunkWhat from '../rolunk-what';
import RolunkArticles from '../rolunk-articles';


// ----------------------------------------------------------------------

export default function RolunkView() {
    return (
        <Stack spacing={5}>
            <Stack>
                <RolunkHero />
            </Stack>

            <Stack sx={{ bgcolor: "rgb(245, 245, 245)", minHeight: "calc(100% + 20%)" }}>
                <RolunkTeam />
            </Stack>

            <Stack>
                <RolunkWhat />
            </Stack>

            <Stack sx={{ bgcolor: "rgb(245, 245, 245)" }}>
                <RolunkArticles />
            </Stack>
        </Stack>

    );
}