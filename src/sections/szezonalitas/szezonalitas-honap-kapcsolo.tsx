"use client";

import { Box, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, useTheme, useMediaQuery } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Months } from "src/types/months";
import SzezonalisKapcsolo from "src/sections/szezonalitas/szezonalis-kapcsolo";


export default function SzezonalisHonapKapcsolo() {
    const router = useRouter();
    const pathname = usePathname();
    const months = Object.values(Months);
    const currentMonth = pathname.split('/').filter(Boolean).pop();
    const [pendingMonth, setPendingMonth] = useState<string | null>(null);
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

    useEffect(() => {
        setPendingMonth(null);
    }, [currentMonth]);

    const handleMonthClick = (month: string) => {
        setPendingMonth(month);
        router.push(`/szezonalitas/${month}`);
    };

    const handleDropdownChange = (event: SelectChangeEvent<string>) => {
        const month = event.target.value;
        setPendingMonth(month);
        router.push(`/szezonalitas/${month}`);
    };

    const MonhtGridStyle = {
        width: 100,
        height: 140,
        border: "1px solid rgb(223, 220, 209)"
    };
    const FirstLastGridStyle = {
        width: 60,
        heigth: 80,
        borderTop: "1px solid rgb(223, 220, 209)",
        borderBottom: "1px solid rgb(223, 220, 209)"
    };

    return (
        isLargeScreen ? (
            <Grid container spacing={0} wrap="nowrap" sx={{ width: "100%", justifyContent: "center", alignSelf: "center", mb: 3 }}>
                <Grid sx={FirstLastGridStyle}></Grid>
                {months.map((month) => {
                    const isSelected = (pendingMonth ?? currentMonth) === month;
                    return (
                        <Grid key={month} sx={MonhtGridStyle}>
                            <SzezonalisKapcsolo
                                month={month}
                                selected={isSelected}
                                onClick={() => handleMonthClick(month)}
                            />
                        </Grid>
                    )
                })}
                <Grid sx={FirstLastGridStyle}></Grid>
            </Grid>
        ) : (
            <Box sx={{ width: '100%', mx: 'auto', mb: 4 }}>
                <FormControl fullWidth>
                    <InputLabel id="month-select-label">Hónap kiválasztása</InputLabel>
                    <Select
                        labelId="month-select-label"
                        id="month-select"
                        value={currentMonth ?? ''}
                        label="Hónap kiválasztása"
                        onChange={handleDropdownChange}
                    >
                        {months.map((month) => (
                            <MenuItem key={month} value={month}>
                                {month}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        )
    );
}

