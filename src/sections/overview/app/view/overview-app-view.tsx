'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { _appAuthors, _appRelated, _appInvoices, _appInstalled } from 'src/_mock';

import { svgColorClasses } from 'src/components/svg-color';

import { useMockedUser } from 'src/auth/hooks';

import { AppWidget } from '../app-widget';
import { AppNewInvoice } from '../app-new-invoice';
import { AppTopAuthors } from '../app-top-authors';
import { AppTopRelated } from '../app-top-related';
import { AppAreaInstalled } from '../app-area-installed';
import { AppWidgetSummary } from '../app-widget-summary';
import { AppCurrentDownload } from '../app-current-download';
import { AppTopInstalledCountries } from '../app-top-installed-countries';

// ----------------------------------------------------------------------

export function OverviewAppView() {
    const { user } = useMockedUser();

    const theme = useTheme();

    return (
        <DashboardContent maxWidth="xl">
            <Grid container spacing={3}>
                {/*<Grid size={{ xs: 12, md: 8 }}>
          <AppWelcome
            title={`Welcome back 👋 \n ${user?.displayName}`}
            description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
            img={<SeoIllustration hideBackground />}
            action={
              <Button variant="contained" color="primary">
                Go now
              </Button>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AppFeatured list={_appFeatured} />
        </Grid>*/}

                <Grid size={{ xs: 12, md: 4 }}>
                    <AppWidgetSummary
                        title="Új rendelések"
                        percent={2.6}
                        total={185}
                        chart={{
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                            series: [15, 18, 12, 51, 68, 11, 39, 37],
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <AppWidgetSummary
                        title="Folyamatban lévő rendelések"
                        percent={0.2}
                        total={4876}
                        chart={{
                            colors: [theme.palette.info.main],
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                            series: [20, 41, 63, 33, 28, 35, 50, 46],
                        }}
                    />
                </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Összes felhaszáló"
            percent={2.44}
            total={678}
            chart={{
              colors: [theme.palette.error.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [18, 19, 31, 8, 16, 37, 12, 33],
            }}
          />
        </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <AppCurrentDownload
                        title="Folyamatban lévő rendelések"
                        subheader="Szállítási adatai"
                        chart={{
                            series: [
                                { label: 'Házhozszállítás', value: 12244 },
                                { label: 'Farm2Fork raktár', value: 53345 },
                                { label: 'BioKert', value: 44313 },
                                { label: 'Replacc', value: 78343 },
                            ],
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 8 }}>
                    <AppAreaInstalled
                        title="Area installed"
                        subheader="(+43%) than last year"
                        chart={{
                            categories: [
                                'Jan',
                                'Feb',
                                'Mar',
                                'Apr',
                                'May',
                                'Jun',
                                'Jul',
                                'Aug',
                                'Sep',
                                'Oct',
                                'Nov',
                                'Dec',
                            ],
                            series: [
                                {
                                    name: '2022',
                                    data: [
                                        {
                                            name: 'Asia',
                                            data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16],
                                        },
                                        {
                                            name: 'Europe',
                                            data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16],
                                        },
                                        {
                                            name: 'Americas',
                                            data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16],
                                        },
                                    ],
                                },
                                {
                                    name: '2023',
                                    data: [
                                        {
                                            name: 'Asia',
                                            data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17],
                                        },
                                        {
                                            name: 'Europe',
                                            data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17],
                                        },
                                        {
                                            name: 'Americas',
                                            data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17],
                                        },
                                    ],
                                },
                                {
                                    name: '2024',
                                    data: [
                                        {
                                            name: 'Asia',
                                            data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10],
                                        },
                                        {
                                            name: 'Europe',
                                            data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10],
                                        },
                                        {
                                            name: 'Americas',
                                            data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10],
                                        },
                                    ],
                                },
                            ],
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, lg: 8 }}>
                    <AppNewInvoice
                        title="New invoice"
                        tableData={_appInvoices}
                        headCells={[
                            { id: 'id', label: 'Invoice ID' },
                            { id: 'category', label: 'Category' },
                            { id: 'price', label: 'Price' },
                            { id: 'status', label: 'Status' },
                            { id: '' },
                        ]}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <AppTopRelated title="Related applications" list={_appRelated} />
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <AppTopInstalledCountries
                        title="Top installed countries"
                        list={_appInstalled}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <AppTopAuthors title="Top authors" list={_appAuthors} />
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
                        <AppWidget
                            title="Conversion"
                            total={38566}
                            icon="solar:user-rounded-bold"
                            chart={{ series: 48 }}
                        />

                        <AppWidget
                            title="Applications"
                            total={55566}
                            icon="solar:letter-bold"
                            chart={{
                                series: 75,
                                colors: [
                                    theme.vars.palette.info.light,
                                    theme.vars.palette.info.main,
                                ],
                            }}
                            sx={{
                                bgcolor: 'info.dark',
                                [`& .${svgColorClasses.root}`]: { color: 'info.light' },
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </DashboardContent>
    );
}
