'use client';

import type { ICategoryItem } from 'src/types/category';
import type { SelectChangeEvent } from '@mui/material/Select';

import React, { useMemo, useState, useEffect } from 'react';

import {
    Box,
    Grid,
    Stack,
    Button,
    Select,
    MenuItem,
    Skeleton,
    Checkbox,
    TextField,
    IconButton,
    Typography,
    InputAdornment,
    CircularProgress,
} from '@mui/material';

import { useInfiniteScroll } from 'src/hooks/use-infinite-scroll';
import { useInfiniteProducts } from 'src/hooks/use-infinite-products';

import { themeConfig } from 'src/theme';
import { CONFIG } from 'src/global-config';
import { useCategories } from 'src/contexts/category-context';

import F2FIcons from '../f2ficons/f2ficons';
import ProductCard from '../product-card/product-card';

type SortingOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'default';

export default function ProductsPage({ urlSlug }: Readonly<{ urlSlug?: string }>) {
    const { categories, loading: categoryLoading } = useCategories();
    const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(42);
    const [subCategory, setSubCategory] = useState<number[]>([]);
    const [sorting, setSorting] = useState<SortingOption>('default');
    const [isBio, setIsBio] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Initialize category from URL slug
    useEffect(() => {
        if (urlSlug && categories.length > 0) {
            const category = categories.find((c) => c.slug === urlSlug);
            if (category) {
                setActiveCategoryId(category.id ?? 42);
            }
        } else {
            setActiveCategoryId(42);
        }
    }, [urlSlug, categories]);

    // Use infinite products hook
    const {
        products,
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore,
        totalCount,
    } = useInfiniteProducts({
        categoryId: activeCategoryId,
        subCategoryIds: subCategory,
        isBio,
        sorting,
        searchText,
    });

    // Set up infinite scroll
    useInfiniteScroll({
        hasMore,
        loading: loadingMore,
        onLoadMore: loadMore,
        threshold: CONFIG.pagination.infiniteScrollThreshold,
    });

    const handleCategoryChange = (newCategoryId: number | undefined) => {
        if (newCategoryId !== activeCategoryId) {
            setActiveCategoryId(newCategoryId);
            setSubCategory([]); // Reset subcategory when main category changes
            const category = categories.find((c) => c.id === newCategoryId);
            if (category) {
                window.history.replaceState(null, '', `/termekek/${category.slug}/`);
            }
        }
    };

    const handleSubCategoryChange = (newSubCategoryIds: number[]) => {
        setSubCategory(newSubCategoryIds);
    };

    const handleSearchChange = (text: string) => {
        setSearchText(text);
    };

    const handleSortingChange = (newSorting: SortingOption) => {
        setSorting(newSorting);
    };

    const handleBioChange = (newIsBio: boolean) => {
        setIsBio(newIsBio);
    };

    // Filter products by search text (client-side for better UX)
    const filteredProducts = useMemo(() => {
        if (!searchText.trim()) return products;
        return products.filter((p) =>
            p.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [products, searchText]);

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
                    fontSize: { xs: '32px', sm: '64px' },
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontFamily: themeConfig.fontFamily.bricolage,
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
                isLoading={loading}
                orderChangeAction={handleSortingChange}
                bioChangeAction={handleBioChange}
                onCategoryChangeAction={handleCategoryChange}
                filterChangeAction={handleSearchChange}
                onSubCategoryChangeAction={handleSubCategoryChange}
            />

            {/* Results summary */}
            {!loading && (
                <Typography variant="body2" color="text.secondary">
                    {filteredProducts.length} termék betöltve{totalCount > filteredProducts.length && ` (${totalCount} összesen)`}
                    {searchText && ` "${searchText}" keresésre`}
                </Typography>
            )}

            <Grid
                container
                spacing={2}
                justifyContent="start"
                style={{ marginTop: '20px', width: '100%' }}
            >
                {categoryLoading || loading ? (
                    Array.from({ length: CONFIG.pagination.productsPerPage }, (__, cellIndex) => (
                        <Grid size={{ xs: 12, sm: 4, md: 3, lg: 2.4 }} key={cellIndex}>
                            <Skeleton
                                variant="rectangular"
                                height={513}
                                width="100%"
                                sx={{ borderRadius: 1 }}
                            />
                        </Grid>
                    ))
                ) : (
                    <>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product, index) => (
                                <Grid
                                    size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}
                                    key={`product-${product.id}-${index}`}
                                    sx={{ transition: 'all 0.3s ease' }}
                                >
                                    <ProductCard product={product} />
                                </Grid>
                            ))
                        ) : (
                            <Grid size={12}>
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        {error ? 'Hiba történt a termékek betöltése során' : 'Nem találtunk terméket.'}
                                    </Typography>
                                    {searchText && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Próbáld meg módosítani a keresési feltételeket.
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        )}
                    </>
                )}
            </Grid>

            {/* Loading more indicator */}
            {loadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 3 }}>
                    <CircularProgress size={32} />
                </Box>
            )}

            {/* Load more button (fallback for users without scroll) */}
            {!loading && !loadingMore && hasMore && filteredProducts.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={loadMore}
                        disabled={loadingMore}
                        size="large"
                        sx={{ minWidth: 200 }}
                    >
                        Több termék betöltése
                    </Button>
                </Box>
            )}
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
    const orderByIds = [42, 52, 50, 61, 57, 62, 60, 58, 51, 54, 55, 59, 53];
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
                    .sort((a, b) => {
                        const indexA = orderByIds.indexOf(a.id ?? 0);
                        const indexB = orderByIds.indexOf(b.id ?? 0);
                        return (indexA === -1 ? Number.MAX_VALUE : indexA) - (indexB === -1 ? Number.MAX_VALUE : indexB);
                    })
                    .filter((c) => c.level < 2 && c.enabled && c.showProductPage)
                    .map((category) => (
                        <Button
                            key={category.id}
                            onClick={() => filterChangeAction(category.id ?? 42)}
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
    onSubCategoryChangeAction,
}: Readonly<{
    categories: ICategoryItem[];
    selectedCategory: number | undefined;
    isBio: boolean;
    isLoading: boolean;
    filterChangeAction: (text: string) => void;
    orderChangeAction: (order: SortingOption) => void;
    bioChangeAction: (isBio: boolean) => void;
    onCategoryChangeAction: (categoryId: number | undefined) => void;
    onSubCategoryChangeAction: (subCategoryIds: number[]) => void;
}>) {
    const searchIcon = <F2FIcons name="Search2" width={20} height={20} />;
    const loadingIcon = <F2FIcons name="Loading" width={20} height={20} />;

    const [searchText, setSearchText] = useState('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchText(value);

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Debounce search to avoid too many API calls
        const timeout = setTimeout(() => {
            if (value.replace(/\s/g, '').length >= 3 || value === '') {
                filterChangeAction(value);
            }
        }, 500);

        setSearchTimeout(timeout);
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

    const [newSelectedCategory, setNewSelectedCategory] = useState<number | undefined>(selectedCategory);
    const [subCategory, setSubCategory] = useState<number[]>([]);
    const handleCategoryChange = (event: SelectChangeEvent<number>) => {
        const value = event.target.value;
        const categoryId = value.toString() === 'default' ? undefined : Number(value);
        setNewSelectedCategory(categoryId);
        setSubCategory([]); // Reset to empty array
        onCategoryChangeAction(categoryId);
    };

    // Update bio state when prop changes
    useEffect(() => {
        setBioActive(isBio);
    }, [isBio]);

    // Update category when prop changes
    useEffect(() => {
        setNewSelectedCategory(selectedCategory);
    }, [selectedCategory]);

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
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row', md: 'row', lg: 'row', xl: 'row' },
            }}
        >
            <Stack spacing={2} sx={
                {
                    flexDirection: { xs: 'column', sm: 'row' },
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
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
                    {categories.filter(c => c.enabled && c.showProductPage).map((category) => (
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
                        maxWidth: { xs: '100%', sm: '100%'}
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
                        fullWidth
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

                <Stack direction="row" alignItems="center" sx={
                    {
                        width: { xs: '100%', sm: (categories && selectedCategory != 42 && categories.filter(c => c.enabled && c.parentId == selectedCategory).length > 0 ?  '30%' : 'auto') },
                        gap: { xs: 1, sm: 2 },
                        
                        justifyContent: { xs: 'flex-end', sm: 'space-between' }
                    }}>
                    {/* SubCategories multi-select dropdown */}
                    {categories && selectedCategory != 42 && categories.filter(c => c.enabled && c.parentId == selectedCategory).length > 0 &&
                        <Select
                            multiple
                            value={subCategory}
                            onChange={(event) => {
                                const value = event.target.value as number[];
                                setSubCategory(value);
                                onSubCategoryChangeAction(value);
                            }}
                            size="small"
                            displayEmpty
                            fullWidth
                            sx={{
                                display: (selectedCategory == 42 ? 'none' : 'block'),
                                width: { xs: '85%', sm: '50%', md: '50%', lg: '50%' },
                                minWidth: { xs: '85%', sm: 'auto' },
                                backgroundColor: '#fff',
                                borderRadius: '4px',
                                height: '38px',
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    outline: 'none',
                                    boxShadow: 'none',
                                    border: '1px solid #bababa',
                                },
                            }}
                            renderValue={(selected) => {
                                if (selected.length === 0) {
                                    return 'Alkategória';
                                }
                                if (selected.length === 1) {
                                    const selectedCategoryLabel = categories.find(c => c.id === selected[0]);
                                    return selectedCategoryLabel?.name || 'Alkategória';
                                }
                                return `${selected.length} alkategória`;
                            }}
                        >
                            {categories.filter(c => c.enabled && c.parentId == selectedCategory).map((category) => (
                                <MenuItem key={category.id ?? '-1'} value={category.id ?? 0}>
                                    <Checkbox checked={subCategory.includes(category.id ?? 0)} />
                                    <Typography variant="body2">{category.name}</Typography>
                                </MenuItem>
                            ))}
                        </Select>
                    }


                    <Select
                        onChange={handleOrderChange}
                        value={order}
                        size="small"
                        displayEmpty
                        sx={{
                            width: {
                                xs: '48px', // Full width on mobile
                                sm: 'initial',
                                md: 'initial',
                                lg: 'initial',
                                xl: 'initial',
                            },
                            minWidth: {
                                xs: '48px', // Full min-width on mobile
                                sm: '50%',
                            },
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            height: '38px',

                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                outline: 'none',
                                boxShadow: 'none',
                                border: '1px solid #bababa',
                            },
                            pl: { xs: 0, sm: 4 }, // No padding on mobile, padding on larger screens
                            position: 'relative',
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                left: { xs: '50%', sm: 12 }, // Centered on mobile, left-aligned on larger screens
                                top: '50%',
                                transform: { xs: 'translate(-50%, -50%)', sm: 'translateY(-50%)' }, // Centered on mobile
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
                        renderValue={(value) =>
                        // On mobile, show empty string (icon only), on desktop show the text
                        (
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                {value === 'default' && 'Rendezés'}
                                {value === 'name-asc' && 'Név szerint növekvő'}
                                {value === 'name-desc' && 'Név szerint csökkenő'}
                                {value === 'price-asc' && 'Ár szerint növekvő'}
                                {value === 'price-desc' && 'Ár szerint csökkenő'}
                            </Box>
                        )
                        }
                    >
                        <MenuItem value="default">Rendezés</MenuItem>
                        <MenuItem value="name-asc">Név szerint növekvő</MenuItem>
                        <MenuItem value="name-desc">Név szerint csökkenő</MenuItem>
                        <MenuItem value="price-asc">Ár szerint növekvő</MenuItem>
                        <MenuItem value="price-desc">Ár szerint csökkenő</MenuItem>
                    </Select>
                </Stack>
            </Stack>
        </Box>
    );
}
