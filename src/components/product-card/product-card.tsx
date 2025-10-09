import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { IProductItem } from 'src/types/product';
import type { CheckoutContextValue } from 'src/types/checkout';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Box, Paper, Button, Tooltip, InputBase, IconButton, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { fCurrency } from 'src/utils/format-number';

import { themeConfig } from 'src/theme';

import { toast } from 'src/components/snackbar';

import { useCheckoutContext } from 'src/sections/checkout/context';

import { useAuthContext } from 'src/auth/hooks';

import F2FIcons from '../f2ficons/f2ficons';
import BioBadge from '../bio-badge/bio-badge';

interface ProductCardProps {
    product: IProductItem;
}

export default function ProductCard(props: Readonly<ProductCardProps>) {
    const { onAddToCart, state: checkoutState } = useCheckoutContext();
    const { user } = useAuthContext();
    const { product } = props;
    const router = useRouter();

    const isOrderDeny = !(product.stock === null || product.backorder === true || (product.stock > 0));

    const openProductPage = () => {
        router.push(paths.product.details(product.url));
    };

    const isVIP = user?.user_metadata.is_vip || false;
    const isCorp = user?.user_metadata.is_corp || false;

    const productCardStyle: SxProps<Theme> = {
        border: '1px solid #0000001A',
        borderRadius: '8px',
        boxShadow: '0px 2px 12px 0px #DFDBD14D',
        maxWidth: {
            xs: '100%',
            sm: '100%',
            md: '100%',
            lg: 249,
            xl: 249,
        },
        p: 0,
        backgroundColor: themeConfig.palette.common.white,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    };

    const productCardDetailsUpperContainterStyle: React.CSSProperties = {
        padding: '32px 16px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
    };

    const productCardDetailsUpperLabelContainerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        height: 52,
    };

    const productCardNameStyle: React.CSSProperties = {
        fontSize: 18,
        fontWeight: 500,
        color: '#262626',
        lineHeight: '25px',
        fontFamily: themeConfig.fontFamily.primary,
        letterSpacing: '0em',
        margin: 0,
        cursor: 'pointer',
    };

    const productCardPriceContentStyle: React.CSSProperties = {
        padding: '16px',
        display: 'flex',
        gap: 16,
    };

    const productCardPriceDetailsStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
    };

    const getNetPrice = () => {
        if (isVIP) {
            return Math.min(product.netPriceVIP, product.netPriceVIP* (1-(checkoutState.discountPercent || 0)/100));
        }

        if (isCorp) {
            return Math.min(product.netPriceCompany, product.netPriceCompany*(1-(checkoutState.discountPercent || 0)/100));
        }

        return Math.min(product.netPrice, product.netPrice*(1-(checkoutState.discountPercent || 0)/100));
    }

    const getVatPercent = () => {
        if (isVIP) {
            return 0;
        }

        return product.vat;
    }

    const getGrossPrice = () => getNetPrice() * (1 + getVatPercent() / 100)

    return (
        <Paper className="product-card" sx={productCardStyle}>
            <Box
                component="button"
                onClick={openProductPage}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openProductPage();
                    }
                }}
                sx={{
                    all: 'unset',
                    cursor: 'pointer',
                    display: 'block',
                    p: 0,
                    border: 'none',
                    background: 'none',
                    width: '100%',
                    overflow: 'hidden',
                    '& img': {
                        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                    },
                    '&:hover img': {
                        transform: 'scale(1.07)',
                    },
                }}
                tabIndex={0}
                aria-label={product.name}
            >
                <Box
                    sx={{
                        height: { xs: 200, sm: 249, md: 249, lg: 249, xl: 249 },
                        width: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                    }}
                >
                    <Image
                        src={
                            product.featuredImage ||
                            'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp'
                        }
                        alt={product.name}
                        fill
                        style={{
                            objectFit: 'cover',
                            cursor: 'pointer',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            filter: isOrderDeny ? 'grayscale(1) brightness(0.7)' : 'none',
                        }}
                    />
                </Box>
            </Box>

            {product.bio && <BioBadge style={{ position: 'absolute', top: 16, right: 16 }} />}

            <div style={productCardDetailsUpperContainterStyle}>
                {checkoutState.items.filter((x) => x.id == product.id).length > 0 && (
                    <F2FIcons
                        name="Check"
                        width={40}
                        height={40}
                        style={{
                            position: 'absolute',
                            top: -20,
                            right: 16,
                            color: themeConfig.palette.primary.dark,
                            backgroundColor: themeConfig.palette.primary.light,
                            borderRadius: '50%',
                            padding: 4,
                            border: '3px solid #ffffff',
                        }}
                    />
                )}
                <div style={productCardDetailsUpperLabelContainerStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                        <button
                            type="button"
                            style={{
                                ...productCardNameStyle,
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                textAlign: 'left',
                                cursor: 'pointer',
                                flex: 1,
                                marginRight: product.cardText ? 8 : 0,
                            }}
                            onClick={openProductPage}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    openProductPage();
                                }
                            }}
                            tabIndex={0}
                            aria-label={product.name}
                        >
                            {product.name}
                        </button>

                    </div>
                    {product.producerId && product.producer?.featuredImage && <ProducerAvatar
                        avatarUrl={product.producer?.featuredImage ?? 'https://placehold.co/48'}
                        avatarAlt="Termelő"
                        style={{ position: 'absolute', top: -24, left: 16 }}
                    />}
                </div>
            </div>
            <div style={productCardPriceContentStyle}>
                <div className="productCardPriceDetails" style={productCardPriceDetailsStyle}>
                    <ProductPriceDetails grossPrice={isVIP || isCorp ? getNetPrice() : getGrossPrice()} unit={product.unit} cardText={product.cardText} />
                    <ProductQuantitySelector
                        product={product}
                        onAddToCart={onAddToCart}
                        unit={product.unit}
                        min={product.mininumQuantity}
                        discountPercent={checkoutState.discountPercent || 0}
                        max={product.stock === null || product.backorder === true ? product.maximumQuantity : product.stock}
                        step={product.stepQuantity}
                    />
                </div>
            </div>
        </Paper>
    );
}

