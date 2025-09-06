import type { IProductItem } from 'src/types/product';
import type { IProducerItem } from 'src/types/producer';

import { useRef, useState, useEffect, forwardRef, useCallback } from 'react'; // useCallback importálása

import { Box, Link, Button, TextField, Typography, InputAdornment } from '@mui/material';

import { paths } from 'src/routes/paths';

import { fCurrency } from 'src/utils/format-number';

import F2FIcons from 'src/components/f2ficons/f2ficons';

type HeaderSearchBaseResultItem = {
    id: number;
    name: string;
    image?: string;
    bio: boolean;
    slug: string;
};
interface HeaderSearchProductResultItem extends HeaderSearchBaseResultItem {
    price: number;
    unit?: string;
}

interface HeaderSearchProducerResultItem extends HeaderSearchBaseResultItem {
    description: string;
}

export default function HeaderSearch() {
    const searchTextLimit = 3;

    const searchIcon = <F2FIcons name="Search2" width={20} height={20} />;
    const loadingIcon = <F2FIcons name="Loading" width={20} height={20} />;

    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [products, setProducts] = useState<HeaderSearchProductResultItem[]>([]);
    const [producers, setProducers] = useState<HeaderSearchProducerResultItem[]>([]);

    const dbProductToSearchResult = (product: IProductItem): HeaderSearchProductResultItem => ({
        id: product.id,
        name: product.name ?? 'Termék',
        image: product.featuredImage ?? 'https://placehold.co/64x64',
        price: product.netPrice ?? 99999,
        bio: product.bio ?? false,
        slug: product.url,
        unit: product.unit ?? 'db',
    });

    const dbProducerToSearchResult = (producer: IProducerItem): HeaderSearchProducerResultItem => ({
        id: producer.id,
        name:
            producer.name +
            (producer.companyName.length > 0 ? ' (' + producer.companyName + ')' : ''),
        image: producer.featuredImage ?? 'https://placehold.co/64x64',
        description:
            producer.shortDescription == null || producer.shortDescription.length == 0
                ? producer.producingTags
                : producer.shortDescription,
        bio: producer.bio ?? false,
        slug: producer.slug,
    });

    // Debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(timeout);
    }, [query]);

    // Fetch keresés
    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setProducts([]);
            setProducers([]);
            return;
        }

        setIsLoading(true);
        Promise.all([
            fetch(`/api/search/products?q=${debouncedQuery}`).then((res) => res.json()),
            fetch(`/api/search/producers?q=${debouncedQuery}`).then((res) => res.json()),
        ])
            .then(([productData, producerData]) => {
                setProducts(productData.map(dbProductToSearchResult));
                setProducers(producerData.map(dbProducerToSearchResult));
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, [debouncedQuery]);

    useEffect(() => {
        setShowResults(debouncedQuery.length >= searchTextLimit && !isLoading);
    }, [debouncedQuery, products, producers, isLoading]);

    // Kattintásfigyelés a dokumentumon
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                resultsRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                !resultsRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const queryString = event.target.value;
        setQuery(queryString);
    };

    // Enter billentyű kezelése
    const handleEnterPress = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
                if (debouncedQuery.trim().length >= searchTextLimit) {
                    event.preventDefault();
                    window.location.href = `/search?s=${debouncedQuery}`;
                }
            }
        },
        [debouncedQuery, searchTextLimit]
    );

    return (
        <Box sx={{ width: 200, position: 'relative' }}>
            <TextField
                ref={inputRef}
                size="small"
                placeholder="Keresés"
                onChange={handleSearch}
                onKeyDown={handleEnterPress}
                onFocus={() => {
                    if (
                        debouncedQuery.length >= searchTextLimit &&
                        (products.length > 0 || producers.length > 0)
                    ) {
                        setShowResults(true);
                    }
                }}
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
            />

            {!isLoading && showResults && (
                <HeaderSearchResultArea
                    ref={resultsRef}
                    products={products}
                    producers={producers}
                    link={debouncedQuery}
                />
            )}
        </Box>
    );
}

type HeaderSearchResultAreaProps = {
    products?: HeaderSearchProductResultItem[];
    producers?: HeaderSearchProducerResultItem[];
    link?: any;
};

