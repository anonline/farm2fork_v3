import type { SubmitHandler } from 'react-hook-form';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import dayjs from 'dayjs';
import { useState } from 'react';


const NewPostSchema = zod.object({
    id: zod.number().optional(),
    title: zod.string().min(3, { message: 'A címnek legalább 3 karakter hosszúnak kell lennie!' }),
    year: zod.string()
        .length(4, { message: 'Az évszámnak pontosan 4 karakterből kell állnia!' })
        .refine((val) => {
            const yearNum = parseInt(val, 10);
            const currentYear = new Date().getFullYear();
            return yearNum >= 1900 && yearNum <= currentYear;
        }, { message: `Az évszámnak 1900 és ${new Date().getFullYear()} között kell lennie!` }),
    medium: zod.string().min(1, { message: 'A médium megadása kötelező!' }),
    link: zod.string().url({ message: 'Érvénytelen URL formátum!' }).or(zod.literal('')),
    image: zod.string().url({ message: 'Érvénytelen kép URL formátum!' }).or(zod.literal('')),
    category: zod.string().min(1, { message: 'A kategória megadása kötelező!' }),
    publish_date: zod.string().min(1, { message: 'A dátum megadása kötelező!' }),
    publish: zod.string().min(1, { message: 'A státusz megadása kötelező!' }),
});

type NewPostFormData = zod.infer<typeof NewPostSchema>;


interface NewPostFormProps {
    onSave: (newPost: NewPostFormData) => void;
    onCancel: () => void;
}

export default function NewPostForm({ onSave, onCancel }: Readonly<NewPostFormProps>) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<NewPostFormData>({
        resolver: zodResolver(NewPostSchema),
        defaultValues: {
            title: '',
            year: new Date().getFullYear().toString(),
            medium: '',
            link: '',
            image: '',
            publish_date: new Date().toISOString().slice(0, 10), // This returns a string in 'YYYY-MM-DD' format
            publish: 'draft',
        },
    });

    // Local state for DesktopDatePicker
    const [publishDate, setPublishDate] = useState<dayjs.Dayjs | null>(
        dayjs(new Date().toISOString().slice(0, 10))
    );

    const processForm: SubmitHandler<NewPostFormData> = (data) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(processForm)}>
            <DialogTitle>Create a new post</DialogTitle>
            <DialogContent>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Az űrlap elküldése előtt a rendszer ellenőrzi a megadott adatokat.
                </Typography>
                <Stack spacing={3} sx={{ mt: 2 }}>
                    <TextField
                        {...register('title')}
                        label="Title"
                        fullWidth
                        autoFocus
                        error={!!errors.title}
                        helperText={errors.title?.message}
                    />
                    <TextField
                        {...register('year')}
                        label="Year"
                        fullWidth
                        error={!!errors.year}
                        helperText={errors.year?.message}
                    />
                    <TextField
                        {...register('medium')}
                        label="Medium"
                        fullWidth
                        error={!!errors.medium}
                        helperText={errors.medium?.message}
                    />
                    <TextField
                        {...register('link')}
                        label="Link"
                        fullWidth
                        error={!!errors.link}
                        helperText={errors.link?.message}
                    />
                    <TextField
                        {...register('image')}
                        label="Image URL"
                        fullWidth
                        error={!!errors.image}
                        helperText={errors.image?.message}
                    />

                    <TextField
                        {...register('category')}
                        label="Category"
                        fullWidth
                        error={!!errors.category}
                        helperText={errors.category?.message}
                    />
                    <DesktopDatePicker
                        label="Publish Date"
                        value={publishDate}
                        minDate={dayjs('2017-01-01')}
                        onChange={(date) => {
                            setPublishDate(date);
                            setValue('publish_date', date ? date.format('YYYY-MM-DD') : '');
                        }}
                        slotProps={{ textField: { fullWidth: true, error: !!errors.publish_date, helperText: errors.publish_date?.message } }}
                    />

                    <TextField
                        {...register('publish')}
                        label="Publish Status"
                        fullWidth
                        error={!!errors.publish}
                        helperText={errors.publish?.message}
                    />
                    
                        
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} variant="outlined" color="inherit">Cancel</Button>
                <Button type="submit" variant="contained" sx={{ bgcolor: 'rgb(70, 110, 80)', '&:hover': { bgcolor: 'rgb(60, 90, 65)' } }}>
                    Mentés
                </Button>
            </DialogActions>
        </form>
    );
}