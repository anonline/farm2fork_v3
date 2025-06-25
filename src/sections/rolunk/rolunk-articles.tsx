'use client'

import { useState } from "react";

import { Box, Grid, Stack, Button, Container, Typography, CircularProgress } from "@mui/material";
import RolunkArticleGridItem from "./rolunk-article-griditem";

export default function RolunkArticles() {
    const [loading, setLoading] = useState(false);

    const ArticlesTexts = [

        { id: "1", title: "Cikk 1", medium: "a", image: "https://placehold.co/350x250", category: "Videók", link: "#", year: "123" },
        { id: "2", title: "Cikk 2", medium: "b", image: "https://placehold.co/350x250", category: "Interjúk", link: "#", year: "1324" },
        { id: "3", title: "Cikk 3", medium: "re", image: "https://placehold.co/350x250", category: "Esettanulmányok", link: "#", year: "321" },
        { id: "4", title: "Cikk 4", medium: "awdf", image: "https://placehold.co/350x250", category: "Videók", link: "#", year: "514" },
        { id: "5", title: "Cikk 5", medium: "htrm", image: "https://placehold.co/350x250", category: "Interjúk", link: "#", year: "324" },
        { id: "6", title: "Cikk 6", medium: "brg", image: "https://placehold.co/350x250", category: "Esettanulmányok", link: "", year: "532" },
        { id: "7", title: "Cikk 7", medium: "awfg", image: "https://placehold.co/350x250", category: "Videók", link: "#", year: "324" },
        { id: "8", title: "Cikk 8", medium: "ht", image: "https://placehold.co/350x250", category: "Interjúk", link: "#", year: "532" },
        { id: "9", title: "Cikk 9", medium: "ht", image: "https://placehold.co/350x250", category: "Videók", link: "#", year: "624" },
    ];

    const allCategory = "Összes cikk";
    const categories = [allCategory, ...Array.from(new Set(ArticlesTexts.map(p => p.category)))];

    const [activeCategory, setActiveCategory] = useState(allCategory);
    const INITIAL_VISIBLE_COUNT = 3;
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    const filteredArticles = activeCategory === allCategory
        ? ArticlesTexts
        : ArticlesTexts.filter(article => article.category === activeCategory);

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    };

    const handleLoadMore = () => {
        setLoading(true);
        setTimeout(() => {
            setVisibleCount(filteredArticles.length);
            setLoading(false);
        }, 1000);
    };



    return (

        <Container sx={{ fontFamily: " -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;", fontSize: "16px", fontWeight: "400", lineHeight: "24px", textAlignLast: "center", textAlign: "start", py: { xs: 3, md: 5, } }}>

            <Typography sx={{ justifySelf: "left", fontSize: "40px", fontFamily: "Bricolage Grotesque" }} component="h2" gutterBottom>Cikkek</Typography>

            <Stack direction="row" spacing={2} mb={4} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {categories.map(category => (
                    <Button key={category} onClick={() => handleCategoryChange(category)}>
                        {category}
                    </Button>
                ))}
            </Stack>

            <Grid container spacing={{ xs: 2, md: 4 }}>
                {filteredArticles.slice(0, visibleCount).map(article => (
                    <RolunkArticleGridItem key={article.id} article={article} />
                ))}
            </Grid>

            {visibleCount < filteredArticles.length && (
                <Box sx={{ display: 'flex', justifyContent: "center", width: "100%", mt: { xs: 3, md: 5 } }}>
                    <Button
                        variant="contained"
                        sx={{
                            borderRadius: "3px",
                            alignItems: "center",
                            backgroundColor: "rgb(74, 110, 80)",
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: "500",
                            lineHeight: "28px",
                            fontFamily: "Inter, sans-serif",
                            "&:hover": { backgroundColor: "rgb(60, 90, 65)" },
                        }}
                        onClick={handleLoadMore}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Továbbiak betöltése"}
                    </Button>
                </Box>
            )}
        </Container>
    );
}