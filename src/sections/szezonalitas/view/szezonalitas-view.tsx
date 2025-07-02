import { Box, Container, Typography } from "@mui/material";
import { Months } from "src/types/months";
import SzezonalisHonapKapcsolo from "../szezonalitas-honap-kapcsolo";

type SzezonalitasViewProps = {
    month: Months;
};

export default function SzezonalitasView({ month }: SzezonalitasViewProps) {

    return (
        <Container sx={{paddingX:"0px", paddingY:"32px" }}>
            <Box sx={{display:"flex", flexDirection:"column", gap:"40px"}}>
                <Typography variant="h1" sx={{textTransform:'uppercase', fontWeight:600, paddingRight:10, fontSize:"64px", width:"100%"}} >Szezonalitás</Typography>
                <SzezonalisHonapKapcsolo/>
            </Box>
        </Container>
    );
}