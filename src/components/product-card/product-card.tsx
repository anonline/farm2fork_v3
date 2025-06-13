import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { IProductItem } from 'src/types/product';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Box, Paper, Button, InputBase, IconButton } from '@mui/material';

import { themeConfig } from 'src/theme';

import { toast } from 'src/components/snackbar';

import F2FIcons from '../f2ficons/f2ficons';
import BioBadge from '../bio-badge/bio-badge';

interface ProductCardProps {
    product: IProductItem;
}

export default function ProductCard(props: ProductCardProps) {
    const { product } = props;
    const router = useRouter();

    const openProductPage = () => {
        router.push(`/termekek/${product.url}`);
    }

    const [inCart, setInCart] = useState<boolean>(false);

    const productCardStyle: SxProps<Theme> = {
        border: '1px solid #0000001A',
        borderRadius: '8px',
        boxShadow: "0px 2px 12px 0px #DFDBD14D",
        maxWidth: {
            xs: '100%',
            sm: 249,
            md: 249,
            lg: 249,
            xl: 249
        },
        p: 0,
        backgroundColor: themeConfig.palette.common.white,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    }

    const productImageStyle: React.CSSProperties = {
        width: '100%',
        height: 249,
        objectFit: 'cover',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        cursor: 'pointer',
    }

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
    }

    const productCardNameStyle: React.CSSProperties = {
        fontSize: 18,
        fontWeight: 500,
        color: '#262626',
        lineHeight: '25px',
        fontFamily: themeConfig.fontFamily.primary,
        letterSpacing: '0em',
        margin: 0,
        cursor: 'pointer',
    }

    const productCardPriceContentStyle: React.CSSProperties = {
        padding: '16px',
        display: 'flex',
        gap: 16
    }

    const productCardPriceDetailsStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
    }

    const addToCart = () => {
        setInCart(true);
        toast.success('Hozzáadva a kosárhoz!');
    }

    return (
        <Paper className="product-card" sx={productCardStyle}>
            <img
                src={product.featuredImage || "https://placehold.co/429"}
                alt={product.name}
                style={productImageStyle}
                onClick={openProductPage}
            />


            {product.bio && (
                <BioBadge style={{ position: 'absolute', top: 16, right: 16 }} />
            )}

            <div style={productCardDetailsUpperContainterStyle}>
                {inCart && (
                    <F2FIcons name='Check' width={40} height={40} style={
                        {
                            position: 'absolute', top: -20, right: 16, color: themeConfig.palette.primary.dark,
                            backgroundColor: themeConfig.palette.primary.light,
                            borderRadius: '50%',
                            padding: 4,
                            border: '3px solid #ffffff'
                        }
                    } />
                )}
                <div style={productCardDetailsUpperLabelContainerStyle}>
                    <h2 style={productCardNameStyle} onClick={openProductPage}>{product.name}</h2>
                    <ProducerAvatar
                        avatarUrl="https://placehold.co/48"
                        avatarAlt="Termelő"
                        style={{ position: 'absolute', top: -24, left: 16 }}
                    />
                </div>
            </div>
            <div style={productCardPriceContentStyle}>
                <div className='productCardPriceDetails' style={productCardPriceDetailsStyle}>
                    <ProductPriceDetails price={product.netPrice.toFixed(0).toString()} unit={product.unit} />
                    <ProductQuantitySelector onAddToCart={addToCart} unit={product.unit} min={product.mininumQuantity} max={product.maximumQuantity} step={product.stepQuantity} />
                </div>
            </div>

        </Paper>
    );
}

function ProducerAvatar({ avatarUrl, avatarAlt, style }: { avatarUrl: string, avatarAlt?: string, style?: React.CSSProperties }) {
    const avatarStyle: React.CSSProperties = {
        width: 48,
        height: 48,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid #ffffff',
        ...style,
    }
    return (
        <img
            src={avatarUrl}
            alt={avatarAlt || 'Termelő'}
            style={avatarStyle}
        />
    );
}

export function ProductPriceDetails({ price = "2 000", unit = "db" }: { price?: string, unit?: string }) {
    const priceDetailsStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
        justifyContent: 'space-between',
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
                {price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft <span style={unitStyle}>/ {unit}</span>
            </span>
            <F2FIcons name="Info" style={{ color: '#BDB5A2' }} />
        </div>
    );
}

