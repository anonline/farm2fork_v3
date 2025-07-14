import type { MonthsEnum} from "src/types/months";

import { Box, Button, Typography } from "@mui/material";

import { Image } from "src/components/image";

import { getMonthName } from "src/types/months";

type SzezonalisKapcsoloProps = {
    month: MonthsEnum;
    selected?: boolean;
    onClick?: () => void;
};

export default function SzezonalisKapcsolo({ month, selected = false, onClick }: Readonly<SzezonalisKapcsoloProps>) {
    
    return (
        <Button
            onClick={onClick}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                borderRadius: 0,
                backgroundColor: selected ? "rgb(247, 245, 239)" : "transparent",
                border: selected ? "0px solid rgb(223, 220, 209)" : "transparent",
                p: 1,
                transition: "all 0.2s",
                '&:hover': {
                    backgroundColor: selected ? "rgb(247, 245, 239)" : "rgba(247, 245, 239, 0.5)",
                    border:"none"
                }
            }}
        >
            <Box sx={{ mt: 1, mb:2 }}>
                <Image
                    src="/assets/images/szezonalitas/monthLogo.webp"
                    alt={month}
                    style={{ width: 44, height: 40 }}
                    visibleByDefault
                />
            </Box>
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 600,
                    textAlign: "center",
                    textTransform: "uppercase",
                    fontSize: "16px",
                    color:"#5b6542"
                }}
            >
                {getMonthName(month).substring(0,3)}
            </Typography>
        </Button>
    );
}
