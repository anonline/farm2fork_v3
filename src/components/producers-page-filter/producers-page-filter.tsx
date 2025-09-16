import type { ChangeEvent } from 'react';

import { useState, useEffect } from 'react';

import { Box, TextField, InputAdornment, Select, MenuItem, SelectChangeEvent } from '@mui/material';

import { SortingOrder } from 'src/types/search';

import F2FIcons from '../f2ficons/f2ficons';

type Props = {
    onChange: (filters: { keyword: string; direction: SortingOrder }) => void;
};
type SortingOption = 'default' | 'asc' | 'desc';

export default function ProducersPageFilter({ onChange }: Props) {
    const orderBys = [
        { value: 'default', label: 'Rendezés' },
        { value: 'asc', label: 'Név alapján növekvő' },
        { value: 'desc', label: 'Név alapján csökkenő' },
    ];

    const handleChangeSorting = (event: SelectChangeEvent<SortingOption>) => {
        const value = orderBys.find((option) => option.value === event.target.value)?.value || orderBys[0].value;
        setCurrentSorting(value as SortingOption);
    };

    const [currentSorting, setCurrentSorting] = useState<SortingOption>(orderBys[0].value as SortingOption);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        let direction: SortingOrder = SortingOrder.Ascending;
        if (currentSorting === 'desc') {
            direction = SortingOrder.Descending;
        }
        onChange({ keyword, direction });
    }, [keyword, currentSorting]);

    return (
        <Box
            sx={{
                border: '1px solid #bababa',
                backgroundColor: '#f5f5f5',
                padding: '16px 16px',
                borderRadius: '8px',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TextField
                    variant="outlined"
                    fullWidth
                    size="small"
                    placeholder="Keress rá a termelő nevére"
                    style={{ backgroundColor: '#fff' }}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <F2FIcons name="Search2" width={22} height={22} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                
                <Select
                    onChange={handleChangeSorting}
                    value={currentSorting}
                    size="small"
                    displayEmpty
                    sx={{
                        width: {
                            xs: '100%',
                            sm: 'initial',
                            md: 'initial',
                            lg: 'initial',
                            xl: 'initial',
                        },
                        minWidth: '200px',
                        backgroundColor: '#fff',
                        borderRadius: '4px',
                        height: '38px',

                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            outline: 'none',
                            boxShadow: 'none',
                            border: '1px solid #bababa',
                        },
                        pl: 4, // add left padding for the icon
                        position: 'relative',
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            left: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 20,
                            height: 20,
                            backgroundImage:
                                'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC4wMDAyIDEzLjY2NjNDMTEuMTk3NiAxMy42NjYzIDEyLjIxNjIgMTQuNDMxNiAxMi41OTM3IDE1LjQ5OThMMTguMjUwMiAxNS40OTk3QzE4Ljc1NjQgMTUuNDk5NyAxOS4xNjY4IDE1LjkxMDEgMTkuMTY2OCAxNi40MTYzQzE5LjE2NjggMTYuOTIyNiAxOC43NTY0IDE3LjMzMyAxOC4yNTAyIDE3LjMzM0wxMi41OTM0IDE3LjMzMzhDMTIuMjE1NiAxOC40MDE1IDExLjE5NzIgMTkuMTY2MyAxMC4wMDAyIDE5LjE2NjNDOC44MDMxIDE5LjE2NjMgNy43ODQ2OCAxOC40MDE1IDcuNDA2OTMgMTcuMzMzOEwxLjc1MDE2IDE3LjMzM0MxLjI0MzkgMTcuMzMzIDAuODMzNDk2IDE2LjkyMjYgMC44MzM0OTYgMTYuNDE2M0MwLjgzMzQ5NiAxNS45MTAxIDEuMjQzOSAxNS40OTk3IDEuNzUwMTYgMTUuNDk5N0w3LjQwNjYxIDE1LjQ5OThDNy43ODQxMSAxNC40MzE2IDguODAyNzYgMTMuNjY2MyAxMC4wMDAyIDEzLjY2NjNaTTEwLjAwMDIgMTUuNDk5N0M5LjQ5MzkgMTUuNDk5NyA5LjA4MzUgMTUuOTEwMSA5LjA4MzUgMTYuNDE2M0M5LjA4MzUgMTYuOTIyNiA5LjQ5MzkgMTcuMzMzIDEwLjAwMDIgMTcuMzMzQzEwLjUwNjQgMTcuMzMzIDEwLjkxNjggMTYuOTIyNiAxMC45MTY4IDE2LjQxNjNDMTAuOTE2OCAxNS45MTAxIDEwLjUwNjQgMTUuNDk5NyAxMC4wMDAyIDE1LjQ5OTdaTTE2LjQxNjggNy4yNDk2N0MxNy45MzU2IDcuMjQ5NjcgMTkuMTY2OCA4LjQ4MDg5IDE5LjE2NjggOS45OTk2N0MxOS4xNjY4IDExLjUxODUgMTcuOTM1NiAxMi43NDk3IDE2LjQxNjggMTIuNzQ5N0MxNS4yMTk4IDEyLjc0OTcgMTQuMjAxNCAxMS45ODQ4IDEzLjgyMzYgMTAuOTE3MkwxLjc1MDE2IDEwLjkxNjNDMS4yNDM5IDEwLjkxNjMgMC44MzM0OTYgMTAuNTA1OSAwLjgzMzQ5NiA5Ljk5OTY3QzAuODMzNDk2IDkuNDkzNDEgMS4yNDM5IDkuMDgzMDEgMS43NTAxNiA5LjA4MzAxTDEzLjgyMzMgOS4wODMwOUMxNC4yMDA4IDguMDE0OTUgMTUuMjE5NCA3LjI0OTY3IDE2LjQxNjggNy4yNDk2N1pNMTYuNDE2OCA5LjA4MzAxQzE1LjkxMDYgOS4wODMwMSAxNS41MDAyIDkuNDkzNDEgMTUuNTAwMiA5Ljk5OTY3QzE1LjUwMDIgMTAuNTA1OSAxNS45MTA2IDEwLjkxNjMgMTYuNDE2OCAxMC45MTYzQzE2LjkyMzEgMTAuOTE2MyAxNy4zMzM1IDEwLjUwNTkgMTcuMzMzNSA5Ljk5OTY3QzE3LjMzMzUgOS40OTM0MSAxNi45MjMxIDkuMDgzMDEgMTYuNDE2OCA5LjA4MzAxWk0zLjU4MzUgMC44MzMwMDhDNC43ODU5OCAwLjgzMzAwOCA1LjgwODIgMS42MDQ4IDYuMTgxODIgMi42ODAwNUM2LjIzMDgyIDIuNjcwNjQgNi4yODE2NSAyLjY2NjM0IDYuMzMzNSAyLjY2NjM0SDE4LjI1MDJDMTguNzU2NCAyLjY2NjM0IDE5LjE2NjggMy4wNzY3NSAxOS4xNjY4IDMuNTgzMDFDMTkuMTY2OCA0LjA4OTI3IDE4Ljc1NjQgNC40OTk2NyAxOC4yNTAyIDQuNDk5NjdINi4zMzM1QzYuMjgxNjUgNC40OTk2NyA2LjIzMDgyIDQuNDk1MzcgNi4xODEzMiA0LjQ4NzFDNS44MDgyIDUuNTYxMjEgNC43ODU5OCA2LjMzMzAxIDMuNTgzNSA2LjMzMzAxQzIuMDY0NzEgNi4zMzMwMSAwLjgzMzQ5NiA1LjEwMTc5IDAuODMzNDk2IDMuNTgzMDFDMC44MzM0OTYgMi4wNjQyMiAyLjA2NDcxIDAuODMzMDA4IDMuNTgzNSAwLjgzMzAwOFpNMy41ODM1IDIuNjY2MzRDMy4wNzcyMyAyLjY2NjM0IDIuNjY2ODMgMy4wNzY3NSAyLjY2NjgzIDMuNTgzMDFDMi42NjY4MyA0LjA4OTI3IDMuMDc3MjMgNC40OTk2NyAzLjU4MzUgNC40OTk2N0M0LjA4OTc2IDQuNDk5NjcgNC41MDAxNiA0LjA4OTI3IDQuNTAwMTYgMy41ODMwMUM0LjUwMDE2IDMuMDc2NzUgNC4wODk3NiAyLjY2NjM0IDMuNTgzNSAyLjY2NjM0WiIgZmlsbD0iIzI2MjYyNiIvPgo8L3N2Zz4K")',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'contain',
                            pointerEvents: 'none',
                        },
                    }}
                    // Remove IconComponent to avoid default dropdown icon
                    IconComponent={() => null}
                >
                    {orderBys.map((option) => (
                        <MenuItem key={option.value} value={option.value} style={{ padding: '5px' }}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
        </Box>
    );
}
