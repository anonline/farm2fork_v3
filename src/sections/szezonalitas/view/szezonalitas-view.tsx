'use client';

import type { MonthsEnum } from 'src/types/months';

import { Fragment } from 'react';

import { Box, Grid, Container, Typography } from '@mui/material';

import { ProductsInMonthInCategoryProvider } from 'src/contexts/products-context';

import { getMonthName } from 'src/types/months';

import SzezonalisHonapKapcsolo from '../szezonalitas-honap-kapcsolo';
import { SzezonalitasTermekekWrapper } from '../szezonalis-termekek-wrapper';

type SzezonalitasViewProps = {
    month: MonthsEnum;
};

const categoriesToList = [
    {
        categoryTitle: 'Zöldségek',
        categoryId: 50,
    },
    {
        categoryTitle: 'Gyümölcsök',
        categoryId: 61,
    },
    {
        categoryTitle: 'Erdei és fűszernövények',
        categoryId: 59,
    },
];

export default function SzezonalitasView({ month }: Readonly<SzezonalitasViewProps>) {
    return (
        <Container sx={{ paddingX: '0px', paddingY: '32px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <Typography
                    variant="h1"
                    sx={{
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        paddingRight: 10,
                        fontSize: { xs: '40px', md: '64px' },
                        width: '100%',
                        lineHeight: { xs: '48px', md: '70px' },
                        letterSpacing: '-1px',
                    }}
                >
                    Szezonalitás
                </Typography>
                <SzezonalisHonapKapcsolo selectedMonth={month} />
                <Typography
                    variant="h2"
                    sx={{
                        fontSize: { xs: '28px', md: '40px' },
                        lineHeight: { xs: '33.4px', md: '48px' },
                        textTransform: 'uppercase',
                        fontWeight: 600,
                    }}
                >
                    {getMonthName(month)}
                </Typography>
                {categoriesToList.map((category) => (
                    <Fragment key={category.categoryId}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontSize: { xs: '20px', md: '28px' },
                                lineHeight: '36px',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                            }}
                        >
                            {category.categoryTitle}
                        </Typography>
                        <Grid container spacing={2}>
                            <ProductsInMonthInCategoryProvider
                                categoryId={category.categoryId}
                                month={month}
                            >
                                <SzezonalitasTermekekWrapper />
                            </ProductsInMonthInCategoryProvider>
                        </Grid>
                    </Fragment>
                ))}
            </Box>
        </Container>
    );
}
