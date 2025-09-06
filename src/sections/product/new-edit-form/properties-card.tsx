import { Autocomplete, Card, Chip, Collapse, Divider, Grid, MenuItem, Stack, TextField } from "@mui/material";
import EditCardHeader from "./card-header";

import { RHFTextField } from "src/components/hook-form";
import { NewProductSchemaType } from "../product-new-edit-form";
import { Control, Controller } from "react-hook-form";
import { UseBooleanReturn } from "minimal-shared/hooks";
import { HelperText } from "src/components/hook-form/help-text";

type PropertiesCardProps = {
    isOpen: UseBooleanReturn;
    control: Control<NewProductSchemaType>;
    producers: { id: number; name: string }[];
    UNIT_OPTIONS: { value: string; label: string }[];
}

export default function PropertiesCard({ isOpen, control, producers, UNIT_OPTIONS }: Readonly<PropertiesCardProps>) {
    return (
        <Card>
            <EditCardHeader title="Tulajdonságok" isOpen={isOpen} sx={{ mb: 2 }} />
            <Divider />
            <Collapse in={isOpen.value}>
                <Stack spacing={3} sx={{ p: 3 }}>
                    <Controller
                        name="tags"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                multiple
                                freeSolo
                                options={[]}
                                value={field.value || []}
                                onChange={(event, newValue) => field.onChange(newValue)}
                                renderTags={renderTagChips}
                                renderInput={(params) => <TextField label="Címkék" placeholder='A címkéket enter leütésével add hozzá' {...params} />}
                            />
                        )}
                    />

                    <RHFTextField
                        select
                        name="producerId"
                        label="Termelő"
                        slotProps={{ inputLabel: { shrink: true } }}
                    >
                        <MenuItem value="">Nincs</MenuItem>
                        {producers.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                    </RHFTextField>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <RHFTextField select name="unit" label="Mértékegység">
                                {UNIT_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                            </RHFTextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <RHFTextField name="stepQuantity" label="Lépték" type="number" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <RHFTextField name="mininumQuantity" label="Kosárba tétel minimuma" type="number" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <RHFTextField name="maximumQuantity" label="Kosárba tétel maximuma" type="number" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <RHFTextField name="storingInformation" label="Tárolási információk" multiline minRows={2} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <RHFTextField name="usageInformation" label="Felhasználási információk" multiline minRows={2} />
                        </Grid>
                    </Grid>
                </Stack>
            </Collapse>
        </Card>
    );
}

function renderTagChips(value: string[], getTagProps: any) {
    if (!Array.isArray(value)) return null;
    return value.map((option, index) => (
        <Chip {...getTagProps({ index })} key={option} size="small" label={option} />
    ));
}