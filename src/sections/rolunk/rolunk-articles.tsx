'use client'

import { Container, Typography, Box, Grid, Button, Stack, CircularProgress } from "@mui/material";
import { useState } from "react";

export default function RolunkArticles() {
    const [loading, setLoading] = useState(false);
    const ArticlesTexts = [
        {
            title: "Cikk 1",
            description: "Ez az 1. cikk.",
            image: "https://placehold.co/350x250",
            category: "Videók"
        },
        {
            title: "Cikk 2",
            description: "Ez a 2. cikk.",
            image: "https://placehold.co/350x250",
            category: "Interjúk"
        },
        {
            title: "Cikk 3",
            description: "Ez a 3. cikk.",
            image: "https://placehold.co/350x250",
            category: "aGSUIs"
        }
    ];
    const allCategory = "Összes cikk";
    const categories = [allCategory, ...Array.from(new Set(ArticlesTexts.map(p => p.category)))];

    const [activeCategory, setActiveCategory] = useState(allCategory);

    const filteredArticles = activeCategory === allCategory
        ? ArticlesTexts
        : ArticlesTexts.filter(article => article.category === activeCategory);

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
    }; 
        const handleLoadMore = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            // ide jöhetne a cikkek betöltése
        }, 1500);
    };

    return (
        <Container sx={{ fontFamily: " -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;", fontSize: "16px", fontWeight: "400", lineHeight: "24px", textAlignLast: "center", textAlign: "start" }}>
            <Typography sx={{ textAlign: "start" }} variant="h2" component="h2" gutterBottom>Cikkek</Typography>
            <Stack direction="row" spacing={4} mb={2}>
                {categories.map(category => (
                    <Button
                        key={category}
                        variant="text"
                        onClick={() => handleCategoryChange(category)}
                        sx={{
                            fontSize: "16px",
                            borderRadius: 0,
                            transition: "border-color 0.2s",
                            borderBottom: activeCategory === category ? "2px solid rgb(0, 0, 0)" : "none",
                            "&:hover": {
                                borderBottom: "2px solid rgb(0, 0, 0)",
                                backgroundColor: "transparent"
                            }
                        }}
                    >
                        {category}
                    </Button>
                ))}
            </Stack>
            <Grid container spacing={1}>
                {filteredArticles.map(ArticlesText => (
                    <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }} key={ArticlesText.title}>
                        <Box maxWidth={350} mx="auto">
                            <img src={ArticlesText.image} alt={ArticlesText.title} style={{ borderRadius: "5px" }} />
                            <Typography variant="h3" component="h3" sx={{ fontSize: "28px" }} gutterBottom>{ArticlesText.title}</Typography>
                            <Typography variant="body1" gutterBottom> {ArticlesText.description}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ justifyItems: "center", width: "100%" }}>
                <Button
                variant="contained"
                sx={{borderRadius:"3px", alignItems: "center", mt: 4, backgroundColor: "rgb(74, 110, 80)", color: "#fff", fontSize: "16px", fontWeight: "500", lineHeight:"28px", "&:hover": { backgroundColor: "rgb(74, 110, 80)" }, }}
                onClick={handleLoadMore}
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Több cikk betöltése"}
            </Button>
            </Box>
        </Container>
    );
}
