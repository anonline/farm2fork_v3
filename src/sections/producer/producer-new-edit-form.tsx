'use client';

import type { IProducerItem } from 'src/types/producer';

import { z as zod } from 'zod';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { useMemo, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Typography, CardHeader } from '@mui/material';

import { paths } from 'src/routes/paths';

import { uploadFile } from 'src/lib/blob/blobClient';
import { createProducer, updateProducer, fetchGetProducerBySlug } from 'src/actions/producer';

import { toast } from 'src/components/snackbar';
import { RHFSwitch, RHFEditor, RHFUpload, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const ProducerSchema = zod.object({
  name: zod.string().min(1, { message: 'Név megadása kötelező!' }),
  slug: zod.string().min(1, { message: 'URL (slug) megadása kötelező!' }),
  companyName: zod.string().nullable(),
  location: zod.string().nullable(),
  bio: zod.boolean(),
  shortDescription: zod.string().nullable(),
  producingTags: zod.string().nullable(),
  featuredImage: zod.union([zod.string(), zod.instanceof(File)]).nullable().optional(),
});

type ProducerSchemaType = zod.infer<typeof ProducerSchema>;

type Props = {
  currentProducer?: IProducerItem;
};

export default function ProducerNewEditForm({ currentProducer }: Readonly<Props>) {
  const router = useRouter();

  const defaultValues = useMemo(() => ({
    name: currentProducer?.name || '',
    slug: currentProducer?.slug || '',
    companyName: currentProducer?.companyName || null,
    location: currentProducer?.location || null,
    bio: currentProducer?.bio || false,
    shortDescription: currentProducer?.shortDescription || null,
    producingTags: currentProducer?.producingTags || null,
    featuredImage: currentProducer?.featuredImage || null,
  }), [currentProducer]);

  const methods = useForm<ProducerSchemaType>({
    resolver: zodResolver(ProducerSchema),
    defaultValues,
  });

  const { reset, handleSubmit, setValue, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (currentProducer) {
      reset(defaultValues);
    }
  }, [currentProducer, defaultValues, reset]);

  const generateSlug = (name: string) => {
    const hungarianMap: Record<string, string> = {
        'á': 'a', 'é': 'e', 'ő': 'o', 'ú': 'u', 'ű': 'u', 'ó': 'o', 'ü': 'u', 'ö': 'o',
        'Á': 'A', 'É': 'E', 'Ő': 'O', 'Ú': 'U', 'Ű': 'U', 'Ó': 'O', 'Ü': 'U', 'Ö': 'O'
    };
    return name
        .split('')
        .map((char: string) => hungarianMap[char] || char)
        .join('')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .toLowerCase();
  }

  const handleURLGenerate = useCallback(async (e: { target: { value: string } }) => {
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
  }, [currentProducer?.id, setValue]);

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

      const plainShortDescription = data.shortDescription ? data.shortDescription.replace(/<[^>]*>/g, '') : null;

      const dataToSubmit: Partial<IProducerItem> = {
        ...data,
        shortDescription: plainShortDescription ?? undefined,
        featuredImage: typeof finalImageUrl === 'string' ? finalImageUrl : undefined,
        companyName: data.companyName ?? undefined,
        location: data.location ?? undefined,
        producingTags: data.producingTags ?? undefined,
      };

      if (currentProducer) {
        await updateProducer(currentProducer.id, dataToSubmit);
        toast.success('Sikeres mentés!');
      } else {
        await createProducer(dataToSubmit);
        toast.success('Termelő sikeresen létrehozva!');
      }
      router.push(paths.dashboard.producer.root);

    } catch (error: any) {
      console.error("Hiba a beküldés során:", error);
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
                        <RHFTextField name="name" label="Termelő neve" onBlur={handleURLGenerate} />
                        <RHFTextField name="slug" label="URL (slug)" InputProps={{ readOnly: true }} />
                        <RHFTextField name="companyName" label="Cég neve" />
                        <RHFTextField name="location" label="Termelő helye" />
                    </Stack>
                </Card>

                <Card>
                    <CardHeader title="Bemutatkozás és Tartalom" />
                    <Stack spacing={3} sx={{ p: 3 }}>
                        <Typography variant="subtitle2">Rövid leírás</Typography>
                        <RHFEditor name="shortDescription" />
                        <RHFTextField name="producingTags" label="Mit termel? (címkék vesszővel elválasztva)" />
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
                          onDelete={() => setValue('featuredImage', null, { shouldValidate: true })}
                        />
                        <Typography color="text.secondary" variant="caption">
                            Tölts fel egy borítóképet a termelőhöz.
                        </Typography>
                    </Stack>
                </Card>

                <Stack alignItems="flex-end">
                    <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
                        {currentProducer ? 'Változtatások mentése' : 'Termelő létrehozása'}
                    </LoadingButton>
                </Stack>
            </Stack>
        </Box>
      </form>
    </FormProvider>
  );
}