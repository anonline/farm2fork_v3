'use client';

import type { SubmitHandler } from 'react-hook-form';
import type { IArticleItem } from 'src/types/article';

import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, FormProvider } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import {
    Switch,
    Checkbox,
    FormGroup,
    FormLabel,
    Typography,
    FormControl,
    FormControlLabel,
} from '@mui/material';

import { resizeImage } from 'src/utils/image-resize';

import { useArticles } from 'src/contexts/articles-context';
import { uploadFile, deleteFile } from 'src/lib/blob/blobClient';

import { Field } from 'src/components/hook-form';

const PostSchema = zod.object({
    title: zod.string().min(3, { message: 'A címnek legalább 3 karakter hosszúnak kell lennie!' }),
    year: zod.string().length(4, { message: 'Az évszámnak pontosan 4 karakterből kell állnia!' }),
    medium: zod.string().min(1, { message: 'A médium megadása kötelező!' }),
    link: zod.string().url().or(zod.literal('')),
    image: zod.any().optional(),
    publish_date: zod.string().min(1, { message: 'A dátum megadása kötelező!' }),
    publish: zod.boolean(),
    categoryIds: zod
        .array(zod.number())
        .min(1, { message: 'Legalább egy kategória kiválasztása kötelező' }),
});

type NewPostFormData = zod.infer<typeof PostSchema>;

interface NewPostFormProps {
    onSave: (data: any, categoryIds: number[]) => void;
    onCancel: () => void;
    currentPost?: IArticleItem;
}

export default function NewPostForm({ onSave, onCancel, currentPost }: Readonly<NewPostFormProps>) {
    const { categories } = useArticles();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCategoryChange = (
        field: { value: number[]; onChange: (value: number[]) => void },
        categoryId: number,
        checked: boolean
    ) => {
        const selectedIds = field.value;
        if (checked) {
            field.onChange([...selectedIds, categoryId]);
        } else {
            field.onChange(selectedIds.filter((id) => id !== categoryId));
        }
    };

    const defaultValues = useMemo(
        () => ({
            title: currentPost?.title || '',
            year: currentPost?.year || new Date().getFullYear().toString(),
            medium: currentPost?.medium || '',
            link: currentPost?.link || '',
            image: currentPost?.image || '',
            publish_date: currentPost
                ? new Date(currentPost.publish_date).toISOString().slice(0, 10)
                : new Date().toISOString().slice(0, 10),
            publish: currentPost ? currentPost.publish === 'published' : false,
            categoryIds: currentPost?.categoryIds || [],
        }),
        [currentPost]
    );

    const methods = useForm<NewPostFormData>({
        resolver: zodResolver(PostSchema),
        defaultValues,
    });

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = methods;

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const processForm: SubmitHandler<NewPostFormData> = async (data) => {
        setIsSubmitting(true);
        try {
            let finalImageUrl = data.image;

            // Handle image upload if a new file was selected
            if (finalImageUrl instanceof File) {
                console.info('Resizing and uploading article image...');

                // Resize image to 640x480px max to save storage and bandwidth
                const resizedImage = await resizeImage(finalImageUrl, 640, 480, 0.85);

                // Upload resized image
                const response = await uploadFile(resizedImage, 'articles', 0);
                if (!response.url) throw new Error('A kép feltöltése sikertelen.');
                finalImageUrl = response.url;

                // Delete old image if it exists and was replaced
                if (currentPost?.image && currentPost.image !== finalImageUrl) {
                    try {
                        console.info('Deleting old article image:', currentPost.image);
                        await deleteFile(currentPost.image);
                    } catch (deleteError) {
                        // Log the error but don't block the save operation
                        toast.warning('Régi kép törlése sikertelen, de a mentés folytatódik.');
                        console.error('Failed to delete old image, continuing with save:', deleteError);
                    }
                }
            }

            const { categoryIds, ...articleData } = data;
            const dataToSave = {
                ...articleData,
                image: finalImageUrl || '',
                publish: data.publish ? 'published' : 'draft',
            };

            onSave(dataToSave, categoryIds);
        } catch (error: any) {
            console.error('Error processing form:', error);
            setIsSubmitting(false);
            throw error;
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(processForm)}>
                <DialogTitle>{currentPost ? 'Hír szerkesztése' : 'Új hír létrehozása'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1.5 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Stack spacing={2}>
                                <TextField
                                    {...register('title')}
                                    label="Cím"
                                    fullWidth
                                    autoFocus
                                    error={!!errors.title}
                                    helperText={errors.title?.message}
                                    disabled={isSubmitting}
                                />

                                <TextField
                                    {...register('year')}
                                    label="Év"
                                    fullWidth
                                    error={!!errors.year}
                                    helperText={errors.year?.message}
                                    disabled={isSubmitting}
                                />

                                <TextField
                                    {...register('medium')}
                                    label="Médium"
                                    fullWidth
                                    error={!!errors.medium}
                                    helperText={errors.medium?.message}
                                    disabled={isSubmitting}
                                />

                                <FormControl
                                    component="fieldset"
                                    variant="standard"
                                    error={!!errors.categoryIds}
                                    fullWidth
                                    disabled={isSubmitting}
                                >
                                    <FormLabel component="legend">Kategóriák</FormLabel>
                                    <FormGroup>
                                        <Controller
                                            name="categoryIds"
                                            control={control}
                                            render={({ field }) => (
                                                <>
                                                    {categories.map((category) => (
                                                        <FormControlLabel
                                                            key={category.id}
                                                            control={
                                                                <Checkbox
                                                                    checked={field.value.includes(category.id)}
                                                                    onChange={(e) =>
                                                                        handleCategoryChange(
                                                                            field,
                                                                            category.id,
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                    disabled={isSubmitting}
                                                                />
                                                            }
                                                            label={category.title}
                                                        />
                                                    ))}
                                                </>
                                            )}
                                        />
                                    </FormGroup>
                                    {errors.categoryIds && (
                                        <Typography color="error" variant="caption">
                                            {errors.categoryIds.message}
                                        </Typography>
                                    )}
                                </FormControl>
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Stack spacing={2}>
                                    <TextField
                                        {...register('link')}
                                        label="Link"
                                        fullWidth
                                        error={!!errors.link}
                                        helperText={errors.link?.message}
                                        disabled={isSubmitting}
                                    />

                                    <TextField
                                        {...register('publish_date')}
                                        label="Közzététel dátuma"
                                        type="date"
                                        slotProps={{
                                            inputLabel: { shrink: true }
                                        }}
                                        error={!!errors.publish_date}
                                        helperText={errors.publish_date?.message}
                                        fullWidth
                                        disabled={isSubmitting}
                                    />

                                    <FormControlLabel
                                        label="Közzétett"
                                        sx={{ pl: 1 }}
                                        control={
                                            <Controller
                                                name="publish"
                                                control={control}
                                                render={({ field }) => (
                                                    <Switch
                                                        {...field}
                                                        checked={field.value}
                                                        disabled={isSubmitting}
                                                    />
                                                )}
                                            />
                                        }
                                    />
                                </Stack>

                                <Field.Upload
                                    name="image"
                                    thumbnail
                                    placeholder="Hír képe (max 800x800px, automatikusan átméretezve)"
                                    disabled={isSubmitting}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={onCancel}
                        variant="outlined"
                        color="inherit"
                        disabled={isSubmitting}
                    >
                        Mégse
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isSubmitting ? 'Mentés...' : 'Mentés'}
                    </Button>
                </DialogActions>
            </form>
        </FormProvider>
    );
}
