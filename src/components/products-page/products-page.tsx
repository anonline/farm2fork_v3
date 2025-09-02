'use client';

import type { IProductItem } from 'src/types/product';
import type { ICategoryItem } from 'src/types/category';
import type { SelectChangeEvent } from '@mui/material/Select';

import { useState, useEffect } from 'react';

import {
    Box,
    Grid,
    Stack,
    Button,
    Select,
    MenuItem,
    Skeleton,
    TextField,
    IconButton,
    Typography,
    InputAdornment,
} from '@mui/material';

import { useCategories } from 'src/contexts/category-context';
import { useProductFilterCategory } from 'src/contexts/products-context';

import F2FIcons from '../f2ficons/f2ficons';
import ProductCard from '../product-card/product-card';

type SortingOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'default';

export default function ProductsPage({ urlSlug }: Readonly<{ urlSlug?: string }>) {
    const { categories } = useCategories();
    const [spinLoading, setSpinLoading] = useState(false);
    const [productList, setProductList] = useState<IProductItem[]>([]);
    const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(8);
    const [sorting, setSorting] = useState<SortingOption>('default');
    const [isBio, setIsBio] = useState(false);

    useEffect(() => {
        if (urlSlug && categories.length > 0) {
            const category = categories.find((c) => c.slug === urlSlug);

            if (category) {
                setActiveCategoryId(category.id ?? 8);
            }
        }
    }, [urlSlug, categories]);

    const handleCategoryChange = (newCategoryId: number | undefined) => {
        setSpinLoading(true);
        if (newCategoryId !== activeCategoryId) {
            setActiveCategoryId(newCategoryId);
            const category = categories.find((c) => c.id === newCategoryId);
            if (category) {
                window.history.replaceState(null, '', `/termekek/${category.slug}/`);
            }
        }
    };

    const { products, loading } = useProductFilterCategory(activeCategoryId, isBio, sorting);

    useEffect(() => {
        setProductList(products);
        setSpinLoading(false);
    }, [activeCategoryId, loading, sorting, isBio]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                padding: '0px',
                gap: '20px',
                width: '100%',
            }}
        >
            <Typography
                sx={{
                    fontSize: '64px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    lineHeight: '70px',
                    letterSpacing: '-1px',
                }}
            >
                Termékek
            </Typography>

            <ProductPageFilter
                categories={categories}
                activeCategoryId={activeCategoryId}
                filterChangeAction={handleCategoryChange}
            />

            <ProductPageTextFilter
                categories={categories}
                selectedCategory={activeCategoryId}
                isBio={isBio}
                isLoading={spinLoading}
                orderChangeAction={(order) => {
                    setSorting(order);
                }}
                bioChangeAction={(bio) => {
                    setIsBio(bio);
                }}
                onCategoryChangeAction={handleCategoryChange}
                filterChangeAction={(text) => {
                    if (text.length > 0) {
                        const filteredProducts = products.filter((p) =>
                            p.name.toLowerCase().includes(text.toLowerCase())
                        );
                        setProductList(filteredProducts);
                    } else {
                        setProductList(products);
                    }
                }}
            />
            <Grid
                container
                spacing={2}
                justifyContent="start"
                style={{ marginTop: '20px', width: '100%' }}
            >
                {loading !== false ? (
                    Array.from({ length: 5 }, (__, cellIndex) => (
                        <Skeleton key={cellIndex} height={513} width={235} />
                    ))
                ) : (
                    <>
                        {productList.length > 0 ? (
                            productList.map((product) => (
                                <Grid
                                    size={{ xs: 12, sm: 4, md: 3, lg: 2.4 }}
                                    key={product.id}
                                    sx={{ transition: 'all 0.3s ease' }}
                                >
                                    <ProductCard product={product} />
                                </Grid>
                            ))
                        ) : (
                            <Typography>Nem találtunk terméket.</Typography>
                        )}
                    </>
                )}
            </Grid>
        </Box>
    );
}

type ProductPageFilterProps = {
    categories: ICategoryItem[];
    activeCategoryId?: number;
    filterChangeAction: (id: number | undefined) => void;
};