export function ProductQuantitySelector({ onAddToCart, format = "column",  min = 1, max = 999, step = 0.2, unit = "csomag" }: { onAddToCart: () => void, format?: 'column' | 'row', min?: number, max?: number, step?: number, unit?: string }) {
    const inputTextStyle: React.CSSProperties = {
        textAlign: 'center',
        color: themeConfig.textColor.grey,
        fontFamily: themeConfig.fontFamily.primary,
        fontWeight: 500,
        fontSize: 16,
        lineHeight: '22px'
    }

    const [quantity, setQuantity] = useState<number>();
    const [inputValue, setInputValue] = useState<string>("");
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);

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
        }
    }

    const minusButtonStyle: SxProps<Theme> = {
        ...plusminusButtonBaseStyle,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    }

    const plusButtonStyle: SxProps<Theme> = {
        ...plusminusButtonBaseStyle,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
    }

    const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const decimals = 0;

        const value = parseFloat(event.target.value.replace(',', '.'));
        if (value === 0 || isNaN(value)) {
            setInputValue("");
            setQuantity(undefined);
            setButtonDisabled(true);
            return;
        }

        if (value < min) {
            setInputValue(printQtyWithUnit(min));
            setQuantity(min);
            setButtonDisabled(false);
            return;
        }

        if (value > max) {
            setInputValue(printQtyWithUnit(max));
            setQuantity(max);
            setButtonDisabled(false);
            return;
        }

        if (value % step !== 0) {
            const roundedValue = parseFloat((Math.round(value / step) * step).toFixed(1));
            setInputValue(printQtyWithUnit(roundedValue));
            setQuantity(roundedValue);
        } else {
            setInputValue(printQtyWithUnit(value));
            setQuantity(value);
        }

        setButtonDisabled(false);
    }

    const handlePlusClick = () => {
        if (quantity === undefined || isNaN(quantity)) {
            setQuantity(min);
            setInputValue(printQtyWithUnit(min));
            setButtonDisabled(false);
        } else {
            let newQty = quantity + step;
            if (newQty > max) {
                newQty = max;
            }
            setQuantity(newQty);
            setInputValue(printQtyWithUnit(newQty));
            setButtonDisabled(false);
        }
    }

    const handleMinusClick = () => {
        if (quantity === undefined || isNaN(quantity)) {
            setQuantity(min);
            setInputValue(printQtyWithUnit(min));
            setButtonDisabled(false);
        } else {
            let newQty = quantity - step;
            if (newQty < min) {
                newQty = min;
            }
            setQuantity(newQty);
            setInputValue(printQtyWithUnit(newQty));
            setButtonDisabled(false);
        }
    }

    const printQtyWithUnit = (qty: number) => {
        if (qty === undefined || isNaN(qty)) {
            return "";
        }
        const decimals = qty % 1 === 0 ? 0 : 1;
        return qty.toFixed(decimals) + " " + unit;
    }

    return (
        <Box sx={{display:'flex', flexDirection: format, gap: 2}}>
            <Paper sx={{ border: '1px solid #A4A3A1', borderRadius: '8px', p: '0px 0px', display: 'flex', alignItems: 'center', width: ((format == 'column')? '100%' : '50%') }}>
                <IconButton sx={minusButtonStyle} onClick={handleMinusClick} >
                    <F2FIcons name="Minus" width={24} height={24} style={{ color: '#bababa' }} />
                </IconButton>
                <InputBase
                    sx={{
                        ml: 1,
                        flex: 1,
                        textAlign: 'center',
                        input: {
                            '::placeholder': {
                                color: themeConfig.textColor.muted,
                                fontSize: 16,
                                fontWeight: 400,
                                fontFamily: themeConfig.fontFamily.primary,
                                letterSpacing: '0.02em',
                            }
                        }
                    }}
                    placeholder={"min. " + min + " " + unit}
                    inputProps={
                        {
                            'inputMode': 'text',
                            'style': inputTextStyle,

                        }
                    }
                    value={inputValue}
                    onFocus={e => {
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
                    onBlur={(e) => { inputChangeHandler(e) }}
                />
                <IconButton sx={plusButtonStyle} onClick={handlePlusClick}>
                    <F2FIcons name="Add" width={24} height={24} style={{ color: '#bababa' }} />
                </IconButton>
            </Paper>
            <ProductCardButton label="Kosár" onClick={onAddToCart} isDisabled={buttonDisabled} sx={{width: ((format == 'column')? '100%' : '50%')}}/>
            </Box>
    );

}

function ProductCardButton({ label, onClick, isDisabled = false, sx}: { label: string, onClick: () => void, isDisabled?: boolean, sx?:SxProps }) {

    const baseStyle: SxProps = {
        ...sx,
        padding: '10px 16px',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: 16,
        fontFamily: themeConfig.fontFamily.primary,
        height: 44
    }

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
    }


    return (
        <Button variant={isDisabled ? 'outlined' : 'contained'} disabled={isDisabled} color={isDisabled ? 'inherit' : 'primary'} onClick={onClick} sx={isDisabled ? disabledButtonStyle : buttonStyle}>
            {label}
        </Button>
    );
}