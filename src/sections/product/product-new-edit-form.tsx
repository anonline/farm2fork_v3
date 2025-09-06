'use client';

import type { MonthKeys, IProductItem } from 'src/types/product';

import { z as zod } from 'zod';
import { useBoolean } from 'minimal-shared/hooks';
import { useForm} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Stack, Button, Grid } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { uploadFile } from 'src/lib/blob/blobClient';
import { useCategories } from 'src/contexts/category-context';
import { useProducers } from 'src/contexts/producers-context';
import { useProductCategoryConnection } from 'src/contexts/product-category-connection-context';
import { createProduct, updateProduct, fetchGetProductBySlug, updateProductCategoryRelations } from 'src/actions/product';

import { toast } from 'src/components/snackbar';
import { Form, schemaHelper} from 'src/components/hook-form';
import SeasonalityCard from './new-edit-form/seasonality-card';
import FeaturedCard from './new-edit-form/featured-card';
import PricingCard from './new-edit-form/pricing-card';
import DetailsCard from './new-edit-form/details-card';
import CategoryCard from './new-edit-form/category-card';
import PropertiesCard from './new-edit-form/properties-card';

// ----------------------------------------------------------------------

const UNIT_OPTIONS = [
    { value: 'kg', label: 'kg' }, { value: 'db', label: 'db' }, { value: 'csomag', label: 'csomag' },
    { value: 'üveg', label: 'üveg' }, { value: 'csokor', label: 'csokor' }, { value: 'doboz', label: 'doboz' },
];

const monthValues: [MonthKeys, ...MonthKeys[]] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const NewProductSchema = zod.object({
    name: zod.string().min(1, { message: 'Név megadása kötelező!' }),
    url: zod.string().min(1, { message: 'URL megadása kötelező!' }),
    shortDescription: schemaHelper.editor({ message: 'Leírás megadása kötelező!' }),
    images: zod.array(zod.any()).optional(),
    featuredImage: zod.any().optional(),
    categoryIds: zod.array(zod.number()).min(1, { message: 'Legalább egy kategória választása kötelező.' }),
    tags: zod.array(zod.string()).optional(),
    seasonality: zod.array(zod.enum(monthValues)).optional(),
    unit: zod.string().min(1, { message: 'Mértékegység választása kötelező.' }),
    producerId: zod.preprocess(
        (value) => (value === '' ? null : value),
        zod.number().nullable().optional()
    ),
    mininumQuantity: zod.number({ coerce: true }).min(0, 'Minimum 0 lehet.').nullable(),
    maximumQuantity: zod.number({ coerce: true }).min(0, 'Minimum 0 lehet.').nullable(),
    stepQuantity: zod.number({ coerce: true }).min(0.1, 'Minimum 0.1 lehet.').nullable(),
    stock: zod.number({ coerce: true }).nullable(),
    backorder: zod.boolean(),
    featured: zod.boolean(),
    star: zod.boolean(),
    bio: zod.boolean(),
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
})
    .refine((data) => {
        if (!data.backorder && data.stock !== null) {
            return data.stock >= 0;
        }
        return true;
    }, {
        message: 'Előrendelés nélkül a készlet nem lehet negatív értékű!',
        path: ['stock'],
    });

export type NewProductSchemaType = zod.infer<typeof NewProductSchema>;
    

// ----------------------------------------------------------------------

