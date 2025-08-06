'use client'

import type { SubmitHandler } from 'react-hook-form';
import type { IArticleItem } from 'src/types/article';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Switch, Container, FormControlLabel } from '@mui/material';

const PostSchema = zod.object({
    title: zod.string().min(3, { message: 'A címnek legalább 3 karakter hosszúnak kell lennie!' }),
    year: zod.string()
        .length(4, { message: 'Az évszámnak pontosan 4 karakterből kell állnia!' })
        .refine((val) => !isNaN(parseInt(val, 10)), { message: 'Az évszám csak számjegyeket tartalmazhat!' }),
    medium: zod.string().min(1, { message: 'A médium megadása kötelező!' }),
    link: zod.string().url({ message: 'Érvénytelen URL formátum!' }).or(zod.literal('')),
    image: zod.string().url({ message: 'Érvénytelen kép URL formátum!' }).or(zod.literal('')),
    publish_date: zod.string().min(1, { message: 'A dátum megadása kötelező!' }),
    publish: zod.string().min(1, { message: 'A státusz megadása kötelező!' }),
    category: zod.string(),
});

type PostFormData = zod.infer<typeof PostSchema>;

interface Props {
    post?: IArticleItem;
}

export function PostEditView({ post }: Readonly<Props>) {
    const defaultValues = {
        title: post?.title ?? '',
        year: post?.year ?? '',
        medium: post?.medium ?? '',
        link: post?.link ?? '',
        image: post?.image ?? '',
        publish_date: post ? new Date(post.publish_date).toISOString().slice(0, 10) : '',
        publish: post?.publish ?? '',
        category: post?.category ?? '',
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PostFormData>({
        resolver: zodResolver(PostSchema),
        defaultValues,
    });

    const onSubmit: SubmitHandler<PostFormData> = (data) => {
        console.log('MENTENDŐ ADATOK:', data);
        if (post) {
            console.log('A poszt ID-ja:', post.id);
        }
    };

    return (
        <Container maxWidth="lg">
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                    <TextField {...register('title')}
                        label="Title"
                        error={!!errors.title}
                        helperText={errors.title?.message}
                    />

                    <TextField {...register('year')}
                        label="Year"
                        error={!!errors.year}
                        helperText={errors.year?.message}
                    />

                    <TextField {...register('medium')}
                        label="Medium"
                        error={!!errors.medium}
                        helperText={errors.medium?.message}
                    />

                    <TextField {...register('link')}
                        label="Link"
                        error={!!errors.link}
                        helperText={errors.link?.message}
                    />

                    <TextField {...register('image')}
                        label="Image URL"
                        error={!!errors.image}
                        helperText={errors.image?.message}
                    />

                    <TextField {...register('publish_date')}
                        label="Publish Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.publish_date}
                        helperText={errors.publish_date?.message}
                    />

                    <FormControlLabel
                        label="Publish"
                        control={<Switch defaultChecked slotProps={{ input: { id: 'publish-switch' } }} />}
                        sx={{ pl: 3, flexGrow: 1 }}
                    />
                </Stack>

                <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                    <Button type="submit" variant="contained">
                        {post ? 'Változtatások mentése' : 'Poszt létrehozása'}
                    </Button>
                </Stack>
            </form>
        </Container>
    );
}