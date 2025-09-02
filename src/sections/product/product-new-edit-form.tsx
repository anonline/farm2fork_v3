import type { IProductItem } from 'src/types/product';

import { z as zod } from 'zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fetchGetProductBySlug } from 'src/actions/product';
import {
    PRODUCT_SIZE_OPTIONS,
    PRODUCT_GENDER_OPTIONS,
    PRODUCT_COLOR_NAME_OPTIONS,
    PRODUCT_CATEGORY_GROUP_OPTIONS,
} from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type NewProductSchemaType = zod.infer<typeof NewProductSchema>;

export const NewProductSchema = zod.object({
    name: zod.string().min(1, { message: 'Név megadása kötelező!' }),
    url: zod.string().min(1, { message: 'URL megadása kötelező!' }),
    shortDescription: schemaHelper
        .editor({ message: 'Leírás megadása kötelező!' })
        .max(1000, { message: 'A leírásnak kevesebb mint 1000 karakternek kell lennie' }),
    images: schemaHelper.files({ message: 'Képek megadása kötelező!' }),
    code: zod.string().min(1, { message: 'Termék kód megadása kötelező!' }),
    sku: zod.string().min(1, { message: 'Termék SKU megadása kötelező!' }),
    quantity: schemaHelper.nullableInput(
        zod.number({ coerce: true }).min(1, { message: 'Mennyiség megadása kötelező!' }),
        {
            message: 'Mennyiség megadása kötelező!',
        }
    ),
    colors: zod.string().array().min(1, { message: 'Válassz ki legalább egy lehetőséget!' }),
    sizes: zod.string().array().min(1, { message: 'Válassz ki legalább egy lehetőséget!' }),
    tags: zod.string().array().min(2, { message: 'Legalább 2 elem megadása kötelező!' }),
    gender: zod.array(zod.string()).min(1, { message: 'Válassz ki legalább egy lehetőséget!' }),
    price: schemaHelper.nullableInput(
        zod.number({ coerce: true }).min(1, { message: 'Ár megadása kötelező!' }),
        {
            // message for null value
            message: 'Ár megadása kötelező!',
        }
    ),
    // Not required
    category: zod.string(),
    cardText: zod.string().optional(),
    star: zod.boolean(),
    featured: zod.boolean(),
    bio: zod.boolean(),
    priceSale: zod.number({ coerce: true }).nullable(),
    saleLabel: zod.object({ enabled: zod.boolean(), content: zod.string() }),
    netPrice: zod
        .number({ coerce: true })
        .int({ message: 'Kérjük, adjon meg egy érvényes nettó árat!' })
        .min(0, { message: 'Kérjük, adjon meg egy érvényes nettó árat!' })
        .max(999999, { message: 'Kérjük, adjon meg egy érvényes nettó árat!' }),
    grossPrice: zod
        .number({ coerce: true })
        .int({ message: 'Kérjük, adjon meg egy érvényes bruttó árat!' })
        .min(0, { message: 'Kérjük, adjon meg egy érvényes bruttó árat!' })
        .max(999999, { message: 'Kérjük, adjon meg egy érvényes bruttó árat!' }),
    salegrossPrice: zod
        .number({ coerce: true })
        .int({ message: 'Kérjük, adjon meg egy érvényes bruttó árat!' })
        .min(0, { message: 'Kérjük, adjon meg egy érvényes bruttó árat!' })
        .max(999999, { message: 'Kérjük, adjon meg egy érvényes bruttó árat!' })
        .nullable(),
    netPriceVIP: zod
        .number({ coerce: true })
        .int({ message: 'Kérjük, adjon meg egy érvényes VIP nettó árat!' })
        .min(0, { message: 'Kérjük, adjon meg egy érvényes VIP nettó árat!' })
        .max(999999, { message: 'Kérjük, adjon meg egy érvényes VIP nettó árat!' }),
    netPriceCompany: zod
        .number({ coerce: true })
        .int({ message: 'Kérjük, adjon meg egy érvényes Céges nettó árat!' })
        .min(0, { message: 'Kérjük, adjon meg egy érvényes Céges nettó árat!' })
        .max(999999, { message: 'Kérjük, adjon meg egy érvényes Céges nettó árat!' }),
    vat: zod
        .number({ coerce: true })
        .int({ message: 'Kérjük, adjon meg egy érvényes ÁFA százalékot!' })
        .min(0, { message: 'Kérjük, adjon meg egy érvényes ÁFA százalékot!' })
        .max(100, { message: 'Kérjük, adjon meg egy érvényes ÁFA százalékot!' })
        .default(27),
});

