'use client';

import type { IProductItem } from 'src/types/product';
import type { IProducerItem } from 'src/types/producer';

import { useState, useEffect } from 'react';

import { Grid, Skeleton, Typography } from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import ProductCard from '../product-card/product-card';
import ProducerCard from '../producer-card/producer-card';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('s') || '';

    const [products, setProducts] = useState<IProductItem[]>([]);
    const [producers, setProducers] = useState<IProducerItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!searchTerm) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        Promise.all([
            fetch(`/api/search/products?q=${searchTerm}`).then((res) => res.json()),
            fetch(`/api/search/producers?q=${searchTerm}`).then((res) => res.json()),
        ])
            .then(([productData, producerData]) => {
                setProducts(productData || []);
                setProducers(producerData || []);
            })
            .catch((err) => {
                console.error('Hiba a keresés során:', err);
                setProducts([]);
                setProducers([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [searchTerm]);

    return (
        <main>
            <h1
                style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    lineHeight: '44px',
                }}
            >
                Keresési eredmények
            </h1>
            <SearchPageProductGrid products={products} isLoading={isLoading} />
            <SearchPageProducerGrid producers={producers} isLoading={isLoading} />
        </main>
    );
}

function SearchPageProductGrid({
    products,
    isLoading,
}: Readonly<{ products: IProductItem[]; isLoading: boolean }>) {
    let content;

    if (isLoading) {
        content = Array.from({ length: 5 }).map((_, index) => (
            <Grid size={{ xs: 6, sm: 4, lg: 2.4 }} key={'prod_skeleton_' + index}>
                <Skeleton variant="rectangular" height={320} />
            </Grid>
        ));
    } else if (products.length > 0) {
        content = products.map((product) => (
            <Grid size={{ xs: 6, sm: 4, lg: 2.4 }} key={product.id}>
                <ProductCard product={product}  />
            </Grid>
        ));
    } else {
        content = (
            <Typography sx={{ width: '100%', textAlign: 'center', py: 5 }}>
                Nem található a keresésnek megfelelő termék.
            </Typography>
        );
    }

    return (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, lineHeight: '30px' }}>Termékek</h2>
            <Grid container spacing="9px" justifyContent="start" style={{ marginTop: '20px' }}>
                {content}
            </Grid>
        </div>
    );
}

function SearchPageProducerGrid({
    producers,
    isLoading,
}: Readonly<{ producers: IProducerItem[]; isLoading: boolean }>) {
    let content;

    if (isLoading) {
        content = Array.from({ length: 5 }).map((_, index) => (
            <Grid size={{ xs: 6, sm: 4, lg: 2.4 }} key={'producer_skeleton_' + index}>
                <Skeleton variant="rectangular" height={320} />
            </Grid>
        ));
    } else if (producers.length > 0) {
        content = producers.map((producer) => (
            <Grid size={{ xs: 6, sm: 4, lg: 2.4 }} key={producer.id}>
                <ProducerCard producer={producer} />
            </Grid>
        ));
    } else {
        content = (
            <Typography sx={{ width: '100%', textAlign: 'center', py: 5 }}>
                Nem található a keresésnek megfelelő termelő.
            </Typography>
        );
    }

    return (
        <div>
            <h2
                style={{ fontSize: '20px', fontWeight: 700, lineHeight: '30px', marginTop: '40px' }}
            >
                Termelők
            </h2>
            <Grid container spacing="9px" justifyContent="start" style={{ marginTop: '20px' }}>
                {content}
            </Grid>
        </div>
    );
}
