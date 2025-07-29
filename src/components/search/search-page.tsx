'use client';

import type { IProductItem } from 'src/types/product';
import type { IProducerItem } from 'src/types/producer';

import { useState, useEffect } from 'react';

import { Grid, Skeleton } from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import ProductCard from '../product-card/product-card';
import ProducerCard from '../producer-card/producer-card';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('s') ?? 'No search parameter provided.';

    const [products, setProducts] = useState<IProductItem[]>([]);
    const [producers, setProducers] = useState<IProducerItem[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await fetch(`/api/search/products?q=${searchTerm}`);
            const data = await res.json();
            setProducts(data);
        };

        const fetchProducers = async () => {
            const res = await fetch(`/api/search/producers?q=${searchTerm}`);
            const data = await res.json();
            setProducers(data);
        };

        fetchProducts();
        fetchProducers();
    }, [searchTerm]);

    return (
        <main>
            <h1
                style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    lineHeight: "44px",
                }}>
                Keresési eredmények
            </h1>
            <SearchPageProductGrid products={products} />
            <SearchPageProducerGrid producers={producers} />
        </main>
    );
}

function SearchPageProductGrid({ products }: Readonly<{ products: IProductItem[] }>) {
    return (
        <div>
            <h2 style={{
                fontSize: "20px",
                fontWeight: 700,
                lineHeight: "30px",
            }}>
                Termékek
            </h2>
            {products.length === 0 ? (
                <Grid container spacing="9px" justifyContent="start" style={{ marginTop: '20px', }}>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }} key={index}>
                            <Skeleton height={400} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Grid container spacing="9px" justifyContent="start" style={{ marginTop: '20px' }}>
                    {products.map((product, index) => (
                        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }} key={index}>
                            <SearchPageProductItems key={product.id} product={product} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
}

function SearchPageProductItems({ product }: Readonly<{ product: IProductItem }>) {
    return <ProductCard product={product} />;
}

function SearchPageProducerGrid({ producers }: Readonly<{ producers: IProducerItem[] }>) {
    return (
        <div>
            <h2 style={{
                fontSize: "20px",
                fontWeight: 700,
                lineHeight: "30px",
            }}>
                Termelők
            </h2>
            {producers.length === 0 ? (
                <Grid container spacing="9px" justifyContent="start" style={{ marginTop: '20px' }}>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }} key={index}>
                            <Skeleton height={400} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Grid container spacing="9px" justifyContent="start" style={{ marginTop: '20px' }}>
                    {producers.map((producer, index) => (
                        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }} key={index}>
                            <SearchPageProducerItems key={producer.id} producer={producer} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
}
function SearchPageProducerItems({ producer }: Readonly<{ producer: IProducerItem }>) {
    return <ProducerCard producer={producer} />;
}
