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
import { Switch, Checkbox, FormGroup, FormLabel, Typography, FormControl, FormControlLabel } from '@mui/material';

import { useArticles } from 'src/contexts/articles-context';

const PostSchema = zod.object({
    title: zod.string().min(3, { message: 'A címnek legalább 3 karakter hosszúnak kell lennie!' }),
    year: zod.string().length(4, { message: 'Az évszámnak pontosan 4 karakterből kell állnia!' }),
    medium: zod.string().min(1, { message: 'A médium megadása kötelező!' }),
    link: zod.string().url().or(zod.literal('')),
    image: zod.string().url().or(zod.literal('')),
    publish_date: zod.string().min(1, { message: 'A dátum megadása kötelező!' }),
    publish: zod.boolean(),
    categoryIds: zod.array(zod.number()).min(1, { message: "Legalább egy kategória kiválasztása kötelező" }),
});

type NewPostFormData = zod.infer<typeof PostSchema>;

interface NewPostFormProps {
    onSave: (data: any, categoryIds: number[]) => void;
    onCancel: () => void;
    currentPost?: IArticleItem;
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
        categoryIds: currentPost?.categoryIds || [],
    }), [currentPost]);

    const { control, register, handleSubmit, reset, formState: { errors } } = useForm<NewPostFormData>({
        resolver: zodResolver(PostSchema),
        defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const processForm: SubmitHandler<NewPostFormData> = (data) => {
        const { categoryIds, ...articleData } = data;
        const dataToSave = { ...articleData, publish: data.publish ? 'published' : 'draft' };
        onSave(dataToSave, categoryIds);
    };

    return (
        <form onSubmit={handleSubmit(processForm)}>
            <DialogTitle>{currentPost ? 'Poszt szerkesztése' : 'Új poszt létrehozása'}</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 2, pt: 1 }}>

                    <TextField {...register('title')}
                        label="Title"
                        fullWidth
                        autoFocus
                        error={!!errors.title}
                        helperText={errors.title?.message}
                    />

                    <TextField {...register('year')}
                        label="Year"
                        fullWidth
                        error={!!errors.year}
                        helperText={errors.year?.message}
                    />

                    <TextField {...register('medium')}
                        label="Medium"
                        fullWidth
                        error={!!errors.medium}
                        helperText={errors.medium?.message}
                    />

                    <FormControl component="fieldset" variant="standard" error={!!errors.categoryIds}>
                        <FormLabel component="legend">Categories</FormLabel>
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
                                                        onChange={(e) => {
                                                            const selectedIds = field.value;
                                                            if (e.target.checked) {
                                                                field.onChange([...selectedIds, category.id]);
                                                            } else {
                                                                field.onChange(selectedIds.filter((id) => id !== category.id));
                                                            }
                                                        }}
                                                    />
                                                }
                                                label={category.title}
                                            />
                                        ))}
                                    </>
                                )}
                            />
                        </FormGroup>
                        {errors.categoryIds && <Typography color="error" variant="caption">{errors.categoryIds.message}</Typography>}
                    </FormControl>

                    <TextField {...register('link')}
                        label="Link"
                        fullWidth
                        error={!!errors.link}
                        helperText={errors.link?.message}
                    />

                    <TextField {...register('image')}
                        label="Image URL"
                        fullWidth
                        error={!!errors.image}
                        helperText={errors.image?.message}
                    />

                    <TextField {...register('publish_date')}
                        label="Publish Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.publish_date}
                        helperText={errors.publish_date?.message}
                        fullWidth
                    />

                    <FormControlLabel
                        label="Publish"
                        sx={{ pl: 1 }}
                        control={<Controller
                            name="publish"
                            control={control}
                            render={({ field }) => <Switch {...field} checked={field.value} />}
                        />}
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