export function ProductNewEditForm({ currentProduct }: Readonly<{ currentProduct: IProductItem | null }>) {
    const router = useRouter();

    const { categories, loading: categoriesLoading } = useCategories();
    const { producers } = useProducers();
    const { connection } = useProductCategoryConnection();

    const openDetails = useBoolean(true);
    const openProperties = useBoolean(true);
    const openCategories = useBoolean(true);
    const openPricing = useBoolean(true);
    const openFeatured = useBoolean(true);
    const openSeasonality = useBoolean(true);

    const defaultValues = useMemo<NewProductSchemaType>(() => {
        const assignedCategoryIds = currentProduct
            ? connection
                .filter(c => c.productId === currentProduct.id)
                .map(c => c.categoryId)
            : [];

        let tags: string[] = [];
        if (Array.isArray(currentProduct?.tags)) {
            tags = currentProduct.tags;
        } else if (currentProduct?.tags) {
            tags = (currentProduct.tags as string).split('|').map(tag => tag.trim());
        }

        return {
            name: currentProduct?.name || '',
            url: currentProduct?.url || '',
            sku: currentProduct?.sku || '',
            shortDescription: currentProduct?.shortDescription || '',
            images: currentProduct?.images || [],
            featuredImage: currentProduct?.featuredImage || null,
            categoryIds: assignedCategoryIds,
            tags,
            seasonality: currentProduct?.seasonality || [],
            unit: currentProduct?.unit || '',
            producerId: currentProduct?.producerId ?? null,
            mininumQuantity: currentProduct?.mininumQuantity || 1,
            maximumQuantity: currentProduct?.maximumQuantity || 10,
            stepQuantity: currentProduct?.stepQuantity || 1,
            netPrice: currentProduct?.netPrice || 0,
            grossPrice: currentProduct?.grossPrice || 0,
            vat: currentProduct?.vat || 27,
            netPriceVIP: currentProduct?.netPriceVIP ?? 0,
            netPriceCompany: currentProduct?.netPriceCompany ?? 0,
            stock: currentProduct?.stock ?? 0,
            backorder: currentProduct?.backorder || false,
            featured: currentProduct?.featured || false,
            star: currentProduct?.star || false,
            bio: currentProduct?.bio || false,
            priceSale: currentProduct?.priceSale || null,
            saleLabel: currentProduct?.saleLabel || { enabled: false, content: '' },
            salegrossPrice: currentProduct?.salegrossPrice || null,
        }
    }, [currentProduct, connection]);

    const methods = useForm<NewProductSchemaType>({
        resolver: zodResolver(NewProductSchema),
        values: defaultValues,
    });

    const { reset, watch, setValue, handleSubmit, control, formState: { isSubmitting } } = methods;

    const [netPrice, grossPrice, vat] = watch(['netPrice', 'grossPrice', 'vat']);

    const [handleStock, setHandleStock] = useState(false);
    const toggleHandleStock = () => {
        
        if(handleStock === true) {
            setValue('stock', 0);
        }
        setHandleStock(!handleStock);
    }

    useEffect(() => {
        if (netPrice && vat) {
            const newGross = Math.round(netPrice * (1 + vat / 100));
            if (newGross !== grossPrice) {
                setValue('grossPrice', newGross, { shouldValidate: true });
            }
        }
    }, [netPrice, vat, grossPrice, setValue]);

    const handleGrossPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newGross = Number(e.target.value);
        if (vat) {
            const newNet = Math.round(newGross / (1 + vat / 100));
            setValue('netPrice', newNet, { shouldValidate: true });
        }
    };

    const generateSlug = (name: string) => {
        const hungarianMap: Record<string, string> = { 'á': 'a', 'é': 'e', 'ő': 'o', 'ú': 'u', 'ű': 'u', 'ó': 'o', 'ü': 'u', 'ö': 'o', 'Á': 'A', 'É': 'E', 'Ő': 'O', 'Ú': 'U', 'Ű': 'U', 'Ó': 'O', 'Ü': 'U', 'Ö': 'O' };
        return name.split('').map(char => hungarianMap[char] || char).join('').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    };

    const handleURLGenerate = useCallback(async (e: { target: { value: string } }) => {
        const name = e.target.value;
        const slug = generateSlug(name);
        let suffix = 2;
        let uniqueSlug = slug;
        let exists = false;
        do {
            const { product } = await fetchGetProductBySlug(uniqueSlug);
            exists = !!(product && product.id !== currentProduct?.id);
            if (exists) {
                uniqueSlug = `${slug}-${suffix}`;
                suffix++;
            }
        } while (exists);
        setValue('url', uniqueSlug, { shouldValidate: true });
    }, [currentProduct, setValue]);

    const onSubmit = handleSubmit(async (data) => {
        try {
            let finalFeaturedImageUrl = data.featuredImage;

            if (finalFeaturedImageUrl instanceof File) {
                const response = await uploadFile(finalFeaturedImageUrl, 'products', 0);
                if (!response.url) throw new Error('A kiemelt kép feltöltése sikertelen.');
                finalFeaturedImageUrl = response.url;
            }

            const productData: any = {
                ...data,
                tags: data.tags?.length ? data.tags.join('|') : null,
                featuredImage: finalFeaturedImageUrl ?? undefined,
                mininumQuantity: data.mininumQuantity ?? undefined,
                maximumQuantity: data.maximumQuantity ?? undefined,
                stepQuantity: data.stepQuantity ?? undefined,
                netPriceVIP: data.netPriceVIP ?? undefined,
                netPriceCompany: data.netPriceCompany ?? undefined,
            };
            delete productData.categoryIds;

            let productId = currentProduct?.id;

            if (currentProduct) {
                await updateProduct(currentProduct.id, productData);
            } else {
                const newProduct = await createProduct(productData);
                productId = newProduct.id;
            }

            if (!productId) {
                throw new Error('A termék azonosítója nem jött létre, a kategóriák nem menthetők.');
            }

            await updateProductCategoryRelations(productId, data.categoryIds);

            reset();
            toast.success(currentProduct ? 'Sikeres frissítés!' : 'Sikeres létrehozás!');
            router.push(paths.dashboard.product.root);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Hiba történt a mentés során.');
        }
    });

    const renderDetails = () => (
        <DetailsCard isOpen={openDetails} handleURLGenerate={handleURLGenerate} />
    );

    const renderProperties = () => {
        return (
            <PropertiesCard isOpen={openProperties} control={control} producers={producers} UNIT_OPTIONS={UNIT_OPTIONS} />
        )
    };

    const renderPricingAndStock = () => (
        <PricingCard isOpen={openPricing} handleStock={handleStock} handleStockChange={toggleHandleStock} handleGrossPriceChange={handleGrossPriceChange} />
    );

    const renderFeatured = () => (
        <FeaturedCard isOpen={openFeatured} />
    );

    return (
        <Form methods={methods} onSubmit={onSubmit}>
            <Box
                sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateColumns: { xs: '1fr', lg: '8fr 4fr' },
                }}
            >
                <Stack spacing={3}>
                    {renderDetails()}

                    <Grid container spacing={3}>
                        <Grid size={{xs:12, md:6}}>
                            <CategoryCard isOpen={openCategories} control={control} categoriesLoading={categoriesLoading} categories={categories} />
                        </Grid>
                        <Grid size={{xs:12, md:6}}>
                            <SeasonalityCard isOpen={openSeasonality} control={control} />
                        </Grid>
                    </Grid>

                    {renderProperties()}
                </Stack>
                <Stack spacing={3}>
                    {renderPricingAndStock()}

                    {renderFeatured()}
                    
                    <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
                        {currentProduct ? 'Változtatások mentése' : 'Termék létrehozása'}
                    </Button>
                </Stack>
            </Box>
        </Form>
    );
}


