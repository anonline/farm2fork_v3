'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { _appAuthors, _appRelated, _appInvoices, _appInstalled } from 'src/_mock';

import { svgColorClasses } from 'src/components/svg-color';

import { AppWidget } from '../app-widget';
import AllUserWidget from '../alluser-widget';
import { AppNewInvoice } from '../app-new-invoice';
import { AppTopAuthors } from '../app-top-authors';
import { AppTopRelated } from '../app-top-related';
import { AppWidgetSummary } from '../app-widget-summary';
import { AppTopInstalledCountries } from '../app-top-installed-countries';

// ----------------------------------------------------------------------

type OverviewAppViewProps = {
    totalUsers: number;
    totalProcessingOrders: number;
    usersByMonthAtLastYear: number[];
    newUsersPercent: number;
    processingOrdersByMonthAtLastYear: {
        categories: string[],
        series: number[],
    };

    processingOrdersPercent: number;

    //ordersCountByShippingMethod: { label: string; value: number }[];

    /*ordersInYear: {
        name: string;
        data: {
            name: string;
            sum: number;
            data: number[];
        }[];
    }[];*/
};

export function OverviewAppView({
    totalUsers,
    usersByMonthAtLastYear,
    newUsersPercent,
    totalProcessingOrders,
    processingOrdersByMonthAtLastYear,
    processingOrdersPercent,
    //ordersCountByShippingMethod,
    //ordersInYear
}: Readonly<OverviewAppViewProps>) {
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
                        percent={processingOrdersPercent}
                        total={totalProcessingOrders}
                        /*chart={{
                            colors: [theme.palette.info.main],
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                            series: [20, 41, 63, 33, 28, 35, 50, 46],
                        }}*/
                        chart={processingOrdersByMonthAtLastYear}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <AllUserWidget
                        total={totalUsers}
                        series={usersByMonthAtLastYear}
                        percent={newUsersPercent}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    {/*<AppCurrentDownload
                        title="Folyamatban lévő rendelések"
                        subheader="Átvételi pontokra (elmúlt 30 nap)"
                        chart={{
                            series: ordersCountByShippingMethod
                        }}
                    />*/}
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 8 }}>
                    {/*<AppAreaInstalled
                        title="Rendelések alakulása"
                        subheader="szerepkörök szerint"
                        chart={{
                            categories: [
                                'Jan',
                                'Feb',
                                'Márc',
                                'Ápr',
                                'Máj',
                                'Jún',
                                'Júl',
                                'Aug',
                                'Szept',
                                'Okt',
                                'Nov',
                                'Dec',
                            ],
                            series: ordersInYear,
                        }}
                    />*/}
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
