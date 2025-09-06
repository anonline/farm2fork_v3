import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { AppWidgetSummary } from './app-widget-summary';

export default function AllUserWidget({
    total,
    series,
    percent,
}: Readonly<{ total: number; series: number[]; percent: number }>) {
    const theme = useTheme();

    const monthNamesHungarian = [
        'Január',
        'Február',
        'Március',
        'Április',
        'Május',
        'Június',
        'Július',
        'Augusztus',
        'Szeptember',
        'Október',
        'November',
        'December',
    ];
    const now = new Date();
    const lastTwelveMonthNameHungarian = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        return monthNamesHungarian[date.getMonth()];
    });

    return (
        <AppWidgetSummary
            title="Összes felhasználó"
            percent={percent}
            total={total}
            link={paths.dashboard.user.list}
            suffix=" fő"
            chart={{
                colors: [theme.palette.error.main],
                categories: lastTwelveMonthNameHungarian,
                series,
            }}
        />
    );
}
