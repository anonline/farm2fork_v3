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

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useGetProducts } from 'src/actions/product';
import { uploadFile, deleteFile } from 'src/lib/blob/blobClient';
import { resizeImage } from 'src/utils/image-resize';
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
    coverImage: zod
        .union([zod.string(), zod.instanceof(File)])
        .nullable()
        .optional(),
    productIds: zod.array(zod.union([zod.string(), zod.number()])).optional(),
    enabled: zod.boolean(),
});

type ProducerSchemaType = zod.infer<typeof ProducerSchema>;

type Props = {
    currentProducer?: IProducerItem;
};

export default function ProducerNewEditForm({ currentProducer }: Readonly<Props>) {
    const router = useRouter();
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
            coverImage: currentProducer?.coverImage || null,
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
        formState: { isSubmitting, errors },
    } = methods;

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log('Current form errors:', errors);
        }
    }, [errors]);

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

    const onSubmit = handleSubmit(
        async (data) => {
            console.log('Form submitted with data:', data);

            try {
                let finalImageUrl = data.featuredImage;
                let coverImageUrl = data.coverImage;
                
                // Handle featured image upload with resizing
                if (finalImageUrl instanceof File) {
                    console.info('Resizing and uploading featured image...');
                    // Resize featured image to 800x800px max to save storage and bandwidth
                    const resizedImage = await resizeImage(finalImageUrl, 800, 800);
                    
                    const response = await uploadFile(resizedImage, 'producers', 0);
                    if (!response.url) {
                        throw new Error('A képfeltöltés nem adott vissza URL-t.');
                    }
                    finalImageUrl = response.url;
                    toast.success('Kép sikeresen feltöltve!');

                    // Delete old featured image if it exists and was replaced
                    if (currentProducer?.featuredImage && currentProducer.featuredImage !== finalImageUrl) {
                        try {
                            console.info('Deleting old featured image:', currentProducer.featuredImage);
                            await deleteFile(currentProducer.featuredImage);
                        } catch (deleteError) {
                            // Log the error but don't block the save operation
                            toast.warning('Régi kép törlése sikertelen, de a mentés folytatódik.');
                            console.error('Failed to delete old featured image, continuing with save:', deleteError);
                        }
                    }
                }

                // Handle cover image upload with resizing
                if (coverImageUrl instanceof File) {
                    console.info('Resizing and uploading cover image...');
                    // Resize cover image to 800x600px max to save storage and bandwidth
                    const resizedCoverImage = await resizeImage(coverImageUrl, 800, 600);
                    
                    const response = await uploadFile(resizedCoverImage, 'producers', 0);
                    if (!response.url) {
                        throw new Error('A borítókép feltöltése nem adott vissza URL-t.');
                    }
                    coverImageUrl = response.url;
                    toast.success('Borítókép sikeresen feltöltve!');

                    // Delete old cover image if it exists and was replaced
                    if (currentProducer?.coverImage && currentProducer.coverImage !== coverImageUrl) {
                        try {
                            console.info('Deleting old cover image:', currentProducer.coverImage);
                            await deleteFile(currentProducer.coverImage);
                        } catch (deleteError) {
                            // Log the error but don't block the save operation
                            toast.warning('Régi borítókép törlése sikertelen, de a mentés folytatódik.');
                            console.error('Failed to delete old cover image, continuing with save:', deleteError);
                        }
                    }
                }

            const plainShortDescription = data.shortDescription
                ? data.shortDescription.replace(/<.*?>/g, '')
                : null;

            const producerData: Partial<IProducerItem> = {
                name: data.name,
                slug: data.slug,
                coverImage: typeof coverImageUrl === 'string' ? coverImageUrl : undefined,
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

            await updateProductAssignments(producerId, data.productIds?.map(id => id.toString()) || []);
            toast.success('Termék-hozzárendelések frissítve!');
            
            // If creating a new producer, redirect to edit page
            if (currentProducer) {
                toast.success('Minden adat sikeresen frissítve!');
                //router.refresh();

            } else {
                router.push(paths.dashboard.producer.edit(data.slug));
            }
        } catch (error: any) {
            console.error('Hiba a beküldés során:', error);
            toast.error(error.message || 'Hiba történt a mentés során.');
        }
    },
    (errors) => {
        console.error('Form validation errors:', errors);
        toast.error('Kérlek töltsd ki a kötelező mezőket!');
    }
);

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
                                    Tölts fel egy kiemelt képet a termelőhöz.
                                </Typography>

                                <RHFUpload
                                    name="coverImage"
                                    onDelete={() =>
                                        setValue('coverImage', null, { shouldValidate: true })
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