// ----------------------------------------------------------------------

type ProductNewEditFormProps = {
    currentProduct: IProductItem | null;
};
export function ProductNewEditForm({ currentProduct }: Readonly<ProductNewEditFormProps>) {
    const router = useRouter();

    const openDetails = useBoolean(true);
    const openProperties = useBoolean(true);
    const openPricing = useBoolean(true);
    const openFeatured = useBoolean(true);

    const defaultValues: NewProductSchemaType = {
        name: '',
        shortDescription: '',
        cardText: '',
        url: '',
        images: [],
        /********/
        code: '',
        sku: '',
        price: null,
        featured: false,
        star: false,
        bio: false,
        priceSale: null,
        quantity: null,
        tags: [],
        gender: [],
        category: PRODUCT_CATEGORY_GROUP_OPTIONS[0].classify[1],
        colors: [],
        sizes: [],
        saleLabel: { enabled: false, content: '' },
        vat: 0,
        netPrice: 0,
        grossPrice: 0,
        salegrossPrice: null,
        netPriceVIP: 0,
        netPriceCompany: 0,
    };

    const methods = useForm<NewProductSchemaType>({
        resolver: zodResolver(NewProductSchema),
        defaultValues,
        values: currentProduct
            ? {
                  ...currentProduct,
                  category:
                      Array.isArray(currentProduct.category) && currentProduct.category.length > 0
                          ? currentProduct.category[0].name || ''
                          : '',
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

    //const values = watch();

    //const [netPrice, grossPrice, vat] = watch(['netPrice','grossPrice','vat']);

    const onSubmit = handleSubmit(async (data) => {
        const updatedData = {
            ...data,
            //taxes: includeTaxes ? defaultValues.taxes : data.taxes,
        };

        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            reset();
            toast.success(currentProduct ? 'Update success!' : 'Create success!');
            router.push(paths.dashboard.product.root);
            console.info('DATA', updatedData);
        } catch (error) {
            console.error(error);
        }
    });

    /*const handleRemoveFile = useCallback(
        (inputFile: File | string) => {
            //const filtered = values.images?.filter((file) => file !== inputFile);
            //setValue('images', filtered);
        },
        [setValue, values.images]
    );*/

    const handleRemoveAllFiles = useCallback(() => {
        setValue('images', [], { shouldValidate: true });
    }, [setValue]);

    const renderCollapseButton = (value: boolean, onToggle: () => void) => (
        <IconButton onClick={onToggle}>
            <Iconify icon={value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'} />
        </IconButton>
    );

    const handleURLGenerate = async (e: { target: { value: string } }) => {
        const name = e.target.value.toString();
        const slug = generateSlug(name);

        let suffix = 2;
        let uniqueSlug = slug;
        let exists = false;

        // Ellenőrizd, hogy van-e már ilyen slug
        do {
            const { product } = await fetchGetProductBySlug(uniqueSlug);
            exists = product && product.id !== currentProduct?.id;
            if (exists) {
                uniqueSlug = `${slug}-${suffix}`;
                suffix++;
            }
        } while (exists);

        setValue('url', uniqueSlug, { shouldValidate: true });
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
        const slug = name
            .split('')
            .map((char: string) => hungarianMap[char] || char)
            .join('')
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase();
        return slug;
    };

    const renderDetails = () => (
        <Card>
            <CardHeader
                title="Alapadatok"
                subheader="Cím, rövid leírás, kép..."
                action={renderCollapseButton(openDetails.value, openDetails.onToggle)}
                sx={{ mb: 3 }}
            />

            <Collapse in={openDetails.value}>
                <Divider />

                <Stack spacing={3} sx={{ p: 3 }}>
                    <Field.Text name="name" label="Termék név" onBlur={handleURLGenerate} />

                    <Field.Text
                        name="url"
                        label="Termék URL"
                        slotProps={{ input: { readOnly: true } }}
                        variant="filled"
                    />

                    <Field.Text name="cardText" label="Kártyán megjelenő rövid leírás" />

                    <Stack spacing={1.5}>
                        <Typography variant="subtitle2">Leírás</Typography>
                        <Field.Editor
                            name="shortDescription"
                            sx={{ maxHeight: 580 }}
                            placeholder="Írja be a termék leírását..."
                        />
                    </Stack>

                    <Stack spacing={1.5}>
                        <Typography variant="subtitle2">Galéria</Typography>
                        <Field.Upload
                            multiple
                            thumbnail
                            name="images"
                            maxSize={10 * 1024 * 1024}
                            //onRemove={/*handleRemoveFile*/}
                            onRemoveAll={handleRemoveAllFiles}
                            onUpload={() => console.info('ON UPLOAD')}
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
                    <Box
                        sx={{
                            rowGap: 3,
                            columnGap: 2,
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                        }}
                    >
                        <Field.Editor
                            name="usageInformation"
                            placeholder="Felhasználási információk"
                        />
                        <Field.Editor
                            name="storingInformation"
                            placeholder="Tárolási információk"
                        />

                        <Field.NumberInput
                            name="mininumQuantity"
                            min={0.1}
                            step={0.1}
                            max={999}
                            helperText="Korárba tétel minimuma"
                            digits={2}
                            slotProps={{
                                inputWrapper: {
                                    sx: { width: '100%' },
                                },
                            }}
                        />

                        <Field.NumberInput
                            name="maximumQuantity"
                            min={0.1}
                            step={0.1}
                            max={999}
                            helperText="Korárba tétel maximuma"
                            digits={2}
                            slotProps={{
                                inputWrapper: {
                                    sx: { width: '100%' },
                                },
                            }}
                        />

                        <Field.NumberInput
                            name="stepQuantity"
                            min={0.1}
                            step={0.1}
                            max={999}
                            helperText="Korárba tétel léptéke"
                            digits={2}
                            slotProps={{
                                inputWrapper: {
                                    sx: { width: '100%' },
                                },
                            }}
                        />

                        <Field.Select
                            name="category"
                            label="Category"
                            slotProps={{
                                select: { native: true },
                                inputLabel: { shrink: true },
                            }}
                        >
                            {PRODUCT_CATEGORY_GROUP_OPTIONS.map((category) => (
                                <optgroup key={category.group} label={category.group}>
                                    {category.classify.map((classify) => (
                                        <option key={classify} value={classify}>
                                            {classify}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </Field.Select>

                        <Field.MultiSelect
                            checkbox
                            name="colors"
                            label="Colors"
                            options={PRODUCT_COLOR_NAME_OPTIONS}
                        />

                        <Field.MultiSelect
                            checkbox
                            name="sizes"
                            label="Sizes"
                            options={PRODUCT_SIZE_OPTIONS}
                        />
                    </Box>

                    {/*<Field.Autocomplete
                        name="tags"
                        label="Címkék"
                        placeholder="+ Címke"
                        multiple
                        freeSolo
                        disableCloseOnSelect
                        options={_tags.map((option) => option)}
                        getOptionLabel={(option) => option}
                        renderOption={(props, option) => (
                            <li {...props} key={option}>
                                {option}
                            </li>
                        )}
                        renderTags={(selected, getTagProps) =>
                            isArray(selected) && selected.map((option, index) => (
                                <Chip
                                    {...getTagProps({ index })}
                                    key={option}
                                    label={option}
                                    size="small"
                                    color="info"
                                    variant="soft"
                                />
                            ))
                        }
                    />*/}

                    <Stack spacing={1}>
                        <Typography variant="subtitle2">Gender</Typography>
                        <Field.MultiCheckbox
                            row
                            name="gender"
                            options={PRODUCT_GENDER_OPTIONS}
                            sx={{ gap: 2 }}
                        />
                    </Stack>
                </Stack>
            </Collapse>
        </Card>
    );

    const renderFeatured = () => (
        <Card>
            <CardHeader
                title="Kiemelt termék"
                subheader="Kiemelt termék beállítások"
                action={renderCollapseButton(openFeatured.value, openFeatured.onToggle)}
                sx={{ mb: 3 }}
            />

            <Collapse in={openFeatured.value}>
                <Divider />

                <Stack spacing={1.5} sx={{ p: 3 }}>
                    <Typography variant="subtitle2">Kiemelt kép</Typography>
                    <Field.Upload
                        thumbnail
                        name="featuredImage"
                        maxSize={10 * 1024 * 1024}
                        //onRemove={/*handleRemoveFile*/}
                        onRemoveAll={handleRemoveAllFiles}
                        onUpload={() => console.info('ON UPLOAD')}
                    />
                </Stack>

                <Divider />

                <Stack spacing={3} sx={{ p: 3 }}>
                    <Field.Switch name="featured" label="Főoldalon kiemelt termék" />
                    <Field.Switch name="star" label="Szezonális sztár termék" />
                    <Field.Switch name="bio" label="Bio termék" />
                </Stack>
            </Collapse>
        </Card>
    );

    const renderPricing = () => (
        <Card>
            <CardHeader
                title="Árak"
                subheader="Árakkal kapcsolatos beviteli mezők"
                action={renderCollapseButton(openPricing.value, openPricing.onToggle)}
                sx={{ mb: 3 }}
            />

            <Collapse in={openPricing.value}>
                <Divider />

                <Stack spacing={3} sx={{ p: 3 }}>
                    <Field.Text
                        name="netPrice"
                        label="Nettó alapár"
                        placeholder="0.00"
                        type="number"
                        onBlur={(e) => {
                            const net = Number(e.target.value);
                            const gross = Math.round(net * (1 + (watch('vat') ?? 0) / 100));
                            setValue('grossPrice', gross, { shouldValidate: true });
                        }}
                        slotProps={{
                            inputLabel: { shrink: true },
                            input: {
                                endAdornment: (
                                    <InputAdornment position="start" sx={{ mr: 0.75 }}>
                                        <Box component="span" sx={{ color: 'text.disabled' }}>
                                            Ft
                                        </Box>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Field.Text
                        name="vat"
                        label="Áfa (%)"
                        placeholder="0"
                        type="number"
                        slotProps={{
                            inputLabel: { shrink: true },
                            input: {
                                endAdornment: (
                                    <InputAdornment position="start" sx={{ mr: 0.75 }}>
                                        <Box component="span" sx={{ color: 'text.disabled' }}>
                                            %
                                        </Box>
                                    </InputAdornment>
                                ),
                                inputProps: { min: 0, max: 100, step: 1 },
                            },
                        }}
                    />

                    <Field.Text
                        name="grossPrice"
                        label="Bruttó alapár"
                        placeholder="0.00"
                        type="number"
                        onBlur={(e) => {
                            const gross = Number(e.target.value);
                            const net = Math.round(gross / (1 + (watch('vat') ?? 0) / 100));
                            setValue('netPrice', net, { shouldValidate: true });
                        }}
                        slotProps={{
                            inputLabel: { shrink: true },
                            input: {
                                endAdornment: (
                                    <InputAdornment position="start" sx={{ mr: 0.75 }}>
                                        <Box component="span" sx={{ color: 'text.disabled' }}>
                                            Ft
                                        </Box>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Field.Text
                        name="netPriceVIP"
                        label="VIP alapár (nettó)"
                        placeholder="0.00"
                        type="number"
                        slotProps={{
                            inputLabel: { shrink: true },
                            input: {
                                endAdornment: (
                                    <InputAdornment position="start" sx={{ mr: 0.75 }}>
                                        <Box component="span" sx={{ color: 'text.disabled' }}>
                                            Ft
                                        </Box>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Field.Text
                        name="netPriceCompany"
                        label="Céges alapár (nettó)"
                        placeholder="0.00"
                        type="number"
                        slotProps={{
                            inputLabel: { shrink: true },
                            input: {
                                endAdornment: (
                                    <InputAdornment position="start" sx={{ mr: 0.75 }}>
                                        <Box component="span" sx={{ color: 'text.disabled' }}>
                                            Ft
                                        </Box>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Field.Text
                        name="salegrossPrice"
                        label="Akciós ár (bruttó)"
                        placeholder="0.00"
                        type="number"
                        slotProps={{
                            inputLabel: { shrink: true },
                            input: {
                                endAdornment: (
                                    <InputAdornment position="start" sx={{ mr: 0.75 }}>
                                        <Box component="span" sx={{ color: 'text.disabled' }}>
                                            Ft
                                        </Box>
                                    </InputAdornment>
                                ),
                            },
                        }}
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
            }}
        >
            <FormControlLabel
                label="Közzétéve"
                control={<Switch defaultChecked slotProps={{ input: { id: 'publish-switch' } }} />}
                sx={{ pl: 3, flexGrow: 1 }}
            />

            <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
                {!currentProduct ? 'Termék létrehozása' : 'Változtatások mentése'}
            </Button>
        </Box>
    );

    return (
        <Form methods={methods} onSubmit={onSubmit}>
            <Box
                sx={{
                    mx: 'auto',
                    maxWidth: { xs: 720, xl: '100%' },
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: '1fr',
                        lg: '7fr 3fr',
                    },
                    gap: { xs: 3, md: 5 },
                }}
            >
                <Stack spacing={{ xs: 3, md: 5 }}>
                    {renderDetails()}
                    {renderProperties()}
                </Stack>
                <Stack spacing={{ xs: 3, md: 5 }}>
                    {renderFeatured()}
                    {renderPricing()}
                    {renderActions()}
                </Stack>
            </Box>
        </Form>
    );
}
