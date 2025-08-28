'use client';

import type { MonthKeys, IProductItem } from 'src/types/product';

import { z as zod } from 'zod';
import { useBoolean } from 'minimal-shared/hooks';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Card, Chip, Stack, Button, Divider, Collapse, Checkbox, MenuItem, TextField, FormGroup, IconButton, CardHeader, Typography, Autocomplete, FormHelperText, FormControlLabel, CircularProgress } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { uploadFile } from 'src/lib/blob/blobClient';
import { useCategories } from 'src/contexts/category-context';
import { useProducers } from 'src/contexts/producers-context';
import { useProductCategoryConnection } from 'src/contexts/product-category-connection-context';
import { createProduct, updateProduct, fetchGetProductBySlug, updateProductCategoryRelations } from 'src/actions/product';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, RHFSwitch, schemaHelper, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const UNIT_OPTIONS = [
    { value: 'kg', label: 'kg' }, { value: 'db', label: 'db' }, { value: 'csomag', label: 'csomag' },
    { value: 'üveg', label: 'üveg' }, { value: 'csokor', label: 'csokor' }, { value: 'doboz', label: 'doboz' },
];

const MONTH_OPTIONS: { value: MonthKeys, label: string }[] = [
    { value: 'January', label: 'Január' }, { value: 'February', label: 'Február' }, { value: 'March', label: 'Március' },
    { value: 'April', label: 'Április' }, { value: 'May', label: 'Május' }, { value: 'June', label: 'Június' },
    { value: 'July', label: 'Július' }, { value: 'August', label: 'Augusztus' }, { value: 'September', label: 'Szeptember' },
    { value: 'October', label: 'Október' }, { value: 'November', label: 'November' }, { value: 'December', label: 'December' },
];

const monthValues: [MonthKeys, ...MonthKeys[]] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const NewProductSchema = zod.object({
    name: zod.string().min(1, { message: 'Név megadása kötelező!' }),
    url: zod.string().min(1, { message: 'URL megadása kötelező!' }),
    shortDescription: schemaHelper.editor({ message: 'Leírás megadása kötelező!' }),
    images: schemaHelper.files({ message: 'Képek megadása kötelező!' }),
    featuredImage: zod.any().optional(),
    categoryIds: zod.array(zod.number()).min(1, { message: 'Legalább egy kategória választása kötelező.' }),
    tags: zod.array(zod.string()).optional(),
    seasonality: zod.array(zod.enum(monthValues)).optional(),
    unit: zod.string().min(1, { message: 'Mértékegység választása kötelező.' }),
    producerId: zod.preprocess(
        (value) => (value === '' ? null : value),
        zod.number().nullable().optional()
    ),
    mininumQuantity: zod.number({ coerce: true }).min(0, 'Minimum 0 lehet.').nullable(),
    maximumQuantity: zod.number({ coerce: true }).min(0, 'Minimum 0 lehet.').nullable(),
    stepQuantity: zod.number({ coerce: true }).min(0.1, 'Minimum 0.1 lehet.').nullable(),
    netPrice: zod.number({ coerce: true }).min(0),
    grossPrice: zod.number({ coerce: true }).min(0),
    vat: zod.number({ coerce: true }).min(0).max(100),
    netPriceVIP: zod.number({ coerce: true }).min(0).nullable().optional(),
    netPriceCompany: zod.number({ coerce: true }).min(0).nullable().optional(),
    stock: zod.number({ coerce: true }).nullable(),
    backorder: zod.boolean(),
    featured: zod.boolean(),
    star: zod.boolean(),
    bio: zod.boolean(),
})
    .refine((data) => {
        if (!data.backorder && data.stock !== null) {
            return data.stock >= 0;
        }
        return true;
    }, {
        message: 'Előrendelés nélkül a készlet nem lehet negatív értékű!',
        path: ['stock'],
    });

export type NewProductSchemaType = zod.infer<typeof NewProductSchema>;

// ----------------------------------------------------------------------

