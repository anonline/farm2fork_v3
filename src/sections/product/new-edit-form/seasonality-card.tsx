import type { Control} from "react-hook-form";
import type { MonthKeys } from "src/types/product";
import type { UseBooleanReturn } from "minimal-shared/hooks";

import { Controller } from "react-hook-form";

import Card from "@mui/material/Card";
import Collapse from "@mui/material/Collapse";
import { Stack, Divider, Checkbox, FormGroup, FormControlLabel } from "@mui/material";

import EditCardHeader from "./card-header";

import type { NewProductSchemaType } from "../product-new-edit-form";

const MONTH_OPTIONS: { value: MonthKeys, label: string }[] = [
    { value: 'January', label: 'Január' }, { value: 'February', label: 'Február' }, { value: 'March', label: 'Március' },
    { value: 'April', label: 'Április' }, { value: 'May', label: 'Május' }, { value: 'June', label: 'Június' },
    { value: 'July', label: 'Július' }, { value: 'August', label: 'Augusztus' }, { value: 'September', label: 'Szeptember' },
    { value: 'October', label: 'Október' }, { value: 'November', label: 'November' }, { value: 'December', label: 'December' },
];

type SeasonalityCheckboxGroupProps = {
    isOpen: UseBooleanReturn;
    control: Control<NewProductSchemaType>;
};

export default function SeasonalityCard({isOpen, control}: Readonly<SeasonalityCheckboxGroupProps> ) {
    return (
        <Card>
            <EditCardHeader title="Szezonalitás" isOpen={isOpen} sx={{ mb: 2 }} />
            <Divider />
            <Collapse in={isOpen.value}>
                <Stack spacing={3} sx={{ p: 3 }}>
                    <Controller
                        name="seasonality"
                        control={control}
                        render={({ field }) => <SeasonalityCheckboxGroup field={field} onChange={handleSeasonalityChange} />}
                    />
                </Stack>
            </Collapse>
        </Card>
    );
}

function SeasonalityCheckboxGroup({ field, onChange }: Readonly<{ field: any, onChange: (field: any, optionValue: MonthKeys) => void }>) {
    return (
        <FormGroup>
            {MONTH_OPTIONS.map((option) => (
                <FormControlLabel
                    key={option.value}
                    control={
                        <Checkbox
                            checked={(field.value || []).includes(option.value)}
                            onChange={() => onChange(field, option.value)}
                        />
                    }
                    label={option.label}
                />
            ))}
        </FormGroup>
    );
}

function handleSeasonalityChange(field: any, optionValue: MonthKeys) {
    const currentValue = field.value || [];
    const newValues = currentValue.includes(optionValue)
        ? currentValue.filter((v: MonthKeys) => v !== optionValue)
        : [...currentValue, optionValue];
    field.onChange(newValues);
}