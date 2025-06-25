'use client'

import { useState } from "react";

import { Box, Grid, Stack, Button, Container, Typography, CircularProgress } from "@mui/material";

export default function RolunkArticles() {
    const [loading, setLoading] = useState(false);
    
    const ArticlesTexts = [

        { title: "Cikk 1", description: "Ez az 1. cikk.", image: "https://placehold.co/350x250", category: "Videók" },
        { title: "Cikk 2", description: "Ez a 2. cikk.", image: "https://placehold.co/350x250", category: "Interjúk" },
        { title: "Cikk 3", description: "Ez a 3. cikk.", image: "https://placehold.co/350x250", category: "Esettanulmányok" },
        { title: "Cikk 4", description: "Ez a 4. cikk.", image: "https://placehold.co/350x250", category: "Videók" },
        { title: "Cikk 5", description: "Ez a 5. cikk.", image: "https://placehold.co/350x250", category: "Interjúk" },
        { title: "Cikk 6", description: "Ez a 6. cikk.", image: "https://placehold.co/350x250", category: "Esettanulmányok" },
        { title: "Cikk 7", description: "Ez a 7. cikk.", image: "https://placehold.co/350x250", category: "Videók" },
        { title: "Cikk 8", description: "Ez a 8. cikk.", image: "https://placehold.co/350x250", category: "Interjúk" },
        { title: "Cikk 9", description: "Ez a 9. cikk.", image: "https://placehold.co/350x250", category: "Videók" },
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

            <Typography sx={{ alignSelf: "start", fontSize: "40px", fontFamily:"Bricolage Grotesque" }} component="h2" gutterBottom>Cikkek</Typography>
            
            <Stack direction="row" spacing={2} mb={4} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {categories.map(category => (
                    <Button key={category} onClick={() => handleCategoryChange(category)}>
                        {category}
                    </Button>
                ))}
            </Stack>
            
            <Grid container spacing={{ xs: 2, md: 4 }}>
                {filteredArticles.slice(0, visibleCount).map(article => (

                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }} key={article.title}>
                        <Box>
                            <img src={article.image} alt={article.title} style={{ width: '100%', height: 'auto', borderRadius: "5px", aspectRatio: '350/250', objectFit: 'cover' }} />

                            <Typography variant="h3" component="h3" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" }, mt: 2 }} gutterBottom>
                                {article.title}
                            </Typography>
                            <Typography variant="body1" gutterBottom> {article.description}</Typography>
                        </Box>
                    </Grid>
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
                            fontFamily:"Inter, sans-serif",
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