export function ProductPageFilter({
    categories,
    activeCategoryId,
    filterChangeAction,
}: Readonly<ProductPageFilterProps>) {
    return (
        <Box
            sx={{
                paddingBottom: '6px',
                borderBottom: '1px solid #bababa',
                width: '100%',
                display: { xs: 'none', sm: 'block' },
            }}
        >
            <Stack direction="row" spacing="16px" flexWrap="wrap" sx={{ width: '100%' }}>
                {categories
                    .filter((c) => c.level < 2)
                    .map((category) => (
                        <Button
                            key={category.id}
                            onClick={() => filterChangeAction(category.id ?? 8)}
                            sx={{
                                fontSize: '16px',
                                fontWeight: activeCategoryId == category.id ? '600' : '500',
                                lineHeight: '24px',
                                color: activeCategoryId == category.id ? '#262626' : '#4B4B4ACC',
                            }}
                        >
                            {category.name}
                        </Button>
                    ))}
            </Stack>
        </Box>
    );
}

export function ProductPageTextFilter({
    categories,
    selectedCategory,
    isBio,
    isLoading,
    filterChangeAction,
    orderChangeAction,
    bioChangeAction,
    onCategoryChangeAction,
}: Readonly<{
    categories: ICategoryItem[];
    selectedCategory: number | undefined;
    isBio: boolean;
    isLoading: boolean;
    filterChangeAction: (text: string) => void;
    orderChangeAction: (order: SortingOption) => void;
    bioChangeAction: (isBio: boolean) => void;
    onCategoryChangeAction: (categoryId: number | undefined) => void;
}>) {
    const searchIcon = <F2FIcons name="Search2" width={20} height={20} />;
    const loadingIcon = <F2FIcons name="Loading" width={20} height={20} />;

    const [searchText, setSearchText] = useState('');

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchText(value);

        if (value.replace(/\s/g, '').length < 3 && value !== '') return;
        filterChangeAction(value);
    };

    const [order, setOrder] = useState<SortingOption>('default');
    const handleOrderChange = (event: SelectChangeEvent<SortingOption>) => {
        const value = event.target.value as SortingOption;
        setOrder(value);
        orderChangeAction(value);
    };

    const [bioActive, setBioActive] = useState(isBio);
    const handleBioBtnClick = () => {
        setBioActive(!bioActive);
        bioChangeAction(!bioActive);
    };

    const [newSelectedCategory, setNewSelectedCategory] = useState<number | undefined>(undefined);
    const handleCategoryChange = (event: SelectChangeEvent<number>) => {
        const value = event.target.value;
        const categoryId = value === 'default' ? undefined : Number(value);
        setNewSelectedCategory(categoryId);
        onCategoryChangeAction(categoryId);
    };

    return (
        <Box
            sx={{
                width: '100%',
                padding: '16px',
                gap: '16px',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                border: '1px solid #bababa',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row', md: 'row', lg: 'row', xl: 'row' },
            }}
        >
            <Select
                onChange={handleCategoryChange}
                value={newSelectedCategory}
                size="small"
                displayEmpty
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    width: {
                        xs: '100%',
                        sm: 'initial',
                        md: 'initial',
                        lg: 'initial',
                        xl: 'initial',
                    },
                    minWidth: '200px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    height: '38px',

                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        outline: 'none',
                        boxShadow: 'none',
                        border: '1px solid #bababa',
                    },
                    position: 'relative',
                }}
            >
                {categories.map((category) => (
                    <MenuItem key={category.id ?? '-1'} value={category.id ?? '-1'}>
                        {category.name}
                    </MenuItem>
                ))}
            </Select>

            <Box
                sx={{
                    display: 'flex',
                    gap: '16px',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <IconButton
                    sx={{
                        filter: !bioActive ? 'grayscale(100%)' : 'none',
                        '&:hover': { filter: 'grayscale(0%)' },
                    }}
                    onClick={handleBioBtnClick}
                >
                    <F2FIcons
                        name="BioBadge"
                        width={32}
                        height={32}
                        style={{ alignContent: 'center' }}
                    />
                </IconButton>

                <TextField
                    size="small"
                    value={searchText}
                    placeholder="Keress rá a termék nevére"
                    onChange={handleSearchChange}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment
                                    position="start"
                                    sx={
                                        isLoading
                                            ? {
                                                  animation: 'rotation 2s infinite linear',
                                                  animationDirection: 'reverse',
                                              }
                                            : {}
                                    }
                                >
                                    {isLoading ? loadingIcon : searchIcon}
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{
                        width: '100%',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            outline: 'none',
                            boxShadow: 'none',
                            border: '1px solid #bababa',
                        },
                        '& .MuiInputBase-root': {
                            backgroundColor: '#fff',
                        },
                    }}
                />
            </Box>
            <Select
                onChange={handleOrderChange}
                value={order}
                size="small"
                displayEmpty
                sx={{
                    width: {
                        xs: '100%',
                        sm: 'initial',
                        md: 'initial',
                        lg: 'initial',
                        xl: 'initial',
                    },
                    minWidth: '200px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    height: '38px',

                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        outline: 'none',
                        boxShadow: 'none',
                        border: '1px solid #bababa',
                    },
                    pl: 4, // add left padding for the icon
                    position: 'relative',
                    '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 20,
                        height: 20,
                        backgroundImage:
                            'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC4wMDAyIDEzLjY2NjNDMTEuMTk3NiAxMy42NjYzIDEyLjIxNjIgMTQuNDMxNiAxMi41OTM3IDE1LjQ5OThMMTguMjUwMiAxNS40OTk3QzE4Ljc1NjQgMTUuNDk5NyAxOS4xNjY4IDE1LjkxMDEgMTkuMTY2OCAxNi40MTYzQzE5LjE2NjggMTYuOTIyNiAxOC43NTY0IDE3LjMzMyAxOC4yNTAyIDE3LjMzM0wxMi41OTM0IDE3LjMzMzhDMTIuMjE1NiAxOC40MDE1IDExLjE5NzIgMTkuMTY2MyAxMC4wMDAyIDE5LjE2NjNDOC44MDMxIDE5LjE2NjMgNy43ODQ2OCAxOC40MDE1IDcuNDA2OTMgMTcuMzMzOEwxLjc1MDE2IDE3LjMzM0MxLjI0MzkgMTcuMzMzIDAuODMzNDk2IDE2LjkyMjYgMC44MzM0OTYgMTYuNDE2M0MwLjgzMzQ5NiAxNS45MTAxIDEuMjQzOSAxNS40OTk3IDEuNzUwMTYgMTUuNDk5N0w3LjQwNjYxIDE1LjQ5OThDNy43ODQxMSAxNC40MzE2IDguODAyNzYgMTMuNjY2MyAxMC4wMDAyIDEzLjY2NjNaTTEwLjAwMDIgMTUuNDk5N0M5LjQ5MzkgMTUuNDk5NyA5LjA4MzUgMTUuOTEwMSA5LjA4MzUgMTYuNDE2M0M5LjA4MzUgMTYuOTIyNiA5LjQ5MzkgMTcuMzMzIDEwLjAwMDIgMTcuMzMzQzEwLjUwNjQgMTcuMzMzIDEwLjkxNjggMTYuOTIyNiAxMC45MTY4IDE2LjQxNjNDMTAuOTE2OCAxNS45MTAxIDEwLjUwNjQgMTUuNDk5NyAxMC4wMDAyIDE1LjQ5OTdaTTE2LjQxNjggNy4yNDk2N0MxNy45MzU2IDcuMjQ5NjcgMTkuMTY2OCA4LjQ4MDg5IDE5LjE2NjggOS45OTk2N0MxOS4xNjY4IDExLjUxODUgMTcuOTM1NiAxMi43NDk3IDE2LjQxNjggMTIuNzQ5N0MxNS4yMTk4IDEyLjc0OTcgMTQuMjAxNCAxMS45ODQ4IDEzLjgyMzYgMTAuOTE3MkwxLjc1MDE2IDEwLjkxNjNDMS4yNDM5IDEwLjkxNjMgMC44MzM0OTYgMTAuNTA1OSAwLjgzMzQ5NiA5Ljk5OTY3QzAuODMzNDk2IDkuNDkzNDEgMS4yNDM5IDkuMDgzMDEgMS43NTAxNiA5LjA4MzAxTDEzLjgyMzMgOS4wODMwOUMxNC4yMDA4IDguMDE0OTUgMTUuMjE5NCA3LjI0OTY3IDE2LjQxNjggNy4yNDk2N1pNMTYuNDE2OCA5LjA4MzAxQzE1LjkxMDYgOS4wODMwMSAxNS41MDAyIDkuNDkzNDEgMTUuNTAwMiA5Ljk5OTY3QzE1LjUwMDIgMTAuNTA1OSAxNS45MTA2IDEwLjkxNjMgMTYuNDE2OCAxMC45MTYzQzE2LjkyMzEgMTAuOTE2MyAxNy4zMzM1IDEwLjUwNTkgMTcuMzMzNSA5Ljk5OTY3QzE3LjMzMzUgOS40OTM0MSAxNi45MjMxIDkuMDgzMDEgMTYuNDE2OCA5LjA4MzAxWk0zLjU4MzUgMC44MzMwMDhDNC43ODU5OCAwLjgzMzAwOCA1LjgwODIgMS42MDQ4IDYuMTgxODIgMi42ODAwNUM2LjIzMDgyIDIuNjcwNjQgNi4yODE2NSAyLjY2NjM0IDYuMzMzNSAyLjY2NjM0SDE4LjI1MDJDMTguNzU2NCAyLjY2NjM0IDE5LjE2NjggMy4wNzY3NSAxOS4xNjY4IDMuNTgzMDFDMTkuMTY2OCA0LjA4OTI3IDE4Ljc1NjQgNC40OTk2NyAxOC4yNTAyIDQuNDk5NjdINi4zMzM1QzYuMjgxNjUgNC40OTk2NyA2LjIzMDgyIDQuNDk1MzcgNi4xODEzMiA0LjQ4NzFDNS44MDgyIDUuNTYxMjEgNC43ODU5OCA2LjMzMzAxIDMuNTgzNSA2LjMzMzAxQzIuMDY0NzEgNi4zMzMwMSAwLjgzMzQ5NiA1LjEwMTc5IDAuODMzNDk2IDMuNTgzMDFDMC44MzM0OTYgMi4wNjQyMiAyLjA2NDcxIDAuODMzMDA4IDMuNTgzNSAwLjgzMzAwOFpNMy41ODM1IDIuNjY2MzRDMy4wNzcyMyAyLjY2NjM0IDIuNjY2ODMgMy4wNzY3NSAyLjY2NjgzIDMuNTgzMDFDMi42NjY4MyA0LjA4OTI3IDMuMDc3MjMgNC40OTk2NyAzLjU4MzUgNC40OTk2N0M0LjA4OTc2IDQuNDk5NjcgNC41MDAxNiA0LjA4OTI3IDQuNTAwMTYgMy41ODMwMUM0LjUwMDE2IDMuMDc2NzUgNC4wODk3NiAyLjY2NjM0IDMuNTgzNSAyLjY2NjM0WiIgZmlsbD0iIzI2MjYyNiIvPgo8L3N2Zz4K")',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'contain',
                        pointerEvents: 'none',
                    },
                }}
                // Remove IconComponent to avoid default dropdown icon
                IconComponent={() => null}
            >
                <MenuItem value="default">Rendezés</MenuItem>
                <MenuItem value="name-asc">Név szerint növekvő</MenuItem>
                <MenuItem value="name-desc">Név szerint csökkenő</MenuItem>
                <MenuItem value="price-asc">Ár szerint növekvő</MenuItem>
                <MenuItem value="price-desc">Ár szerint csökkenő</MenuItem>
            </Select>
        </Box>
    );
}
