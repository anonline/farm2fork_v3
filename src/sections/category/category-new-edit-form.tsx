import type { ICategoryItem } from 'src/types/category';

import { z as zod } from 'zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import { Grid, MenuItem } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { insertCategory, updateCategory } from 'src/actions/category';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';


// ----------------------------------------------------------------------

export type NewProductCategorySchemaType = zod.infer<typeof NewProductCategorySchema>;

export const NewProductCategorySchema = zod.object({
    id: zod.number().optional(),
    name: zod.string().min(1, { message: 'Név megadása kötelező!' }),
    images: zod.union([zod.string(), zod.instanceof(File)]).optional(),
    description: zod.string().optional(),
    enabled: zod.boolean().default(true),
    // Not required
    parentId: zod.number().optional(),
    showHome: zod.boolean().default(true),
    usageInformation: zod.string().optional(),
    storingInformation: zod.string().optional(),
    slug: zod.string().optional(),
    showProductPage: zod.boolean().default(true),
});

// ----------------------------------------------------------------------

type Props = {
    currentCategory?: ICategoryItem;
    maxFileSize?: number;
    allCategories?: ICategoryItem[];
};

export function CategoryNewEditForm({
    currentCategory,
    maxFileSize,
    allCategories,
}: Readonly<Props>) {
    
    const openDetails = useBoolean(true);
    const openProperties = useBoolean(true);

    const defaultValues: NewProductCategorySchemaType = {
        name: currentCategory?.name || '',
        parentId: currentCategory?.parentId ?? undefined,
        images: currentCategory?.coverUrl || undefined,
        description: currentCategory?.description || '',
        enabled: currentCategory?.enabled ?? true,
        id: currentCategory?.id ?? undefined,
        showHome: currentCategory?.showHome ?? true,
        usageInformation: currentCategory?.usageInformation || '',
        storingInformation: currentCategory?.storingInformation || '',
        slug: currentCategory?.slug || '',
        showProductPage: currentCategory?.showProductPage ?? true,
    };

    const methods = useForm<NewProductCategorySchemaType>({
        resolver: zodResolver(NewProductCategorySchema),
        defaultValues,
        values: currentCategory
            ? {
                name: currentCategory.name,
                parentId: currentCategory.parentId ?? undefined,
                images: currentCategory.coverUrl || undefined,
                description: currentCategory.description ?? '',
                enabled: currentCategory.enabled ?? true,
                id: currentCategory.id ?? undefined,
                showHome: currentCategory.showHome ?? true,
                usageInformation: currentCategory.usageInformation || '',
                storingInformation: currentCategory.storingInformation || '',
                slug: currentCategory.slug || '',
                showProductPage: currentCategory.showProductPage ?? true,
            }
            : undefined,
    });

    const {
        reset,
        watch,
        setValue,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const values = watch();

    const doSave = async (data: Partial<ICategoryItem>) => {
        if (data.id) {
            return await updateCategory(data);
        }
        return await insertCategory(data);
    };

    const onSubmit = handleSubmit(async (data) => {
        console.log(data.images);

        if (data.images instanceof File) {
            const uploadedImageUrl = await handleUpload(data.images as File);
            data.images = uploadedImageUrl;
        }

        const updatedData: Partial<ICategoryItem> = {
            id: currentCategory?.id || undefined,
            name: data.name,
            slug: data.name.toLowerCase().replace(/\s+/g, '-'),
            description: data.description || '',
            coverUrl: data.images ?? '',
            parentId: data.parentId || null,
            enabled: data.enabled || true,
            showHome: data.showHome || false,
            usageInformation: data.usageInformation || '',
            storingInformation: data.storingInformation || '',
            showProductPage: data.showProductPage || false,
        };

        try {
            await doSave(updatedData);

            await new Promise((resolve) => setTimeout(resolve, 500));
            //reset();
            toast.success(currentCategory ? 'Frissítés sikeres!' : 'Létrehozás sikeres!');
            //router.push(paths.dashboard.product.categories.root);
        } catch (error) {
            console.error(error);
        }
    });

    const handleUpload = async (file: File): Promise<string> => {
        const response = await fetch('/api/img/upload?folder=category&filename=' + file.name, {
            method: 'POST',
            body: file,
        });

        if (!response.ok) {
            throw new Error('Feltöltési hiba');
        }
        const data = await response.json();
        return data.url;
    };

    const handleRemoveFile = useCallback(() => {
        setValue('images', undefined, { shouldValidate: true, shouldDirty: true });
    }, [setValue]);

    const handleRemoveAllFiles = useCallback(() => {
        setValue('images', undefined, { shouldValidate: true });
    }, [setValue]);

    const renderCollapseButton = (value: boolean, onToggle: () => void) => (
        <IconButton onClick={onToggle}>
            <Iconify icon={value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'} />
        </IconButton>
    );

    const renderDetails = () => (
        <Card>
            <CardHeader
                title="Adatok"
                subheader="Cím, rövid leírás, kép..."
                action={renderCollapseButton(openDetails.value, openDetails.onToggle)}
                sx={{ mb: 3 }}
            />

            <Collapse in={openDetails.value}>
                <Divider />

                <Stack spacing={3} sx={{ p: 3 }}>
                    <Field.Text name="name" label="Kategória neve" />

                    <Field.Text name="slug" label="URL" variant='filled' disabled/>

                    <Stack spacing={1.5}>
                        <Typography variant="subtitle2">Leírás</Typography>
                        <Field.Editor
                            name="description"
                            sx={{ maxHeight: 480 }}
                            placeholder="Írd be a leírást..."
                        />
                    </Stack>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Field.Text
                                name="usageInformation"
                                label="Használati információ"
                                placeholder="Írd be a használati információt..."
                                multiline
                                minRows={2}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Field.Text
                                name="storingInformation"
                                label="Tárolási információ"
                                placeholder="Írd be a tárolási információt..."
                                multiline
                                minRows={2}
                            />
                        </Grid>
                    </Grid>

                    <Stack spacing={1.5}>
                        <Typography variant="subtitle2">Képek (max. {maxFileSize} MB)</Typography>
                        <Field.Upload
                            thumbnail
                            name="images"
                            maxSize={(maxFileSize ?? 5) * 1024 * 1024} // Convert MB to bytes
                            onRemove={handleRemoveFile}
                            onRemoveAll={handleRemoveAllFiles}
                        />
                    </Stack>
                </Stack>
            </Collapse>
        </Card>
    );

    const renderProperties = () => (
        <Card>
            <CardHeader
                title="Tulajdonságok"
                subheader="További funkciók és attribútumok..."
                action={renderCollapseButton(openProperties.value, openProperties.onToggle)}
                sx={{ mb: 3 }}
            />

            <Collapse in={openProperties.value}>
                <Divider />

                <Stack spacing={3} sx={{ p: 3 }}>
                    <Field.Select
                        name="parentId"
                        label="Szülő kategória"
                        fullWidth
                        value={values.parentId ?? ''}
                    >
                        {allCategories?.map(
                            (category) =>
                                category.id !== currentCategory?.id && (
                                    <MenuItem key={category.id ?? ''} value={category.id ?? ''}>
                                        {category.name}
                                    </MenuItem>
                                )
                        )}
                    </Field.Select>

                    <Field.Switch
                        name="enabled"
                        label="Aktív"
                        defaultChecked={values.enabled}
                        value={values.enabled}
                    />

                    <Field.Switch
                        name="showHome"
                        label="Főoldalon való megjelenítés"
                        defaultChecked={values.showHome}
                        value={values.showHome}
                    />

                    <Field.Switch
                        name="showProductPage"
                        label="Termékoldalon való megjelenítés"
                        defaultChecked={values.showProductPage}
                        value={values.showProductPage}
                    />
                </Stack>
            </Collapse>
        </Card>
    );

    const renderActions = () => (
        <Box
            sx={{
                gap: 3,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'flex-end',
                width: '100%',
            }}
        >
            <Button type="submit" variant="contained" size="medium" loading={isSubmitting}>
                {!currentCategory ? 'Új kategória' : 'Változások mentése'}
            </Button>
        </Box>
    );

    return (
        <Form methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    {renderDetails()}
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
                        {renderProperties()}
                        {renderActions()}
                    </Stack>
                </Grid>
            </Grid>

        </Form>
    );
}
