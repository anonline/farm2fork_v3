import type { IDatePickerControl } from 'src/types/common';

import dayjs from 'dayjs';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import { AdaptiveDatePicker } from 'src/components/adaptive-date-picker';

// ----------------------------------------------------------------------

export function AdaptiveDatePickerDemo() {
    const [value, setValue] = useState<IDatePickerControl>(dayjs(new Date()));

    // Example highlighted dates - you can replace these with your own array
    const highlightedDates = [
        dayjs().add(3, 'day'),
        dayjs().add(7, 'day'),
        dayjs().add(14, 'day'),
        dayjs().subtract(2, 'day'),
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Adaptive Date Picker Demo
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Basic Usage
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    This date picker automatically switches between desktop and mobile modes based on screen size.
                    The highlighted dates are: {highlightedDates.map(d => d.format('MMM DD')).join(', ')}
                </Typography>
                
                <AdaptiveDatePicker
                    label="Select a date"
                    value={value}
                    onChange={(newValue) => setValue(newValue)}
                    highlightedDates={highlightedDates}
                />
                
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Selected date: {value ? value.format('MMMM DD, YYYY') : 'None'}
                </Typography>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Custom Breakpoint (Mobile on Small screens)
                </Typography>
                <AdaptiveDatePicker
                    label="Mobile on small screens"
                    value={value}
                    onChange={(newValue) => setValue(newValue)}
                    highlightedDates={highlightedDates}
                    breakpoint="lg"
                />
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Without Highlighted Dates
                </Typography>
                <AdaptiveDatePicker
                    label="No highlights"
                    value={value}
                    onChange={(newValue) => setValue(newValue)}
                />
            </Paper>
        </Box>
    );
}