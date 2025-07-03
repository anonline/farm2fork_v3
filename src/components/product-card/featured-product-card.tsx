'use client';

import type { IProductItem } from 'src/types/product';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Box, Chip, Paper, Stack, Button, InputBase, Typography, IconButton } from '@mui/material';

import { toast } from 'src/components/snackbar'; 

import F2FIcons from '../f2ficons/f2ficons'; 


function ProductPriceDetails({ price = "2000", unit = "db" }: Readonly<{ price?: string, unit?: string }>) {
    return (
        <Box>
            <Typography component="span" sx={{ fontSize: '18px', fontWeight: 700 }}>
                {price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft
            </Typography>
            <Typography component="span" sx={{ fontSize: '16px', color: 'text.secondary' }}>
                &nbsp;/ {unit}
            </Typography>
        </Box>
    );
}

function ProductQuantitySelector({ onAddToCart, min = 1, max = 999, step = 0.2, unit = "csomag" }: { onAddToCart: () => void, min?: number, max?: number, step?: number, unit?: string }) {
    const [quantity, setQuantity] = useState<number>(min);
    const [inputValue, setInputValue] = useState<string>("");

    const handleSetQuantity = (newQty: number) => {
        const clampedQty = Math.max(min, Math.min(max, newQty));
        const finalQty = parseFloat((Math.round(clampedQty / step) * step).toFixed(2));
        setQuantity(finalQty);
        setInputValue(finalQty.toFixed(finalQty % 1 === 0 ? 0 : 1));
    };

    const handleButtonClick = (amount: number) => {
        handleSetQuantity(quantity + amount);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleInputBlur = () => {
        const parsedValue = parseFloat(inputValue.replace(',', '.'));
        if (isNaN(parsedValue) || parsedValue < min) {
            setQuantity(min);
            setInputValue("");
        } else {
            handleSetQuantity(parsedValue);
        }
    };

    return (
        <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 1.5, sm: 1 }} 
            alignItems="stretch" 
            sx={{ width: '100%', maxWidth: {sm: '350px'} }}
        >
            <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', borderRadius: '8px', flex: { sm: 1 } }}>
                <IconButton onClick={() => handleButtonClick(-step)} size="small" aria-label="mennyiség csökkentése">
                    <F2FIcons name="Minus" width={20} height={20} />
                </IconButton>
                <InputBase
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder={`min. ${min} ${unit}`}
                    sx={{
                        flexGrow: 1,
                        fontSize: '14px',
                        '& input': { textAlign: 'center', color: 'text.primary' },
                        '& .MuiInputBase-input::placeholder': { color: 'text.secondary', opacity: 1 },
                    }}
                    inputProps={{ 'aria-label': 'mennyiség' }}
                />
                <IconButton onClick={() => handleButtonClick(step)} size="small" aria-label="mennyiség növelése">
                    <F2FIcons name="Add" width={20} height={20} />
                </IconButton>
            </Paper>
            <Button 
                variant="outlined" 
                onClick={onAddToCart} 
                sx={{ 
                    height: '40px',
                    borderColor: '#E0E0E0',
                    color: 'text.secondary',
                    flex: { sm: 1 },
                    '&:hover': {
                        borderColor: 'text.primary',
                        backgroundColor: 'action.hover'
                    }
                }}
            >
                Kosár
            </Button>
        </Stack>
    );
}

function ProducerInfo({ name, location }: Readonly<{ name: string, location: string }>) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <img 
                src="https://placehold.co/48" 
                alt={name} 
                style={{ width: 40, height: 40, borderRadius: '50%' }} 
            />
            <Box>
                <Typography variant="subtitle2" fontWeight={600}>{name}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <F2FIcons name="Map" width={14} height={14} />
                    <Typography variant="body2" color="text.secondary">{location}</Typography>
                </Stack>
            </Box>
        </Stack>
    )
}

interface FeaturedProductCardProps {
    product: IProductItem;
}

export default function FeaturedProductCard(props: Readonly<FeaturedProductCardProps>) {
    const { product } = props;
    const router = useRouter();

    const openProductPage = () => {
        router.push(`/termekek/${product.url}`);
    };

    const addToCart = () => {
        toast.success(`${product.name} hozzáadva a kosárhoz!`);
    };
    
    return (
        <Paper 
            elevation={2}
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
            }}
        >
            <Box 
                onClick={openProductPage}
                sx={{ 
                    width: { xs: '100%', md: '45%' },
                    aspectRatio: '1/1',
                    cursor: 'pointer',
                    flexShrink: 0,
                }}
            >
                <img
                    src={product.featuredImage ?? "https://placehold.co/640x472"}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </Box>

            <Box 
                sx={{ 
                    p: { xs: 2, md: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                }}
            >
                <Stack spacing={3}>
                    <Chip 
                        label="Szezonális sztár" 
                        size="small" 
                        sx={{ 
                            width: 'fit-content',
                            color: 'rgb(13, 52, 95)',
                            backgroundColor: '#E3F2FD',
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: '#E3F2FD',
                            }
                        }} 
                    />

                    <Typography 
                        variant="h4" 
                        onClick={openProductPage}
                        sx={{ 
                            cursor: 'pointer',
                            fontSize: '32px',
                            lineHeight: '40px',
                            fontWeight: 600,
                        }}
                    >
                        {product.name}
                    </Typography>

                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{
                            fontWeight: 400,
                            fontSize: '16px',
                            lineHeight: '24px',
                            marginBlockEnd: '14.4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {product.shortDescription}
                    </Typography>

                    <ProducerInfo name="Via Bona" location="Esztergom" />
                </Stack>
                
                <Box sx={{ flexGrow: 1 }} />

                <Stack 
                    direction="column"
                    spacing={1.5} 
                    alignItems="flex-start"
                    sx={{ mt: 3 }}
                >
                    <ProductPriceDetails price={product.netPrice?.toFixed(0).toString()} unit={product.unit} />
                    <ProductQuantitySelector 
                        onAddToCart={addToCart} 
                        unit={product.unit} 
                        min={product.mininumQuantity} 
                        max={product.maximumQuantity} 
                        step={product.stepQuantity}
                    />
                </Stack>
            </Box>
        </Paper>
    );
}
