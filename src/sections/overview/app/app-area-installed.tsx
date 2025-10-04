import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fNumber, fShortenNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
    title?: string;
    subheader?: string;
    chart: {
        colors?: string[];
        categories: string[];
        series: {
            name: string;
            data: {
                name: string;
                sum: number;
                data: number[];
            }[];
        }[];
        options?: ChartOptions;
    };
};

export function AppAreaInstalled({ title, subheader, chart, sx, ...other }: Props) {
    const theme = useTheme();

    const [selectedSeries, setSelectedSeries] = useState('2025');
    const [selectedSeriesIndex, setSelectedSeriesIndex] = useState(0);

    const chartColors = chart.colors ?? [
        theme.palette.primary.dark,
        theme.palette.warning.main,
        theme.palette.info.main,
    ];

    const chartOptions = useChart({
        chart: { stacked: true },
        colors: chartColors,
        stroke: { width: 0 },
        xaxis: { categories: chart.categories },
        tooltip: { y: { formatter: (value: number) => fNumber(value) } },
        plotOptions: { bar: { columnWidth: '40%' } },
        ...chart.options,
    });

    const handleChangeSeries = useCallback((newValue: string) => {
        setSelectedSeries(newValue);
        setSelectedSeriesIndex(chart.series.findIndex((i) => i.name === newValue));
    }, []);

    const currentSeries = chart.series.find((i) => i.name === selectedSeries);

    return (
        <Card sx={sx} {...other}>
            <CardHeader
                title={title}
                subheader={subheader}
                action={
                    <ChartSelect
                        options={chart.series.map((item) => item.name)}
                        value={selectedSeries}
                        onChange={handleChangeSeries}
                    />
                }
                sx={{ mb: 3 }}
            />

            <ChartLegends
                colors={chartOptions?.colors}
                labels={chart.series[selectedSeriesIndex].data.map((item) => item.name)}
                values={chart.series[selectedSeriesIndex].data.map((item) => fShortenNumber(item.sum))}
                sx={{ px: 3, gap: 3 }}
            />

            <Chart
                key={selectedSeries}
                type="bar"
                series={currentSeries?.data}
                options={chartOptions}
                slotProps={{ loading: { p: 2.5 } }}
                sx={{
                    pl: 1,
                    py: 2.5,
                    pr: 2.5,
                    height: 320,
                }}
            />
        </Card>
    );
}
