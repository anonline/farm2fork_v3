import { Button, Box, Typography } from "@mui/material";
import { Image } from "src/components/image";

type SzezonalisKapcsoloProps = {
    month: string;
    selected?: boolean;
    onClick?: () => void;
};

export default function SzezonalisKapcsolo({ month, selected = false, onClick }: SzezonalisKapcsoloProps) {
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
                border: selected ? "1px solid rgb(223, 220, 209)" : "transparent",
                p: 1,
                transition: "all 0.2s",
                '&:hover': {
                    backgroundColor: selected ? "rgb(247, 245, 239)" : "rgba(247, 245, 239, 0.5)",
                }
            }}
        >
            <Box sx={{ mt: 1 }}>
                <Image
                    src="/assets/images/szezonalitas/monthLogo.webp"
                    alt={month}
                    style={{ width: 50, height: 50 }}
                    visibleByDefault={true}
                />
            </Box>
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 600,
                    textAlign: "center",
                    textTransform: "uppercase",
                    fontSize: "16px",
                }}
            >
                {month}
            </Typography>
        </Button>
    );
}