function ProducerAvatar({
    avatarUrl,
    avatarAlt,
    style,
}: Readonly<{ avatarUrl: string; avatarAlt?: string; style?: React.CSSProperties }>) {
    const avatarStyle: React.CSSProperties = {
        width: 48,
        height: 48,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid #ffffff',
        ...style,
    };
    return <img src={avatarUrl} alt={avatarAlt ?? 'Termelő'} style={avatarStyle} />;
}

export function ProductPriceDetails({
    grossPrice = 2000,
    unit = 'db',
    cardText
}: Readonly<{ grossPrice?: number; unit?: string; cardText?: string }>) {
    const priceDetailsStyle: SxProps<Theme> = {
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
        justifyContent: { xs: 'flex-start', md: 'space-between' },
        alignItems: 'center',
    };

    const priceStyle: SxProps<Theme> = {
        fontFamily: themeConfig.fontFamily.primary,
        fontSize: { xs: '16px', md: '18px' },
        lineHeight: '18px',
        fontWeight: 700,
        color: themeConfig.textColor.default,
    };

    const unitStyle: SxProps<Theme> = {
        fontFamily: themeConfig.fontFamily.primary,
        fontSize: { xs: '12px', md: '16px' },
        lineHeight: '18px',
        fontWeight: 400,
        color: themeConfig.textColor.muted,
    };

    return (
        <Box sx={priceDetailsStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 0.5 }}>
                <Typography sx={priceStyle}>{fCurrency(grossPrice)} </Typography>
                <Typography sx={unitStyle}>/ {unit}</Typography>
            </Box>

            {cardText && (
                <Tooltip title={cardText} arrow placement="top">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: 2,
                        flexShrink: 0
                    }}>
                        <F2FIcons
                            name="Info"
                            width={18}
                            height={18}
                            style={{ color: '#BDB5A2' }}
                        />
                    </div>
                </Tooltip>
            )}
        </Box>
    );
}

