'use client'

import { Box, Grid, SxProps, Typography } from "@mui/material";
import { useState } from "react";
import { Image } from "src/components/image";

type ArticleGridItem = {
    link: string,
    title: string,
    year: string,
    medium: string,
    image: string,
    publish_date: Date,
}

type ArticleGridItemProps = {
    article: ArticleGridItem
}

export default function RolunkArticleGridItem({ article }: Readonly<ArticleGridItemProps>) {

    const handleArticleClick = (link: string) => {
        if (link) {
            window.open(link, "_blank", "noopener,noreferrer");
        }
    };

    const [isHovered, setIsHovered] = useState(false);

    const mainGridStyle = { sm: 12, md: 4, };
    const wrapperStyle = {
        borderBottom: { xs: "1px solid gray", md: "none" },
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        cursor: article.link ? "pointer" : "default",
    };

    const imgStyle: SxProps = {
        width: '100%',
        height: 'auto',
        borderRadius: "8px",
        objectFit: 'cover',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: '#00000000',
        ...(isHovered && { borderColor: "black" })
    };

    const textContainerStyle = { justifyContent: "space-between", display: "flex", my: 3, width: '100%' };

    const mediumTextStyle = { fontSize: { xs: "16px", md: "20px" }, color: "gray", alignSelf: "start" };
    const yearTextStyle = { fontSize: { xs: "16px", md: "20px" }, color: "gray", alignSelf: "end" };
    const titleTextStyle = {
        display: '-webkit-box',
        overflow: 'hidden',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 3,
        minheight:"23px",
        maxheight:"calc(3 * 23px)",
        textSizeAdjust: "100%",
        textTransform: "uppercase",
        textDecorationStyle: "auto",
        lineHeight: "23px",
        textDecorationThickness: "auto",
        fontSize: "20px",
        marginBottom: "16px",
        alignSelf: "start",
        ...(isHovered && { color: "green" }),
    };

    return (
        <Grid
            size={mainGridStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Box
                sx={wrapperStyle}
                onClick={() => handleArticleClick(article.link)}
            >
                <Image src={article.image} alt={article.title} sx={imgStyle} />

                <Box sx={textContainerStyle}>
                    <Typography sx={mediumTextStyle} gutterBottom>
                        {article.medium}
                    </Typography>
                    <Typography sx={yearTextStyle} gutterBottom>
                        {article.year}
                    </Typography>
                </Box>
                <Typography component="h3" sx={titleTextStyle} gutterBottom>
                    {article.title}
                </Typography>
            </Box>
        </Grid>
    );
}