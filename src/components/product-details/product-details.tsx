'use client'


import { Box, Container, Typography } from "@mui/material";

import { fCurrency } from "src/utils/format-number";

import { themeConfig } from "src/theme";
import { useProduct } from "src/contexts/product-context"
import { ProductsProvider } from "src/contexts/products-context";
import { ProducersProvider } from "src/contexts/producers-context";

import { useCheckoutContext } from "src/sections/checkout/context";

import { Months } from "src/types/product";

import { Image } from "../image";
import F2FIcons from "../f2ficons/f2ficons";
import ProducerProducts from "./producer-products";
import ProductDetailsSmallInfo from "./product-details-small-info";
import { ProductQuantitySelector } from "../product-card/product-card";
import FeaturedProducerCard from "../producer-card/featured-producer-card";



export default function ProductDetails() {
    const { onAddToCart } = useCheckoutContext();

    const { product } = useProduct();
    const renderTitle = () => (
        <Typography variant="h1"
            sx={{
                fontSize: { sx: '30px', md: '64px' },
                fontWeight: 600,
                textTransform: 'uppercase',
                lineHeight: { sm: '40px', md: '56px' },
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
            <Box
                sx={{
                    fontFamily: themeConfig.fontFamily.primary,
                    fontSize: '16px',
                    fontWeight: 700,
                    lineHeight: '24px', letterSpacing: '0.16px', color: themeConfig.textColor.default, textTransform: 'capitalize'
                }}>
                <Typography sx={{ fontWeight: 600, display: 'inline' }}>Szezonalitás: </Typography>
                {product.seasonality.map((season) => (
                    <Typography style={{ fontWeight: 500, display: 'inline' }} key={season}>
                        {Months[season]}
                    </Typography>
                )).reduce((prev, curr, idx) => idx === 0 ? [curr] : [prev, ', ', curr], [] as React.ReactNode[])}
            </Box>
        ))
    )

    const renderPriceDetails = () => {
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
                    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', justifyItems: 'space-between', wordBreak: "break-word" }}>
                        <Box sx={{ width: '90%' }}>
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
            <Container maxWidth="lg" sx={{ paddingTop: '20px', paddingBottom: '20px' }}>
                {renderHead()}
                <Container>
                    <ProductDetailsSmallInfo product={product} />
                </Container>
                {/* galery */}
            </Container>

            <Container maxWidth={false} sx={{
                padding: '0px',
                backgroundColor: "#f5f5f5",
            }}>
                <Container maxWidth="lg" sx={{ padding: '32px' }}>
                    {product?.producerId !== undefined && (
                        <ProducersProvider>
                            <FeaturedProducerCard producerId={product.producerId} />
                        </ProducersProvider>
                    )}
                </Container>
            </Container>
            <Container maxWidth="lg" sx={{ padding: '20px' }}>
                {product?.producerId !== undefined && (
                    <ProductsProvider>
                        <ProducerProducts producerId={product.producerId} />
                    </ProductsProvider>
                )}
            </Container>
        </>
    );
};