type ProductQuantitySelectorProps = {
    product: IProductItem;
    showAddToCart?: boolean;
    onAddToCart?: CheckoutContextValue['onAddToCart'];
    format?: 'column' | 'row';
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    onQuantityChange?: (quantity: number) => void;
    showUnit?: boolean;
    discountPercent?: number;
};

export function ProductQuantitySelector({
    product,
    onAddToCart,
    format = 'column',
    min = 1,
    max = 999,
    step = 0.2,
    unit = 'csomag',
    showAddToCart = true,
    onQuantityChange,
    showUnit = true,
    discountPercent = 0,
}: Readonly<ProductQuantitySelectorProps>) {
    const inputTextStyle: React.CSSProperties = {
        textAlign: 'center',
        color: themeConfig.textColor.grey,
        fontFamily: themeConfig.fontFamily.primary,
        fontWeight: 500,
        fontSize: 16,
        lineHeight: '22px',
    };

    const outOfStock = !(product.stock === null || product.stock > 0 || product.backorder === true);

    const [quantity, setQuantity] = useState<number>();
    const [inputValue, setInputValue] = useState<string>('');
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(outOfStock);
    const [plusButtonEnabled, setPlusButtonEnabled] = useState<boolean>(!outOfStock);
    const [minusButtonEnabled, setMinusButtonEnabled] = useState<boolean>(!outOfStock);

    const plusminusButtonBaseStyle: SxProps<Theme> = {
        p: '10px',
        maxWidth: '45px',
        borderRadius: '7px',
        color: '#bababa',
        //backgroundColor: themeConfig.palette.primary.main,
        '&:hover': {
            backgroundColor: themeConfig.palette.primary.dark,
        },
        '&:hover svg': {
            color: themeConfig.palette.common.white,
        },
    };

    const minusButtonStyle: SxProps<Theme> = {
        ...plusminusButtonBaseStyle,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    };

    const plusButtonStyle: SxProps<Theme> = {
        ...plusminusButtonBaseStyle,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
    };

    useEffect(() => {
        if (quantity) {
            if (quantity <= min) {
                setMinusButtonEnabled(false);
            }
            else {
                setMinusButtonEnabled(true);
            }

            if (quantity >= max) {
                setPlusButtonEnabled(false);
            }
            else {
                setPlusButtonEnabled(true);
            }
        }
    }, [quantity])

    const inputChangeHandler = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const decimals = 0;

        const value = parseFloat(event.target.value.replace(',', '.'));
        if (value === 0 || isNaN(value)) {
            setInputValue('');
            setQuantity(undefined);
            setButtonDisabled(true);
            if (onQuantityChange) {
                onQuantityChange(1);
            }
            return;
        }

        if (value < min) {
            setInputValue(printQtyWithUnit(min));
            setQuantity(min);
            setButtonDisabled(false);
            if (onQuantityChange) {
                onQuantityChange(min);
            }
            return;
        }

        if (value > max) {
            setInputValue(printQtyWithUnit(max));
            setQuantity(max);
            setButtonDisabled(false);
            if (onQuantityChange) {
                onQuantityChange(min);
            }
            return;
        }

        if (value % step !== 0) {
            const roundedValue = parseFloat((Math.round(value / step) * step).toFixed(1));
            setInputValue(printQtyWithUnit(roundedValue));
            setQuantity(roundedValue);
            if (onQuantityChange) {
                onQuantityChange(roundedValue);
            }
        } else {
            setInputValue(printQtyWithUnit(value));
            setQuantity(value);
            if (onQuantityChange) {
                onQuantityChange(value);
            }
        }

        setButtonDisabled(false);
    };

    const handlePlusClick = () => {
        let newQty = quantity;

        if (quantity === undefined || isNaN(quantity)) {
            setQuantity(min);
            setInputValue(printQtyWithUnit(min));
            setButtonDisabled(false);
        } else {
            newQty = quantity + step;
            if (newQty > max) {
                newQty = max;
            }
            setQuantity(newQty);
            setInputValue(printQtyWithUnit(newQty));
            setButtonDisabled(false);
        }

        if (onQuantityChange) {
            onQuantityChange(newQty ?? min);
        }
    };

    const handleMinusClick = () => {
        let newQty = quantity;

        if (quantity === undefined || isNaN(quantity)) {
            setQuantity(min);
            setInputValue(printQtyWithUnit(min));
            setButtonDisabled(false);
        } else {
            newQty = quantity - step;
            if (newQty < min) {
                newQty = min;
            }
            setQuantity(newQty);
            setInputValue(printQtyWithUnit(newQty));
            setButtonDisabled(false);
        }

        if (onQuantityChange) {
            onQuantityChange(newQty ?? min);
        }
    };

    const printQtyWithUnit = (qty: number) => {
        if (qty === undefined || isNaN(qty)) {
            return '';
        }
        const decimals = qty % 1 === 0 ? 0 : 1;
        if (showUnit) {
            return qty.toFixed(decimals) + ' ' + unit;
        } else {
            return qty.toFixed(decimals);
        }
    };

    return (
        <Box sx={{ display: 'flex', width: '100%', flexDirection: { xs: 'column', sm: format }, gap: 1 }}>
            <Paper
                sx={{
                    border: '1px solid #A4A3A1',
                    borderRadius: '8px',
                    p: '0px 0px',
                    display: 'flex',
                    alignItems: 'center',
                    width: { xs: '100%', sm: format == 'column' ? '100%' : '50%' },
                }}
            >
                <IconButton sx={minusButtonStyle} onClick={handleMinusClick} disabled={!minusButtonEnabled}>
                    <F2FIcons name="Minus" width={24} height={24} style={{ color: '#bababa' }} />
                </IconButton>
                <InputBase
                    sx={{
                        ml: 1,
                        flex: 1,
                        height: { xs: 40, md: 44 },
                        textAlign: 'center',
                        input: {
                            '::placeholder': {
                                color: themeConfig.textColor.muted,
                                fontSize: { xs: 10, md: 16 },
                                fontWeight: 400,
                                fontFamily: themeConfig.fontFamily.primary,
                                letterSpacing: '0.02em',
                            },
                        },
                    }}
                    placeholder={'min. ' + min + ' ' + unit}
                    inputProps={{
                        inputMode: 'text',
                        style: inputTextStyle,
                    }}
                    value={inputValue}
                    onFocus={(e) => {
                        let floatValueToDisplay = parseFloat(inputValue);
                        if (isNaN(floatValueToDisplay)) {
                            floatValueToDisplay = min;
                        }
                        setInputValue(floatValueToDisplay.toFixed(1).toString());

                        //késleltetett kijelölés
                        setTimeout(() => {
                            (e.target as HTMLInputElement).select();
                        }, 0);
                    }}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                    }}
                    onBlur={(e) => {
                        inputChangeHandler(e);
                    }}
                />
                <IconButton sx={plusButtonStyle} onClick={handlePlusClick} disabled={!plusButtonEnabled}>
                    <F2FIcons name="Add" width={24} height={24} style={{ color: '#bababa' }} />
                </IconButton>
            </Paper>
            {showAddToCart && (
                <ProductCardButton
                    qty={quantity || 1}
                    product={product}
                    label="Kosár"
                    discountPercent={discountPercent || 0}
                    onAddToCart={onAddToCart ?? undefined}
                    isDisabled={buttonDisabled || quantity === undefined || isNaN(quantity) || outOfStock}
                    sx={{ width: {xs: '100%', sm: format == 'column' ? '100%' : '50%' }}}
                />
            )}
        </Box>
    );
}

