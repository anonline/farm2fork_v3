'use client';

import type { Locale } from 'src/types/database.types';
import type { IProducerItem } from 'src/types/producer';

import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { Translate as TranslateIcon } from '@mui/icons-material';
import {
    Box,
    Tab,
    Card,
    Tabs,
    Stack,
    Checkbox,
    TextField,
    Typography,
    CardHeader,
    Autocomplete,
} from '@mui/material';

import { useGetProducts } from 'src/actions/product';
import { uploadFile } from 'src/lib/blob/blobClient';
import {
    saveTranslationsBatch,
} from 'src/actions/translations';
import {
    createProducer,
    updateProducer,
    fetchGetProducerBySlug,
    updateProductAssignments,
} from 'src/actions/producer';

import { toast } from 'src/components/snackbar';
import BioBadge from 'src/components/bio-badge/bio-badge';
import { RHFSwitch, RHFEditor, RHFUpload, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const SUPPORTED_LOCALES: Locale[] = ['en', 'de'];
const TRANSLATABLE_FIELDS = ['name', 'shortDescription', 'producingTags'];

const ProducerSchema = zod.object({
    name: zod.string().min(1, { message: 'Név megadása kötelező!' }),
    slug: zod.string().min(1, { message: 'URL (slug) megadása kötelező!' }),
    companyName: zod.string().optional(),
    location: zod.string().optional(),
    bio: zod.boolean(),
    shortDescription: zod.string().optional(),
    producingTags: zod.string().optional(),
    featuredImage: zod
        .union([zod.string(), zod.instanceof(File)])
        .nullable()
        .optional(),
    productIds: zod.array(zod.string()).optional(),
    enabled: zod.boolean(),
    translations: zod.any().optional(),
});

type ProducerSchemaType = zod.infer<typeof ProducerSchema>;

type Props = {
    currentProducer?: IProducerItem;
};

export default function ProducerNewEditForm({ currentProducer }: Readonly<Props>) {
    const { products, productsLoading } = useGetProducts();
    
    // Translation state
    const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
    const [currentTab, setCurrentTab] = useState(0);

    const defaultValues = useMemo(() => {
        const assignedProductIds = currentProducer
            ? products.filter((p) => p.producerId === currentProducer.id).map((p) => p.id)
            : [];

        return {
            name: currentProducer?.name || '',
            slug: currentProducer?.slug || '',
            companyName: currentProducer?.companyName || '',
            location: currentProducer?.location || '',
            bio: currentProducer?.bio || false,
            shortDescription: currentProducer?.shortDescription || '',
            producingTags: currentProducer?.producingTags || '',
            featuredImage: currentProducer?.featuredImage || null,
            productIds: assignedProductIds,
            enabled: currentProducer?.enabled || false,
        };
    }, [currentProducer, products]);

    const methods = useForm<ProducerSchemaType>({
        resolver: zodResolver(ProducerSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        setValue,
        control,
        formState: { isSubmitting },
    } = methods;

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const updateTranslation = (fieldName: string, locale: string, value: string) => {
        const updatedTranslations = {
            ...translations,
            [fieldName]: {
                ...translations[fieldName],
                [locale]: value,
            },
        };
        setTranslations(updatedTranslations);
        setValue('translations', updatedTranslations);
    };

    const generateSlug = (name: string) => {
        const hungarianMap: Record<string, string> = {
            á: 'a',
            é: 'e',
            ő: 'o',
            ú: 'u',
            ű: 'u',
            ó: 'o',
            ü: 'u',
            ö: 'o',
            Á: 'A',
            É: 'E',
            Ő: 'O',
            Ú: 'U',
            Ű: 'U',
            Ó: 'O',
            Ü: 'U',
            Ö: 'O',
        };
        return name
            .split('')
            .map((char: string) => hungarianMap[char] || char)
            .join('')
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase();
    };

    const handleURLGenerate = useCallback(
        async (e: { target: { value: string } }) => {
            const name = e.target.value.toString();
            if (!name) return;
            const slug = generateSlug(name);

            let suffix = 2;
            let uniqueSlug = slug;
            let exists = false;

            do {
                const { producer } = await fetchGetProducerBySlug(uniqueSlug);
                exists = !!(producer && producer.id !== currentProducer?.id);
                if (exists) {
                    uniqueSlug = `${slug}-${suffix}`;
                    suffix++;
                }
            } while (exists);

            setValue('slug', uniqueSlug, { shouldValidate: true });
        },
        [currentProducer?.id, setValue]
    );

    const onSubmit = handleSubmit(async (data) => {
        try {
            let finalImageUrl = data.featuredImage;
            if (finalImageUrl instanceof File) {
                const response = await uploadFile(finalImageUrl, 'producers', 0);
                if (!response.url) {
                    throw new Error('A képfeltöltés nem adott vissza URL-t.');
                }
                finalImageUrl = response.url;
                toast.success('Kép sikeresen feltöltve!');
            }

            const plainShortDescription = data.shortDescription
                ? data.shortDescription.replace(/<.*?>/g, '')
                : null;

            const producerData: Partial<IProducerItem> = {
                name: data.name,
                slug: data.slug,
                companyName: data.companyName || undefined,
                location: data.location || undefined,
                bio: data.bio,
                shortDescription: plainShortDescription || undefined,
                producingTags: data.producingTags || undefined,
                enabled: data.enabled || false,
                featuredImage: typeof finalImageUrl === 'string' ? finalImageUrl : undefined,
            };

            let producerId = currentProducer?.id;

            if (currentProducer) {
                await updateProducer(currentProducer.id, producerData);
                toast.success('Termelő adatai sikeresen mentve!');
            } else {
                const newProducer = await createProducer(producerData);
                producerId = newProducer.id;
                toast.success('Termelő sikeresen létrehozva!');
            }

            if (!producerId) {
                throw new Error('A termelő azonosítója nem található a mentés után.');
            }

            await updateProductAssignments(producerId, data.productIds || []);
            toast.success('Termék-hozzárendelések frissítve!');

            // Save translations if any exist
            if (Object.keys(translations).length > 0) {
                // Validate that we have a proper ID
                if (!producerId || producerId === 'undefined') {
                    console.error('Invalid producer ID for translations:', producerId);
                    toast.error('Hiba: Érvénytelen termelő azonosító a fordításokhoz');
                    return;
                }
                
                const translationsToSave: any[] = [];
                
                Object.entries(translations).forEach(([fieldName, locales]) => {
                    Object.entries(locales).forEach(([locale, value]) => {
                        if (value?.trim()) {
                            translationsToSave.push({
                                table_name: 'Producers',
                                record_id: String(producerId), // Convert to string
                                field_name: fieldName === 'shortDescription' ? 'short_description' : fieldName,
                                locale: locale as Locale,
                                value: value.trim(),
                            });
                        }
                    });
                });

                if (translationsToSave.length > 0) {
                    try {
                        await saveTranslationsBatch(translationsToSave);
                        toast.success('Fordítások sikeresen mentve!');
                    } catch (translationError: any) {
                        console.error('Translation save error:', translationError);
                        const errorMessage = translationError.message || 'Ismeretlen hiba';
                        
                        if (errorMessage.includes('invalid input syntax for type uuid')) {
                            toast.error('Fordítások mentése sikertelen: Az adatbázis migrációt kell futtatni a UUID hiba miatt. Lásd: database/migrations/004_fix_translations_record_id.sql');
                        } else if (errorMessage.includes('row-level security policy')) {
                            toast.error('Fordítások mentése sikertelen: Jogosultsági hiba. Az adatbázis migrációt kell futtatni. Lásd: database/migrations/004_fix_translations_record_id.sql');
                        } else {
                            toast.error(`Fordítások mentése sikertelen: ${errorMessage}`);
                        }
                        // Don't throw here, let the main producer save succeed
                    }
                }
            }
        } catch (error: any) {
            console.error('Hiba a beküldés során:', error);
            toast.error(error.message || 'Hiba történt a mentés során.');
        }
    });

    return (
        <FormProvider {...methods}>
            <form onSubmit={onSubmit}>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '8fr 4fr' }} gap={3}>
                    {/* Bal oldali oszlop */}
                    <Stack spacing={3}>
                        <Card>
                            <CardHeader title="Termelő adatai" />
                            <Stack spacing={3} sx={{ p: 3 }}>
                                <RHFTextField
                                    name="name"
                                    label="Termelő neve"
                                    onBlur={handleURLGenerate}
                                />
                                <RHFTextField
                                    name="slug"
                                    label="URL (slug)"
                                    variant="filled"
                                    slotProps={{ input: { readOnly: true } }}
                                />
                                <RHFTextField name="companyName" label="Cég neve" />
                                <RHFTextField name="location" label="Termelő helye" />
                            </Stack>
                        </Card>

                        <Card>
                            <CardHeader title="Bemutatkozás és Tartalom" />
                            <Stack spacing={3} sx={{ p: 3 }}>
                                <Typography variant="subtitle2">Rövid leírás</Typography>
                                <RHFEditor name="shortDescription" />
                                <RHFTextField
                                    name="producingTags"
                                    label="Mit termel? (címkék vesszővel elválasztva)"
                                />
                            </Stack>
                        </Card>

                        <Card>
                            <CardHeader 
                                title="Fordítások" 
                                action={<TranslateIcon color="action" />}
                            />
                            <Stack spacing={3} sx={{ p: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Itt fordíthatod le a termelő adatait angol és német nyelvre.
                                </Typography>
                                
                                <Tabs
                                    value={currentTab}
                                    onChange={(event, newValue) => setCurrentTab(newValue)}
                                    variant="fullWidth"
                                >
                                    <Tab label="Angol (EN)" />
                                    <Tab label="Német (DE)" />
                                </Tabs>

                                {SUPPORTED_LOCALES.map((locale, index) => (
                                    currentTab === index && (
                                        <Stack spacing={3} key={locale}>
                                            <Typography variant="subtitle2" color="primary">
                                                {locale === 'en' ? 'Angol fordítás' : 'Német fordítás'}
                                            </Typography>
                                            
                                            {TRANSLATABLE_FIELDS.map((field) => {
                                                const getFieldLabel = (fieldName: string) => {
                                                    switch (fieldName) {
                                                        case 'name': return 'Termelő neve';
                                                        case 'shortDescription': return 'Rövid leírás';
                                                        case 'producingTags': return 'Mit termel?';
                                                        default: return fieldName;
                                                    }
                                                };

                                                const isTextarea = field === 'shortDescription';

                                                return (
                                                    <TextField
                                                        key={`${field}-${locale}`}
                                                        label={`${getFieldLabel(field)} (${locale.toUpperCase()})`}
                                                        multiline={isTextarea}
                                                        rows={isTextarea ? 4 : 1}
                                                        value={translations[field]?.[locale] || ''}
                                                        onChange={(e) => updateTranslation(field, locale, e.target.value)}
                                                        variant="outlined"
                                                        fullWidth
                                                        placeholder={`${getFieldLabel(field)} ${locale === 'en' ? 'angolul' : 'németül'}`}
                                                    />
                                                );
                                            })}
                                        </Stack>
                                    )
                                ))}
                            </Stack>
                        </Card>

                        <Card>
                            <CardHeader title="Hozzárendelt termékek" />
                            <Stack spacing={3} sx={{ p: 3 }}>
                                <Controller
                                    name="productIds"
                                    control={control}
                                    render={({ field }) => (
                                        <Autocomplete
                                            {...field}
                                            multiple
                                            disableCloseOnSelect
                                            loading={productsLoading}
                                            options={products.map((p) => p.id)}
                                            getOptionLabel={(id) =>
                                                products.find((p) => p.id === id)?.name ??
                                                String(id)
                                            }
                                            isOptionEqualToValue={(option, value) =>
                                                option === value
                                            }
                                            onChange={(event, newValue) => field.onChange(newValue)}
                                            renderOption={(props, optionId, { selected }) => {
                                                const product = products.find(
                                                    (p) => p.id === optionId
                                                );
                                                if (!product) return null;
                                                return (
                                                    <li {...props} key={product.id}>
                                                        <Checkbox key={`checkbox-${product.id}`} checked={selected} />
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                                            {product.name}
                                                            {product.bio && (
                                                                <BioBadge style={{ marginLeft: 4 }} width={30} height={20} />
                                                            )}
                                                        </Box>
                                                    </li>
                                                );
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Termékek"
                                                    placeholder="Válassz termékeket"
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Stack>
                        </Card>
                    </Stack>

                    {/* Jobb oldali oszlop */}
                    <Stack spacing={3}>
                        <Card>
                            <CardHeader title="Beállítások" />
                            <Stack spacing={3} sx={{ p: 3 }}>
                                <RHFSwitch name="enabled" label="Engedélyezett" />
                                <RHFSwitch name="bio" label="BIO termelő" />
                            </Stack>
                        </Card>

                        <Card>
                            <CardHeader title="Képek" />
                            <Stack spacing={3} sx={{ p: 3 }}>
                                <RHFUpload
                                    name="featuredImage"
                                    onDelete={() =>
                                        setValue('featuredImage', null, { shouldValidate: true })
                                    }
                                />
                                <Typography color="text.secondary" variant="caption">
                                    Tölts fel egy borítóképet a termelőhöz.
                                </Typography>
                            </Stack>
                        </Card>

                        <Stack alignItems="flex-end">
                            <LoadingButton
                                type="submit"
                                variant="contained"
                                size="large"
                                loading={isSubmitting}
                            >
                                {currentProducer ? 'Változtatások mentése' : 'Termelő létrehozása'}
                            </LoadingButton>
                        </Stack>
                    </Stack>
                </Box>
            </form>
        </FormProvider>
    );
}
