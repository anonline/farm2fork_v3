import { Box, Typography } from "@mui/material";
import F2FIcons from "src/components/f2ficons/f2ficons";

export default function RendelesMeneteRegisztracio() {
  const h1Style = {
        fontSize: { xs: "20px", "@media (min-width:767px)": { fontSize: "28px" } },
        lineHeight: "30px" ,
        fontWeight:600,
        textTransform: "uppercase",
        TextDecoder: "bold",
    };

    const textStyle = {
        lineHeight:"28px",
        fontSize:"16px",
        fontWeight:400,
        textSizeadjust:"100%",
    }
  return (
    <Box sx={{display:"flex", gap:"20px"}}>
      <Box>
        <F2FIcons name="FileIcon" height={100} width={100} style={{ color: 'rgb(74,110,80)' }} />
      </Box>
      <Box>
        <Typography sx={h1Style} component="h1" gutterBottom>Regisztráció</Typography>
        <Typography sx={textStyle} gutterBottom>
          Akár étteremként, akár magánszemélyként rendelsz, elsőként arra kérünk, hozz létre Farm2Fork fiókot. A regisztráció során mondd el, hogy honnan hallottál rólunk és add hozzá a szállítási címedet és elérhetőségedet.
        </Typography>
      </Box>
    </Box>
  );
}