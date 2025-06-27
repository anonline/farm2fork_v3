import { Box, Typography} from "@mui/material";
import { Image } from "src/components/image";

export default function RendelesMeneteRegisztracio() {
  const h1Style = {
        fontSize: { xs: "20px", "@media (min-width:767px)": { fontSize: "28px" } },
        lineheight: "38px",
        fontweight:600,
        texttransform: "uppercase",
        TextDecoder: "bold",
    };

    const textStyle = {
        lineheight:"28px",
        fontsize:"16px",
        fontweight:400,
        textsizeadjust:"100%",
    }
  return (
    <Box>
      <Image src=""/>
      <Typography sx={h1Style} component="h1" gutterBottom>Regisztráció</Typography>
      <Typography sx={textStyle} gutterBottom>
        Akár étteremként, akár magánszemélyként rendelsz, elsőként arra kérünk, hozz létre Farm2Fork fiókot. A regisztráció során mondd el, hogy honnan hallottál rólunk és add hozzá a szállítási címedet és elérhetőségedet.
        </Typography>
    </Box>
  );
}