export function ProductNewEditForm({ currentProduct }: Readonly<{ currentProduct: IProductItem | null }>) {
    const router = useRouter();

    const { categories, loading: categoriesLoading } = useCategories();
    const { producers } = useProducers();
    const { connection } = useProductCategoryConnection();

    const openDetails = useBoolean(true);
    const openProperties = useBoolean(true);
    const openPricing = useBoolean(true);
    const openFeatured = useBoolean(true);
    const openSeasonality = useBoolean(true);

    const defaultValues = useMemo<NewProductSchemaType>(() => {
        const assignedCategoryIds = currentProduct
            ? connection
                .filter(c => c.productId === currentProduct.id)
                .map(c => c.categoryId)
            : [];

        let tags: string[] = [];
        if (Array.isArray(currentProduct?.tags)) {
            tags = currentProduct.tags;
        } else if (currentProduct?.tags) {
            tags = [currentProduct.tags];
        }

        return {
            name: currentProduct?.name || '',
            url: currentProduct?.url || '',
            sku: currentProduct?.sku || '',
            shortDescription: currentProduct?.shortDescription || '',
            images: currentProduct?.images || [],
            featuredImage: currentProduct?.featuredImage || null,
            categoryIds: assignedCategoryIds,
            tags,
            seasonality: currentProduct?.seasonality || [],
            unit: currentProduct?.unit || '',
            producerId: currentProduct?.producerId ?? null,
            mininumQuantity: currentProduct?.mininumQuantity || 1,
            maximumQuantity: currentProduct?.maximumQuantity || 10,
            stepQuantity: currentProduct?.stepQuantity || 1,
            netPrice: currentProduct?.netPrice || 0,
            grossPrice: currentProduct?.grossPrice || 0,
            vat: currentProduct?.vat || 27,
            netPriceVIP: currentProduct?.netPriceVIP ?? null,
            netPriceCompany: currentProduct?.netPriceCompany ?? null,
            stock: currentProduct?.stock ?? null,
            backorder: currentProduct?.backorder || false,
            featured: currentProduct?.featured || false,
            star: currentProduct?.star || false,
            bio: currentProduct?.bio || false,
        }
    }, [currentProduct, connection]);

    const methods = useForm<NewProductSchemaType>({
        resolver: zodResolver(NewProductSchema),
        values: defaultValues,
    });

    const { reset, watch, setValue, handleSubmit, control, formState: { isSubmitting } } = methods;

    const [isUnlimitedStock, setIsUnlimitedStock] = useState(defaultValues.stock === null);

    useEffect(() => {
        setIsUnlimitedStock(watch('stock') === null);
    }, [watch('stock')]);

    useEffect(() => {
        if (isUnlimitedStock) {
            setValue('stock', null);
        } else if (watch('stock') === null) {
            setValue('stock', 0);
        }
    }, [isUnlimitedStock, setValue, watch]);

    const [netPrice, grossPrice, vat] = watch(['netPrice', 'grossPrice', 'vat']);
    useEffect(() => {
        if (netPrice && vat) {
            const newGross = Math.round(netPrice * (1 + vat / 100));
            if (newGross !== grossPrice) {
                setValue('grossPrice', newGross, { shouldValidate: true });
            }
        }
    }, [netPrice, vat, grossPrice, setValue]);

    const handleGrossPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newGross = Number(e.target.value);
        if (vat) {
            const newNet = Math.round(newGross / (1 + vat / 100));
            setValue('netPrice', newNet, { shouldValidate: true });
        }
    };

    const generateSlug = (name: string) => {
        const hungarianMap: Record<string, string> = { 'á': 'a', 'é': 'e', 'ő': 'o', 'ú': 'u', 'ű': 'u', 'ó': 'o', 'ü': 'u', 'ö': 'o', 'Á': 'A', 'É': 'E', 'Ő': 'O', 'Ú': 'U', 'Ű': 'U', 'Ó': 'O', 'Ü': 'U', 'Ö': 'O' };
        return name.split('').map(char => hungarianMap[char] || char).join('').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    };

    const handleURLGenerate = useCallback(async (e: { target: { value: string } }) => {
        const name = e.target.value;
        const slug = generateSlug(name);
        let suffix = 2;
        let uniqueSlug = slug;
        let exists = false;
        do {
            const { product } = await fetchGetProductBySlug(uniqueSlug);
            exists = !!(product && product.id !== currentProduct?.id);
            if (exists) {
                uniqueSlug = `${slug}-${suffix}`;
                suffix++;
            }
        } while (exists);
        setValue('url', uniqueSlug, { shouldValidate: true });
    }, [currentProduct, setValue]);

    const onSubmit = handleSubmit(async (data) => {
        try {
            let finalFeaturedImageUrl = data.featuredImage;

            if (finalFeaturedImageUrl instanceof File) {
                const response = await uploadFile(finalFeaturedImageUrl, 'products', 0);
                if (!response.url) throw new Error('A kiemelt kép feltöltése sikertelen.');
                finalFeaturedImageUrl = response.url;
            }

            const productData: any = {
                ...data,
                featuredImage: finalFeaturedImageUrl ?? undefined,
                mininumQuantity: data.mininumQuantity ?? undefined,
                maximumQuantity: data.maximumQuantity ?? undefined,
                stepQuantity: data.stepQuantity ?? undefined,
                netPriceVIP: data.netPriceVIP ?? undefined,
                netPriceCompany: data.netPriceCompany ?? undefined,
            };
            delete productData.categoryIds;

            let productId = currentProduct?.id;

            if (currentProduct) {
                await updateProduct(currentProduct.id, productData);
            } else {
                const newProduct = await createProduct(productData);
                productId = newProduct.id;
            }

            if (!productId) {
                throw new Error('A termék azonosítója nem jött létre, a kategóriák nem menthetők.');
            }

            await updateProductCategoryRelations(productId, data.categoryIds);

            reset();
            toast.success(currentProduct ? 'Sikeres frissítés!' : 'Sikeres létrehozás!');
            router.push(paths.dashboard.product.root);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Hiba történt a mentés során.');
        }
    });

    const renderCollapseButton = (value: boolean, onToggle: () => void) => (
        <IconButton onClick={onToggle}>
            <Iconify icon={value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'} />
        </IconButton>
    );

    const renderDetails = () => (
        <Card>
            <CardHeader title="Alapadatok" action={renderCollapseButton(openDetails.value, openDetails.onToggle)} />
            <Collapse in={openDetails.value}>
                <Stack spacing={3} sx={{ p: 3 }}>
                    <RHFTextField name="name" label="Termék név" onBlur={handleURLGenerate} />
                    <RHFTextField name="url" label="Termék URL" disabled />
                    <RHFTextField name="sku" label="SKU (Azonosító)" />
                    <Field.Editor name="shortDescription" />
                    <Field.Upload multiple thumbnail name="images" />
                </Stack>
            </Collapse>
        </Card>
    );

    function renderTagChips(value: string[], getTagProps: any) {
        if (!Array.isArray(value)) return null;
        return value.map((option, index) => (
            <Chip {...getTagProps({ index })} key={option} size="small" label={option} />
        ));
    }

    const renderProperties = () => {
        const categoryOptions = categories.filter(cat => cat.id != null).map(cat => ({ value: cat.id as number, label: cat.name }));

        return (
            <Card>
                <CardHeader title="Tulajdonságok" action={renderCollapseButton(openProperties.value, openProperties.onToggle)} />
                <Collapse in={openProperties.value}>
                    <Stack spacing={3} sx={{ p: 3 }}>
                        <Controller
                            name="categoryIds"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Kategóriák</Typography>
                                    {categoriesLoading ? <CircularProgress size={20} /> : (
                                        <FormGroup sx={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                            {categoryOptions.map((option) => (
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
                                                    label={option.label}
                                                />
                                            ))}
                                        </FormGroup>
                                    )}
                                    {!!error && <FormHelperText error sx={{ ml: 2 }}>{error.message}</FormHelperText>}
                                </Box>
                            )}
                        />

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
                            InputLabelProps={{ shrink: true }}
                        >
                            <MenuItem value="">Nincs</MenuItem>
                            {producers.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                        </RHFTextField>

                        <RHFTextField select name="unit" label="Mértékegység">
                            {UNIT_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                        </RHFTextField>

                        <RHFTextField name="mininumQuantity" label="Kosárba tétel minimuma" type="number" />
                        <RHFTextField name="maximumQuantity" label="Kosárba tétel maximuma" type="number" />
                        <RHFTextField name="stepQuantity" label="Kosárba tétel léptéke" type="number" />
                    </Stack>
                </Collapse>
            </Card>
        )
    };

    const renderPricing = () => (
        <Card>
            <CardHeader title="Árak és Készlet" action={renderCollapseButton(openPricing.value, openPricing.onToggle)} />
            <Collapse in={openPricing.value}>
                <Stack spacing={3} sx={{ p: 3 }}>
                    <RHFTextField name="netPrice" label="Nettó alapár (Ft)" type="number" />
                    <RHFTextField name="vat" label="ÁFA (%)" type="number" />
                    <RHFTextField name="grossPrice" label="Bruttó alapár (Ft)" type="number" onChange={handleGrossPriceChange} />
                    <Divider sx={{ my: 2 }} />
                    <RHFTextField name="netPriceVIP" label="VIP Nettó Ár (Ft)" type="number" />
                    <RHFTextField name="netPriceCompany" label="Céges Nettó Ár (Ft)" type="number" />
                    <Divider sx={{ my: 2 }} />
                    <FormControlLabel control={<Checkbox checked={isUnlimitedStock} onChange={(e) => setIsUnlimitedStock(e.target.checked)} />} label="Korlátlan készlet" />
                    <RHFTextField name="stock" label="Készlet" type="number" disabled={isUnlimitedStock} />
                    <RHFSwitch name="backorder" label="Előrendelhető" />
                </Stack>
            </Collapse>
        </Card>
    );

    const renderFeatured = () => (
        <Card>
            <CardHeader title="Kiemelt termék" action={renderCollapseButton(openFeatured.value, openFeatured.onToggle)} />
            <Collapse in={openFeatured.value}>
                <Stack spacing={3} sx={{ p: 3 }}>
                    <Stack spacing={1.5}>
                        <Typography variant="subtitle2">Kiemelt kép</Typography>
                        <Field.Upload name="featuredImage" thumbnail />
                    </Stack>
                    <Divider />
                    <RHFSwitch name="featured" label="Főoldalon kiemelt termék" />
                    <RHFSwitch name="star" label="Szezonális sztár termék" />
                    <RHFSwitch name="bio" label="Bio termék" />
                </Stack>
            </Collapse>
        </Card>
    );



    const renderSeasonality = () => (
        <Card>
            <CardHeader title="Szezonalitás" action={renderCollapseButton(openSeasonality.value, openSeasonality.onToggle)} />
            <Collapse in={openSeasonality.value}>
                <Stack spacing={3} sx={{ p: 3 }}>
                    <Controller
                        name="seasonality"
                        control={control}
                        render={({ field }) => <SeasonalityCheckboxGroup field={field} />}
                    />
                </Stack>
            </Collapse>
        </Card>
    );

    return (
        <Form methods={methods} onSubmit={onSubmit}>
            <Box
                sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateColumns: { xs: '1fr', lg: '8fr 4fr' },
                }}
            >
                <Stack spacing={3}>
                    {renderDetails()}
                    {renderProperties()}
                </Stack>
                <Stack spacing={3}>
                    {renderSeasonality()}
                    {renderPricing()}
                    {renderFeatured()}
                    <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
                        {currentProduct ? 'Változtatások mentése' : 'Termék létrehozása'}
                    </Button>
                </Stack>
            </Box>
        </Form>
    );
}


function handleSeasonalityChange(field: any, optionValue: MonthKeys) {
    const currentValue = field.value || [];
    const newValues = currentValue.includes(optionValue)
        ? currentValue.filter((v: MonthKeys) => v !== optionValue)
        : [...currentValue, optionValue];
    field.onChange(newValues);
}

function SeasonalityCheckboxGroup({ field }: Readonly<{ field: any }>) {
    return (
        <FormGroup>
            {MONTH_OPTIONS.map((option) => (
                <FormControlLabel
                    key={option.value}
                    control={
                        <Checkbox
                            checked={(field.value || []).includes(option.value)}
                            onChange={() => handleSeasonalityChange(field, option.value)}
                        />
                    }
                    label={option.label}
                />
            ))}
        </FormGroup>
    );
}