import type { ChangeEvent} from "react";

import { useState } from "react";

import { Box, TextField, InputAdornment } from "@mui/material";

import F2FIcons from "../f2ficons/f2ficons";

export default function ProducersPageFilter() {
    const orderBys = [
        {value: 'default', label: 'Rendezés'},
        {value: 'asc', label: 'Név alapján növekvő'},
        {value: 'desc', label: 'Néva alapján csökkenő'},
    ];

    const handleChangeSorting = (event:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCurrentSorting(event.target.value);
    }

    const [currentSorting, setCurrentSorting] = useState(orderBys[0].value)

    return (
        <Box sx={{ border: '1px solid #bababa', backgroundColor: '#f5f5f5', padding: '16px 16px', borderRadius: '8px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px'}}>
                <TextField
                    variant='outlined'
                    fullWidth
                    size="small"
                    placeholder="Keress rá a termelő nevére"
                    style={{backgroundColor:'#fff'}}
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
                <TextField
                    variant='outlined'
                    select
                    
                    size="small"
                    value={currentSorting}
                    style={{backgroundColor:'#fff', width: '300px'}}
                    onChange={handleChangeSorting}
                    slotProps={{
                        select: { 
                            native: true,
                            startAdornment: (
                                <InputAdornment position="start">
                                    <F2FIcons name="Slider" width={22} height={22} />
                                </InputAdornment>
                            ),
                         },
                    }}
                >
                    {orderBys.map((option) => (
                        <option key={option.value} value={option.value} style={{padding:'5px'}}>
                            {option.label}
                        </option>
                    ))}
                </TextField>
            </Box>
        </Box>
    );
}