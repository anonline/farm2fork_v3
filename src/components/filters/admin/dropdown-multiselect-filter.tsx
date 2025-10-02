import type { SelectChangeEvent } from "@mui/material";

import { varAlpha } from 'minimal-shared/utils';

import { Select, Checkbox, MenuItem, InputLabel, FormControl, OutlinedInput } from "@mui/material";


type DropdownMultiSelectFilterProps = {
    label: string;
    options: { value: string; label: string }[];
    selectedValues: string[];
    onChange: (event: SelectChangeEvent<string[]>) => void;
    onApply: () => void;
};

export default function DropdownMultiSelectFilter({ label, options, selectedValues, onChange, onApply }: Readonly<DropdownMultiSelectFilterProps>) {
    return (
        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 }, mr: 0 }}>
            <InputLabel id={`filter-${label}-select-label`}>{label}</InputLabel>
            <Select
                multiple
                value={selectedValues}
                onChange={onChange}
                input={<OutlinedInput label={label} />}
                renderValue={(selected) => selected.map((value) => options.find((option) => option.value === value)?.label).join(', ')}
                inputProps={{ id: `filter-${label}-select` }}
                sx={{ textTransform: 'capitalize' }}
                MenuProps={{
                    PaperProps: {
                        sx: {
                            maxHeight: 500,
                        },
                    },
                }}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        <Checkbox
                            disableRipple
                            size="small"
                            checked={selectedValues.includes(option.value)}
                            slotProps={{
                                input: {
                                    id: `${option.value}-checkbox`,
                                    'aria-label': `${option.label} checkbox`,
                                },
                            }}
                        />
                        {option.label.toLowerCase() == 'true' ? 'Igen' : option.label.toLowerCase() == 'false' ? 'Nem' : option.label}
                    </MenuItem>
                ))}

                <MenuItem
                    disableGutters
                    disableTouchRipple
                    onClick={onApply}
                    sx={[
                        (theme) => ({
                            justifyContent: 'center',
                            fontWeight: theme.typography.button,
                            bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                        }),
                    ]}
                >
                    Alkalmaz
                </MenuItem>
            </Select>
        </FormControl>
    );
}