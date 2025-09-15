import type { Control} from "react-hook-form";
import type { UseBooleanReturn } from "minimal-shared/hooks";

import { Controller } from "react-hook-form";

import { Card, Chip, Grid, Stack, Divider, Collapse, MenuItem, TextField, Autocomplete } from "@mui/material";

import { RHFTextField } from "src/components/hook-form";

import EditCardHeader from "./card-header";

import type { NewProductSchemaType } from "../product-new-edit-form";

type PropertiesCardProps = {
    isOpen: UseBooleanReturn;
    control: Control<NewProductSchemaType>;
    producers: { id: string; name: string }[];
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
                        name="cardText"
                        label="Kártya szöveg"
                        placeholder="Rövid leírás a termék kártyáján való megjelenítéshez"
                        helperText="Ez a szöveg egy info ikonra kattintva jelenik meg a termék kártyáján"
                        multiline
                        minRows={2}
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