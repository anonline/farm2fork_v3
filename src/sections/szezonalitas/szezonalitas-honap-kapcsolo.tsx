"use client";

import type { SelectChangeEvent} from "@mui/material";

import { useRouter } from "next/navigation";

import { Box, Grid, Select, MenuItem, useTheme, InputLabel, FormControl, useMediaQuery } from "@mui/material";

import SzezonalisKapcsolo from "src/sections/szezonalitas/szezonalis-kapcsolo";

import { MonthsEnum, getMonthName } from "src/types/months";


interface SzezonalisHonapKapcsoloProps {
    selectedMonth: MonthsEnum;
}

export default function SzezonalisHonapKapcsolo({ selectedMonth }: SzezonalisHonapKapcsoloProps) {
    const router = useRouter();
    const months = Object.values(MonthsEnum);

    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));


    const handleMonthClick = (month: string) => {
        router.push(`/szezonalitas/${month}`);
    };

    const handleDropdownChange = (event: SelectChangeEvent<string>) => {
        const month = event.target.value;
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
                <Grid sx={FirstLastGridStyle} />

                {months.map((month) => (
                    <Grid key={month} sx={MonhtGridStyle}>
                        <SzezonalisKapcsolo
                            month={month}
                            selected={selectedMonth == month}
                            onClick={() => handleMonthClick(month)}
                        />
                    </Grid>
                )
                )}

                <Grid sx={FirstLastGridStyle} />
            </Grid>
        ) : (
            <Box sx={{ width: '100%', mx: 'auto', mb: 4 }}>
                <FormControl fullWidth>
                    <InputLabel id="month-select-label">Hónap kiválasztása</InputLabel>
                    <Select
                        labelId="month-select-label"
                        id="month-select"
                        value={selectedMonth ?? MonthsEnum.January}
                        label="Hónap kiválasztása"
                        onChange={handleDropdownChange}
                    >
                        {months.map((month) => (
                            <MenuItem key={month} value={month}>
                                {getMonthName(month)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        )
    );
}

