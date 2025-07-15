'use client'

import { toast } from "sonner";

import { Box, Container, Typography } from "@mui/material";

import { fCurrency } from "src/utils/format-number";

import { themeConfig } from "src/theme";
import { useProduct } from "src/contexts/product-context"
import { ProductsProvider } from "src/contexts/products-context";
import { ProducersProvider } from "src/contexts/producers-context";

import { Months } from "src/types/product";

import { Image } from "../image";
import F2FIcons from "../f2ficons/f2ficons";
import ProducerProducts from "./producer-products";
import ProductDetailsSmallInfo from "./product-details-small-info";
import { ProductQuantitySelector } from "../product-card/product-card";
import FeaturedProducerCard from "../producer-card/featured-producer-card";
import { useCheckoutContext } from "src/sections/checkout/context";



export default function ProductDetails() {
    const { onAddToCart } = useCheckoutContext();
    
    const { product, loading, error } = useProduct();
    const renderTitle = () => (
        <Typography variant="h1"
            sx={{ 
                fontSize: {sx:'30px', md:'64px'},
                fontWeight: 600, 
                textTransform: 'uppercase', 
                lineHeight: {sm:'40px', md:'56px'}, 
                letterSpacing: '-0.01em', 
                color: themeConfig.textColor.default, 
                }}>
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
                
                {product.seasonality ? 'Szezonalitás: ' + product.seasonality.map((season, index, months) => (
                    <span style={{ fontWeight: 500 }} key={season}>{Months[season]}{(index < months.length - 1 ? ', ' : '')}</span>
                )) : null}
            </Typography>
        ))
    )
    const renderPriceDetails =()=>{
        const priceDetailsStyle = {
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: { xs: 1, sm: '20px' },
            alignItems: { sm: 'center' },
            justifyContent: 'start',
        };
        const priceStyle = {
            fontFamily: themeConfig.fontFamily.primary,
            fontSize: '18px',
            lineHeight: '18px',
            fontWeight: 700,
            color: themeConfig.textColor.default,
        };
        const unitStyle = {
            fontFamily: themeConfig.fontFamily.primary,
            fontSize: '16px',
            lineHeight: '18px',
            fontWeight: 400,
            color: themeConfig.textColor.muted,
        };
        const formattedPrice = fCurrency(product?.netPrice);
        return (
            <Box sx={priceDetailsStyle}>
                <Typography component="span" sx={priceStyle}>
                    {formattedPrice}
                    <Typography component="span" sx={unitStyle}>
                        &nbsp;/ {product?.unit ?? 'kg'}
                    </Typography>
                </Typography>

                <Typography component="span" sx={unitStyle}>
                    min. {product?.mininumQuantity ?? 1} {product?.unit ?? 'kg'}
                </Typography>
            </Box>
        );
    }
    const renderQuantitySelector = () => (
        <Box sx={{ width: '80%' }}>
            {product != null && <ProductQuantitySelector
                product={product}
                onAddToCart={onAddToCart}
                unit={product.unit}
                max={product.maximumQuantity}
                min={product.mininumQuantity}
                step={product.stepQuantity}
                format="row"
            />}
        </Box>
    )

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
                    sx={{ borderRadius: '8px', width: { xs: "100%", md: "608px" }, height: { xs: "100%", md: "614px" } }} />
            </Box>
            <Box sx={{ width: { xs: "100%", md: '50%' }, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: headRightSectionGap }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', wordBreak: "break-word" }}>
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
            <Box sx={{ 
                backgroundColor: "#f5f5f5", 
                borderRadius:'12px'
            }}>
                    {product?.producerId !== undefined && (
                        <ProducersProvider>
                            <FeaturedProducerCard producerId={product.producerId} />
                        </ProducersProvider>
                    )}
            </Box>
                {product?.producerId !== undefined && (
                    <ProductsProvider>
                        <ProducerProducts producerId={product.producerId} />
                    </ProductsProvider>
                )}
        </>
    );
};