'use client';

import 'dayjs/locale/hu';

import type { Dayjs } from 'dayjs';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import type { IDeniedShippingDate } from 'src/types/denied-shipping-date';

import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useCallback } from 'react';

// Configure dayjs to use Hungarian locale
dayjs.locale('hu');

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { toggleDeniedShippingDate } from 'src/actions/denied-shipping-date';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

type Props = Readonly<{
    deniedDates: IDeniedShippingDate[];
}>;

export function DeniedShippingDatesView({ deniedDates: initialDeniedDates }: Props) {
    const router = useRouter();
    const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
    const [isLoading, setIsLoading] = useState(false);
    const [deniedDates, setDeniedDates] = useState<IDeniedShippingDate[]>(initialDeniedDates);

    // Convert denied dates to Set for quick lookup (memoized)
    const deniedDatesSet = useMemo(
        () => new Set(deniedDates.map((d) => d.date)),
        [deniedDates]
    );

    const handleDayClick = useCallback(
        async (date: Dayjs) => {
            const dateStr = date.format('YYYY-MM-DD');

            setIsLoading(true);
            try {
                const result = await toggleDeniedShippingDate(dateStr);

                // Update local state optimistically
                if (result.isDenied) {
                    setDeniedDates((prev) => 
                        [...prev, { date: dateStr }].sort((a, b) => 
                            a.date.localeCompare(b.date)
                        )
                    );
                    toast.success(`${date.format('YYYY.MM.DD')} hozzáadva a letiltott dátumokhoz`);
                } else {
                    setDeniedDates((prev) => prev.filter((d) => d.date !== dateStr));
                    toast.success(`${date.format('YYYY.MM.DD')} eltávolítva a letiltott dátumokból`);
                }

                // Refresh server data
                router.refresh();
            } catch (error) {
                console.error('Error toggling denied date:', error);
                toast.error('Hiba történt a dátum módosítása során');
            } finally {
                setIsLoading(false);
            }
        },
        [router]
    );

    const CustomDay = useCallback(
        (props: PickersDayProps<Dayjs>) => {
            const { day, ...other } = props;
            // Ensure day is a Dayjs object
            const dayjsDate = dayjs(day);
            const dateStr = dayjsDate.format('YYYY-MM-DD');
            const isDenied = deniedDatesSet.has(dateStr);

            const handleClick = (event: React.MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                handleDayClick(dayjsDate);
            };

            return (
                <PickersDay
                    {...other}
                    day={day}
                    disableRipple
                    sx={{
                        ...(isDenied && {
                            backgroundColor: 'error.main',
                            color: 'error.contrastText',
                            '&:hover': {
                                backgroundColor: 'error.dark',
                            },
                            '&.Mui-selected': {
                                backgroundColor: 'error.dark',
                            },
                            '&:focus': {
                                backgroundColor: 'error.main',
                            },
                        }),
                        cursor: 'pointer',
                    }}
                    onClick={handleClick}
                />
            );
        },
        [deniedDatesSet, handleDayClick]
    );

    const handleClearMonth = useCallback(async () => {
        const monthStart = selectedMonth.startOf('month');
        const monthEnd = selectedMonth.endOf('month');

        const datesInMonth = deniedDates.filter((d) => {
            const date = dayjs(d.date);
            return date.isAfter(monthStart.subtract(1, 'day')) && date.isBefore(monthEnd.add(1, 'day'));
        });

        if (datesInMonth.length === 0) {
            toast.info('Nincs letiltott dátum ebben a hónapban');
            return;
        }

        setIsLoading(true);
        try {
            // Remove all dates in the current month
            await Promise.all(
                datesInMonth.map((d) => toggleDeniedShippingDate(d.date))
            );

            // Update local state
            const removedDates = new Set(datesInMonth.map((d) => d.date));
            setDeniedDates((prev) => prev.filter((d) => !removedDates.has(d.date)));

            // Refresh server data
            router.refresh();
            toast.success(`${datesInMonth.length} dátum eltávolítva`);
        } catch (error) {
            console.error('Error clearing month:', error);
            toast.error('Hiba történt a dátumok törlése során');
        } finally {
            setIsLoading(false);
        }
    }, [selectedMonth, deniedDates, router]);

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Letiltott szállítási dátumok"
                links={[
                    { name: 'Vezérlőpult', href: paths.dashboard.root },
                    { name: 'Beállítások' },
                    { name: 'Letiltott dátumok' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Box
                sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateColumns: { xs: '1fr', lg: '450px 1fr' },
                }}
            >
                {/* Calendar Section */}
                <Card sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                Kattints egy napra a letiltásához vagy engedélyezéséhez. A piros színű napok
                                le vannak tiltva.
                            </Typography>
                        </Box>

                        <StaticDatePicker
                            displayStaticWrapperAs="desktop"
                            value={selectedMonth}
                            onChange={(newValue) => {
                                if (newValue && !newValue.isSame(selectedMonth, 'month')) {
                                    setSelectedMonth(newValue);
                                }
                            }}
                            slots={{
                                day: CustomDay,
                            }}
                            slotProps={{
                                actionBar: {
                                    actions: [],
                                },
                            }}
                            disabled={isLoading}
                            readOnly
                        />

                        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                                Összes letiltott dátum: <strong>{deniedDates.length}</strong>
                            </Typography>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleClearMonth}
                                disabled={isLoading}
                                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                            >
                                Hónap törlése
                            </Button>
                        </Stack>
                    </Stack>
                </Card>

                {/* Denied Dates List Section */}
                <Card sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Typography variant="h6">Letiltott dátumok listája</Typography>

                        {deniedDates.length === 0 ? (
                            <Box
                                sx={{
                                    py: 5,
                                    textAlign: 'center',
                                    color: 'text.secondary',
                                }}
                            >
                                <Iconify icon="solar:calendar-date-bold" width={48} sx={{ mb: 2, opacity: 0.5 }} />
                                <Typography variant="body2">Nincs letiltott dátum</Typography>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    maxHeight: 600,
                                    overflow: 'auto',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1.5,
                                    }}
                                >
                                    {deniedDates.map((deniedDate) => {
                                        const date = dayjs(deniedDate.date);
                                        return (
                                            <Box
                                                key={deniedDate.date}
                                                sx={{
                                                    position: 'relative',
                                                    p: 2,
                                                    bgcolor: 'error.lighter',
                                                    borderRadius: 1.5,
                                                    border: '1px solid',
                                                    borderColor: 'error.light',
                                                    minWidth: 140,
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: 'error.light',
                                                        borderColor: 'error.main',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: 1,
                                                        '& .delete-btn': {
                                                            opacity: 1,
                                                        },
                                                    },
                                                }}
                                            >
                                                <Stack spacing={0.5}>
                                                    <Typography variant="body2" fontWeight={600} color="error.dark">
                                                        {date.format('YYYY. MM. DD.')}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {date.format('dddd')}
                                                    </Typography>
                                                </Stack>
                                                <Box
                                                    className="delete-btn"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 4,
                                                        right: 4,
                                                        opacity: 0,
                                                        transition: 'opacity 0.2s',
                                                    }}
                                                >
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        sx={{
                                                            minWidth: 'auto',
                                                            p: 0.5,
                                                        }}
                                                        onClick={() => handleDayClick(date)}
                                                        disabled={isLoading}
                                                    >
                                                        <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                                    </Button>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}
                    </Stack>
                </Card>
            </Box>
        </DashboardContent>
    );
}
