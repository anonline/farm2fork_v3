import { Box, Card, Checkbox, CircularProgress, Collapse, Divider, FormControlLabel, FormGroup, FormHelperText, Stack } from "@mui/material";
import EditCardHeader from "./card-header";
import { UseBooleanReturn } from "minimal-shared/hooks";
import { Control, Controller, ControllerRenderProps } from "react-hook-form";
import { ICategoryItem } from "src/types/category";
import { NewProductSchemaType } from "../product-new-edit-form";

type CategoryCardProps = {
    isOpen: UseBooleanReturn;
    control: Control<NewProductSchemaType>;
    categoriesLoading: boolean;
    categories: ICategoryItem[];
}

export default function CategoryCard({ isOpen, control, categoriesLoading, categories }: CategoryCardProps) {
    const categoryOptions = categories
    .filter(cat => cat.id != null && cat.name != 'Összes termék')
    .map(cat => ({ value: cat.id as number, label: cat.name, parent: cat.parentId }));

    return (
        <Card>
            <EditCardHeader title="Kategóriák" isOpen={isOpen} sx={{ mb: 2 }} />
            <Divider />
            <Collapse in={isOpen.value}>
                <Stack spacing={3} sx={{ p: 3 }}>
                    <Controller
                        name="categoryIds"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <CategoryList
                                loading={categoriesLoading}
                                options={categoryOptions}
                                field={field}
                                error={error}
                            />
                        )}
                    />
                </Stack>
            </Collapse>
        </Card>
    );
}

type CategoryListProps = {
    loading: boolean;
    options: { value: number; label: string; parent: number | null }[];
    field: ControllerRenderProps<NewProductSchemaType, 'categoryIds'>;
    error: any;
};

function CategoryList({ loading, options, field, error }: CategoryListProps) {
    return (
        <Box>
            {loading
                ? <CircularProgress size={20} />
                : <FormGroup sx={{ flexDirection: 'column', flexWrap: 'wrap' }}>
                    {options.map((option) => <CategoryItem key={option.value} option={option} field={field} />)}
                </FormGroup>
            }

            {!!error && <FormHelperText error sx={{ ml: 2 }}>{error.message}</FormHelperText>}
        </Box>
    );
}

type CategoryItemProps = {
    option: { value: number; label: string; parent: number | null };
    field: ControllerRenderProps<NewProductSchemaType, 'categoryIds'>;
};

function CategoryItem({ option, field }: CategoryItemProps) {
    return (
        <FormControlLabel
            key={option.value}
            control={
                <Checkbox
                    checked={(field.value || []).includes(option.value)}
                    onChange={() => {
                        const currentValue = field.value || [];
                        const newValues = currentValue.includes(option.value)
                            ? currentValue.filter((v) => v !== option.value)
                            : [...currentValue, option.value];
                        field.onChange(newValues);
                    }}
                />
            }
            sx={{ ml: option.parent && option.parent !== 8 ? 4 : 0 }}
            label={option.label}
        />
    );
}