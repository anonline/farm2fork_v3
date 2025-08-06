"use client";

import type { SubmitHandler } from 'react-hook-form';
import type { IArticleItem } from 'src/types/article';

import { z as zod } from 'zod';
import { useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Select, Switch, MenuItem, InputLabel, Typography, FormControl, FormControlLabel } from '@mui/material';

import { useArticles } from 'src/contexts/articles-context';

const PostSchema = zod.object({
    title: zod.string().min(3, { message: 'A címnek legalább 3 karakter hosszúnak kell lennie!' }),
    year: zod.string().length(4, { message: 'Az évszámnak pontosan 4 karakterből kell állnia!' }),
    medium: zod.string().min(1, { message: 'A médium megadása kötelező!' }),
    link: zod.string().url({ message: 'Érvénytelen URL formátum!' }).or(zod.literal('')),
    image: zod.string().url({ message: 'Érvénytelen kép URL formátum!' }).or(zod.literal('')),
    publish_date: zod.string().min(1, { message: 'A dátum megadása kötelező!' }),
    publish: zod.boolean(),
    categoryId: zod.number({ invalid_type_error: "Kategória kiválasztása kötelező" }).min(1, "Kategória kiválasztása kötelező"),
});

type NewPostFormData = zod.infer<typeof PostSchema>;

interface NewPostFormProps {
    onSave: (data: any, categoryId: number) => void;
    onCancel: () => void;
    currentPost?: IArticleItem | null;
}

export default function NewPostForm({ onSave, onCancel, currentPost }: Readonly<NewPostFormProps>) {
    const { categories } = useArticles();

    const defaultValues = useMemo(() => ({
        title: currentPost?.title || '',
        year: currentPost?.year || new Date().getFullYear().toString(),
        medium: currentPost?.medium || '',
        link: currentPost?.link || '',
        image: currentPost?.image || '',
        publish_date: currentPost ? new Date(currentPost.publish_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        publish: currentPost ? currentPost.publish === 'published' : false,
        // --- A LÉNYEG ITT VAN ---
        // A 'currentPost' megléte esetén beállítjuk a 'categoryId'-t, egyébként 0-ra (a placeholder-re).
        categoryId: currentPost?.categoryId || 0,
    }), [currentPost]);

    const { control, register, handleSubmit, reset, formState: { errors } } = useForm<NewPostFormData>({
        resolver: zodResolver(PostSchema),
        defaultValues,
    });
    
    useEffect(() => {
        // Ez a hook biztosítja, hogy a form értékei frissüljenek,
        // amikor a `currentPost` prop megváltozik (pl. másik poszt szerkesztését nyitod meg).
        reset(defaultValues);
    }, [defaultValues, reset]);

    const processForm: SubmitHandler<NewPostFormData> = (data) => {
        const { categoryId, ...articleData } = data;
        const dataToSave = {
            ...articleData,
            publish: data.publish ? 'published' : 'draft',
        };
        onSave(dataToSave, categoryId);
    };

    return (
        <form onSubmit={handleSubmit(processForm)}>
            <DialogTitle>{currentPost ? 'Poszt szerkesztése' : 'Új poszt létrehozása'}</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 2, pt: 1 }}>
                    <TextField {...register('title')} label="Title" fullWidth autoFocus error={!!errors.title} helperText={errors.title?.message} />
                    <TextField {...register('year')} label="Year" fullWidth error={!!errors.year} helperText={errors.year?.message} />
                    <TextField {...register('medium')} label="Medium" fullWidth error={!!errors.medium} helperText={errors.medium?.message} />
                    
                    <FormControl fullWidth error={!!errors.categoryId}>
                        <InputLabel id="category-select-label">Category</InputLabel>
                        <Controller
                            name="categoryId"
                            control={control}
                            render={({ field }) => (
                                <Select {...field} labelId="category-select-label" label="Category">
                                    <MenuItem value={0} disabled>Válassz kategóriát...</MenuItem>
                                    {categories.map((category) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {errors.categoryId && <Typography color="error" variant="caption" sx={{ pl: 2, pt: 0.5 }}>{errors.categoryId.message}</Typography>}
                    </FormControl>

                    <TextField {...register('link')} label="Link" fullWidth error={!!errors.link} helperText={errors.link?.message} />
                    <TextField {...register('image')} label="Image URL" fullWidth error={!!errors.image} helperText={errors.image?.message} />
                    <TextField {...register('publish_date')} label="Publish Date" type="date" InputLabelProps={{ shrink: true }} error={!!errors.publish_date} helperText={errors.publish_date?.message} fullWidth />
                    
                    <FormControlLabel
                        label="Publish"
                        sx={{ pl: 1 }}
                        control={<Controller name="publish" control={control} render={({ field }) => <Switch {...field} checked={field.value} />} />}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} variant="outlined" color="inherit">Cancel</Button>
                <Button type="submit" variant="contained">Mentés</Button>
            </DialogActions>
        </form>
    );
}