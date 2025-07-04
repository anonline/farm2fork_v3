'use client'

import { toast } from "sonner";

import { Box, Container, Typography } from "@mui/material";

import { themeConfig } from "src/theme";
import { useProduct } from "src/contexts/product-context"

import { Months } from "src/types/product";

import F2FIcons from "../f2ficons/f2ficons";
import { ProductQuantitySelector } from "../product-card/product-card";
import ProductDetailsSmallInfo from "./product-details-small-info";
import FeaturedProducerCard from "../producer-card/featured-producer-card";
import ProducerProducts from "./producer-products";
import { ProductsProvider } from "src/contexts/products-context";
import { Image } from "../image";



export default function ProductDetails() {
    const { product, loading, error } = useProduct();

    const renderTitle = () => (
        <Typography variant="h1"
            sx={{ fontSize: '64px', fontWeight: 600, textTransform: 'uppercase', lineHeight: '56px', letterSpacing: '-0.01em', color: themeConfig.textColor.default }}>
            {product?.name}
        </Typography>
    )

    const renderDescription = () => (
        <Typography
            sx={{ fontFamily: themeConfig.fontFamily.primary, fontSize: '16px', fontWeight: 400, lineHeight: '24px', letterSpacing: '0.32px', color: themeConfig.textColor.default }}>
            {product?.shortDescription}
        </Typography>
    )

    const renderSeasonality = () => (
        (product?.seasonality && (
            <Typography
                sx={{
                    fontFamily: themeConfig.fontFamily.primary,
                    fontSize: '16px',
                    fontWeight: 700,
                    lineHeight: '24px', letterSpacing: '0.16px', color: themeConfig.textColor.default, textTransform: 'capitalize'
                }}>
                Szezonalitás: {product.seasonality && product.seasonality.map((season, index, months) => (
                    <span style={{ fontWeight: 500 }} key={season}>{Months[season]}{(index < months.length - 1 ? ', ' : '')}</span>
                ))}
            </Typography>
        ))
    )

    const renderPriceDetails = () => {
        const priceDetailsStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            justifyContent: 'start',
        }

        const priceStyle: React.CSSProperties = {
            fontFamily: themeConfig.fontFamily.primary,
            fontSize: '18px',
            lineHeight: '18px',
            fontWeight: 700,
            color: themeConfig.textColor.default,
        }

        const unitStyle: React.CSSProperties = {
            fontFamily: themeConfig.fontFamily.primary,
            fontSize: '16px',
            lineHeight: '18px',
            fontWeight: 400,
            color: themeConfig.textColor.muted,
        }



        return (
            <div style={priceDetailsStyle}>
                <span style={priceStyle}>
                    {product?.netPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') ?? 999} Ft <span style={unitStyle}>/ {product?.unit ?? 'kg'}</span>
                </span>
                <span style={unitStyle}>
                    min. {product?.mininumQuantity ?? 1} {product?.unit ?? 'kg'}
                </span>
            </div>
        );
    }


    const renderQuantitySelector = () => (
        <Box sx={{ width: '80%' }}>
            <ProductQuantitySelector
                onAddToCart={handleAddToCart}
                unit={product?.unit}
                max={product?.maximumQuantity}
                min={product?.mininumQuantity}
                step={product?.stepQuantity}
                format="row"
            />
        </Box>
    )

    const handleAddToCart = () => {
        toast.success("Sikeresen kosárhoz adva.");
    }

    const headRightSectionGap = '20px';

    const renderHead = () => (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: "row" },
                gap: 5,
            }}>
            <Box>
                <Image alt={product?.name ?? ""} src={product?.featuredImage ?? "https://placehold.co/608x614"} 
                sx={{ borderRadius: '8px', width:{xs:"100%", md:"608px"}, height:{xs:"100%", md:"614px"} }} />
            </Box>
            <Box sx={{ width: { xs: "100%", md: '50%' }, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: headRightSectionGap }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', wordBreak:"break-word" }}>
                        <Box>
                            {renderTitle()}
                        </Box>
                        <Box>
                            {product?.bio && (<F2FIcons name="BioBadge" width={64} height={32} />)}
                        </Box>
                    </Box>

                    {renderDescription()}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: headRightSectionGap }}>
                    {renderSeasonality()}

                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: headRightSectionGap }}>
                    {renderPriceDetails()}
                    {renderQuantitySelector()}
                </Box>
            </Box>
        </Box>
    )

    return (
        <>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {renderHead()}
            <Container>
                <ProductDetailsSmallInfo product={product} />
            </Container>
            {/* galery */}
            <Box sx={{ backgroundColor: "#f5f5f5", }}>
                <Container>
                    {product?.producerId !== undefined && (
                        <FeaturedProducerCard producerId={product.producerId} />
                    )}
                </Container>
            </Box>
            <Container>
                {product?.producerId !== undefined && (
                    <ProductsProvider>
                        <ProducerProducts producerId={product.producerId} />
                    </ProductsProvider>
                )}
            </Container>
        </>

    );
};