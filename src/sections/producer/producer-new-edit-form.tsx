'use client';

import type { IProducerItem } from 'src/types/producer';

import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useEffect, useCallback } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import {
    Box,
    Card,
    Stack,
    Checkbox,
    TextField,
    Typography,
    CardHeader,
    Autocomplete,
} from '@mui/material';

import { useGetProducts } from 'src/actions/product';
import { uploadFile } from 'src/lib/blob/blobClient';
import BioBadge from 'src/components/bio-badge/bio-badge';
import {
    createProducer,
    updateProducer,
    fetchGetProducerBySlug,
    updateProductAssignments,
} from 'src/actions/producer';

import { toast } from 'src/components/snackbar';
import { RHFSwitch, RHFEditor, RHFUpload, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

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
    productIds: zod.array(zod.number()).optional(),
});

type ProducerSchemaType = zod.infer<typeof ProducerSchema>;

type Props = {
    currentProducer?: IProducerItem;
};

export default function ProducerNewEditForm({ currentProducer }: Readonly<Props>) {
    const { products, productsLoading } = useGetProducts();

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
                                    InputProps={{ readOnly: true }}
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
