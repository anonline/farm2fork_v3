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
            <h1>Search Page</h1>
            <p>{searchTerm}</p>
            <SearchPageProductGrid products={products} />
            <SearchPageProducerGrid producers={producers} />
        </main>
    );
}

function SearchPageProductGrid({ products }: { products: IProductItem[] }) {
    return (
        <div>
            <h2>Products</h2>
            {products.length === 0 ? (
                <Grid container spacing={1} justifyContent="start" style={{ marginTop: '20px' }}>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Grid size={{ xs: 12, sm: 4, md: 2.4, lg: 2.4 }} key={index}>
                            <Skeleton height={400} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Grid container spacing={1} justifyContent="start" style={{ marginTop: '20px' }}>
                    {products.map((product, index) => (
                        <Grid size={{ xs: 12, sm: 4, md: 2.4, lg: 2.4 }} key={index}>
                            <SearchPageProductItems key={product.id} product={product} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
}

function SearchPageProductItems({ product }: { product: IProductItem }) {
    return <ProductCard product={product} />;
}

function SearchPageProducerGrid({ producers }: { producers: IProducerItem[] }) {
    return (
        <div>
            <h2>Producers</h2>
            {producers.map((producer) => (
                <SearchPageProducerItems key={producer.id} producer={producer} />
            ))}
        </div>
    );
}

function SearchPageProducerItems({ producer }: { producer: IProducerItem }) {
    return <ProducerCard producer={producer} />;
}