const HeaderSearchResultArea = forwardRef<HTMLDivElement, HeaderSearchResultAreaProps>(
    ({ products, producers, link }, ref) => (
        <Box
            ref={ref}
            sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 1,
                border: '1px solid #dcdcd1',
                backgroundColor: '#f5f5f5',
                boxShadow: 1,
                zIndex: 1000,
                borderRadius: '4px',
                minWidth: { xs: '100vw', sm: '400px' },
                padding: '8px',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: '600',
                            fontSize: '14px',
                            lineHeight: '22px',
                            color: '#262626',
                        }}
                    >
                        Termékek
                    </Typography>
                    <Button
                        href={`/search/?s=${link}`}
                        sx={{
                            fontWeight: '600',
                            fontSize: '12px',
                            lineHeight: '22px',
                            color: '#262626',
                            textDecoration: 'underline',
                        }}
                    >
                        Összes találat ({products?.length || 0})
                    </Button>
                </Box>
                {products !== undefined
                    ? products.map((result) => (
                          <Link
                              href={`${paths.product.details(result.slug)}`}
                              key={result.id}
                              style={{ textDecoration: 'none', width: '100%' }}
                          >
                              <HeaderSearchProductResultItem {...result} />
                          </Link>
                      ))
                    : null}

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: '600',
                            fontSize: '14px',
                            lineHeight: '22px',
                            color: '#262626',
                        }}
                    >
                        Termelők
                    </Typography>
                    <Button
                        href={`/search/?s=${link}`}
                        sx={{
                            fontWeight: '600',
                            fontSize: '12px',
                            lineHeight: '22px',
                            color: '#262626',
                            textDecoration: 'underline',
                        }}
                    >
                        Összes találat ({producers?.length || 0})
                    </Button>
                </Box>
                {producers !== undefined
                    ? producers.map((result) => (
                          <Link
                              href={`${paths.producers.details(result.slug)}`}
                              key={result.id}
                              style={{ textDecoration: 'none', width: '100%' }}
                          >
                              <HeaderSearchProducerResultItem {...result} />
                          </Link>
                      ))
                    : null}
            </Box>
        </Box>
    )
);

function HeaderSearchProductResultItem({
    name,
    image,
    price,
    bio,
    unit,
}: Readonly<HeaderSearchProductResultItem>) {
    return (
        <Box
            sx={{
                display: 'flex',
                border: '1px solid #dfdcd1',
                borderRadius: '8px',
                gap: '8px',
                alignItems: 'center',
                padding: '8px',
                width: '100%',
                cursor: 'pointer',
                backgroundColor: '#fff',
                '&:hover': { transform: 'scale(1.01)' },
            }}
        >
            <img
                src={image ?? 'https://placehold.co/64x64'}
                alt={name}
                style={{ width: '64px', height: '64px', borderRadius: '4px' }}
            />
            <Box
                sx={{
                    width: '100%',
                    alignItems: 'top',
                    display: 'flex',
                    height: '64px',
                    flexDirection: 'column',
                    gap: '4px',
                }}
            >
                <Typography
                    sx={{
                        fontSize: '15px',
                        fontWeight: '600',
                        lineHeight: '24px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '70%',
                        display: 'block',
                        color: '#262626',
                    }}
                >
                    {name}{' '}
                    {bio && <F2FIcons name="BioBadge" width={28} style={{ marginLeft: '4px' }} />}
                </Typography>
                <Typography
                    sx={{
                        fontSize: '14px',
                        fontWeight: '500',
                        lineHeight: '20px',
                        color: '#7e7e7e',
                    }}
                >
                    {fCurrency(price)}/{unit ?? 'db'}
                </Typography>
            </Box>
        </Box>
    );
}

function HeaderSearchProducerResultItem({
    name,
    image,
    description,
    bio,
}: Readonly<HeaderSearchProducerResultItem>) {
    return (
        <Box
            sx={{
                display: 'flex',
                border: '1px solid #dfdcd1',
                borderRadius: '8px',
                gap: '8px',
                alignItems: 'center',
                padding: '8px',
                width: '100%',
                cursor: 'pointer',
                backgroundColor: '#fff',
                '&:hover': { transform: 'scale(1.01)' },
            }}
        >
            <img
                src={image ?? 'https://placehold.co/64x64'}
                alt={name}
                style={{ width: '64px', height: '64px', borderRadius: '4px', objectFit: 'cover' }}
            />
            <Box
                sx={{
                    width: '80%',
                    alignItems: 'top',
                    display: 'flex',
                    height: '64px',
                    flexDirection: 'column',
                    gap: '4px',
                }}
            >
                <Typography
                    sx={{
                        fontSize: '15px',
                        fontWeight: '600',
                        lineHeight: '24px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '80%',
                        display: 'block',
                        color: '#262626',
                    }}
                >
                    {name}
                </Typography>
                <Typography
                    sx={{
                        fontSize: '14px',
                        fontWeight: '500',
                        lineHeight: '20px',
                        color: '#7e7e7e',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal',
                        width: '95%',
                    }}
                >
                    {description}
                </Typography>
            </Box>
        </Box>
    );
}
