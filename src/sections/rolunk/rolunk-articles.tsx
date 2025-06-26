'use client'

import { useState } from "react";
import { Box, Grid, Stack, Button, Container, Typography, CircularProgress } from "@mui/material";
import RolunkArticleGridItem from "./rolunk-article-griditem";
import { useArticles } from "src/contexts/articles-context";

export default function RolunkArticles() {
    const articlesStorage = useArticles();

    const [loading, setLoading] = useState(false);

    const categories = [...Array.from(new Set(articlesStorage.articles.map(p => p.category)))];

    const [activeCategory, setActiveCategory] = useState(categories[0]);
    
    const INITIAL_VISIBLE_COUNT = 3;

    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    const filteredArticles = activeCategory === categories[0]
        ? articlesStorage.articles
        : articlesStorage.articles.filter(article => article.category === activeCategory);

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

        <Container sx={{ fontSize: "16px",
                         fontWeight: "400", 
                         lineHeight: "24px", 
                         textAlignLast: "center",
                         textAlign: "start", 
                         py: { xs: 3, md: 5, } }}
                         >

            <Typography sx={{   justifySelf: "left",
                                fontSize: "40px", 
                                lineHeight:"48px", 
                                fontWeight:600}} 
                                component="h2" 
                                gutterBottom
                                >Cikkek
                                </Typography>

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