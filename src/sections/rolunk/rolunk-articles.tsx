'use client'

import { useState, useEffect } from "react";

import { Box, Grid, Stack, Button, Container, Typography, CircularProgress } from "@mui/material";

import { useArticles } from "src/contexts/articles-context";

import RolunkArticleGridItem from "./rolunk-article-griditem";

export default function RolunkArticles() {
    const articlesStorage = useArticles();

    const categories = [...Array.from(new Set(articlesStorage.articles.map(p => p.category)))];
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const INITIAL_VISIBLE_COUNT = 3;
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
    const [loading, setLoading] = useState(false);

    const filteredArticles = activeCategory === categories[0]
        ? articlesStorage.articles
        : articlesStorage.articles.filter(article => article.category === activeCategory);

    const sortedArticles = [...filteredArticles].sort((a, b) => {
        const dateA = new Date(a.publish_date).getTime();
        const dateB = new Date(b.publish_date).getTime();
        return dateB - dateA;
    });

    const handleCategoryChange = (category: string) => {
            setActiveCategory(category);
            setVisibleCount(INITIAL_VISIBLE_COUNT);
    };

    const handleLoadMore = () => {
        setLoading(true);
        setTimeout(() => {
            setVisibleCount(sortedArticles.length);
            setLoading(false);
        }, 1000);
    };

    useEffect(() => {
        if (categories.length && activeCategory !== categories[0]) {
            setActiveCategory(categories[0]);
            setVisibleCount(INITIAL_VISIBLE_COUNT);
        }
    }, [categories.join(",")]);

    return (

        <Container sx={{
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: "24px",
            textAlign: "start",
            py: { xs: 3, md: 5, }
        }}
        >

            <Typography sx={{
                justifySelf: "left",
                fontSize: "40px",
                lineHeight: "48px",
                fontWeight: 600
            }}
                component="h2"
                gutterBottom
            >Cikkek
            </Typography>

            <Box
                sx={{
                    width: "100%",
                    overflowX: { xs: "auto", md: "visible" },
                    mb: 4,
                }}
            >
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        minWidth: 0,
                        flexWrap: { xs: "nowrap", md: "wrap" },
                        gap: 1,
                    }}
                >
                    { categories.map(category => (
                        <Button
                            key={category}
                            onClick={() => handleCategoryChange(category)}
                            sx={{
                                borderBottom: activeCategory === category ? "1px solid black" : "1px solid transparent",
                                borderRadius: 0,
                                fontWeight: activeCategory === category ? 700 : 400,
                                transition: "border-color 0.2s",
                                minWidth: { xs: "120px", md: "auto" },
                                flex: { xs: "1 0 auto", md: "unset" },
                            }}
                        >
                            {category}
                        </Button>
                    ))}
                </Stack>
            </Box>

            <Grid container spacing={{ xs: 2, md: 4 }}>
                {sortedArticles.slice(0, visibleCount).map(article => (
                    <RolunkArticleGridItem key={article.id} article={article} />
                ))}
            </Grid>

            {visibleCount < sortedArticles.length && (
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