type ProductCardButtonProps = {
    qty: number;
    product: IProductItem;
    label: string;
    onAddToCart?: CheckoutContextValue['onAddToCart'];
    isDisabled?: boolean;
    sx?: SxProps;
    discountPercent?: number;
};

function ProductCardButton({
    qty = 1,
    product,
    label,
    onAddToCart,
    isDisabled = false,
    discountPercent = 0,
    sx,
}: Readonly<ProductCardButtonProps>) {
    // if we want to open sidecart on addToCart we should use this: const { openSideCart } = useSideCart();
    const { user } = useAuthContext();
    
    const baseStyle: SxProps = {
        ...sx,
        padding: '10px 16px',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: { xs: 13, md: 16 },
        fontFamily: themeConfig.fontFamily.primary,
        height: { xs: 40, md: 44 },
    };

    const buttonStyle: SxProps = {
        ...baseStyle,
        color: themeConfig.palette.common.white,
        cursor: 'pointer',
    };

    const disabledButtonStyle: SxProps = {
        ...baseStyle,
        borderColor: '#dfdcd1',
        color: '#dfdcd1',
        cursor: 'not-allowed',
    };

    const getGrossPrice = () => {
        if (user?.user_metadata?.is_vip) {
            return Math.min(product?.netPriceVIP, product?.netPriceVIP * (1 - (discountPercent || 0) / 100)) * (1 + (product?.vat ?? 0) / 100);
        }

        if (user?.user_metadata?.is_corp) {
            return Math.min(product?.netPriceCompany, product?.netPriceCompany * (1 - (discountPercent || 0) / 100)) * (1 + (product?.vat ?? 0) / 100);
        }

        if(product?.salegrossPrice){
            return Math.min(product?.salegrossPrice, product?.salegrossPrice * (1 - (discountPercent || 0) / 100));
        }

        return Math.min(product?.grossPrice, product?.grossPrice * (1 - (discountPercent || 0) / 100));
    }

    const getNetPrice = () => {
        if (user?.user_metadata?.is_vip) {
            return Math.min(product?.netPriceVIP, product?.netPriceVIP * (1 - (discountPercent || 0) / 100));
        }

        if (user?.user_metadata?.is_corp) {
            return Math.min(product?.netPriceCompany, product?.netPriceCompany * (1 - (discountPercent || 0) / 100));
        }

        if (product?.salegrossPrice) {
            return product?.salegrossPrice / (1 + (product?.vat ?? 0) / 100);
        }

        return Math.min(product?.netPrice, product?.netPrice * (1 - (discountPercent || 0) / 100));
    }

    const getVatPercent = () => {
        if (user?.user_metadata?.is_vip) {
            return 0;
        }

        return product?.vat ?? 27;
    }

    const handleButtonClick = () => {
        if (onAddToCart) {
            onAddToCart({
                id: product.id,
                name: product.name,
                grossPrice: getGrossPrice(),
                netPrice: getNetPrice(),
                coverUrl: product.featuredImage,
                quantity: qty,
                vatPercent: getVatPercent(),
                unit: product.unit,
                available: product.maximumQuantity,
                //subtotal: (isVIP || isADMIN || isCORP) ? product.netPrice : product.grossPrice,
                minQuantity: product.mininumQuantity,
                maxQuantity: product.maximumQuantity,
                stepQuantity: product.stepQuantity,
                slug: product.url
            });

            let decimal = 2;

            if(qty % 1 === 0){
                decimal = 0;
            }
            else if((qty*10) % 1 === 0){
                decimal = 1;
            }

            toast.success(`${qty.toFixed(decimal)} ${product.unit} ${product.name} kosárhoz adva.`);
            // if we want to open sidecart on addToCart we should use this: openSideCart();
        }
    };
    return (
        <Button
            variant={isDisabled ? 'outlined' : 'contained'}
            disabled={isDisabled}
            color={isDisabled ? 'inherit' : 'primary'}
            onClick={handleButtonClick}
            sx={isDisabled ? disabledButtonStyle : buttonStyle}
        >
            {label}
        </Button>
    );
}
