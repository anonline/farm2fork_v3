'use client';

import type { MonthKeys, IProductItem } from 'src/types/product';

import { z as zod } from 'zod';
import { useForm} from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Grid, Stack, Button } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useCategories } from 'src/contexts/category-context';
import { useProducers } from 'src/contexts/producers-context';
import { deleteFile, uploadFile } from 'src/lib/blob/blobClient';
import { useProductCategoryConnection } from 'src/contexts/product-category-connection-context';
import { createProduct, updateProduct, fetchGetProductBySlug, updateProductCategoryRelations } from 'src/actions/product';

import { Form} from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import PricingCard from './new-edit-form/pricing-card';
import DetailsCard from './new-edit-form/details-card';
import FeaturedCard from './new-edit-form/featured-card';
import CategoryCard from './new-edit-form/category-card';
import PropertiesCard from './new-edit-form/properties-card';
import SeasonalityCard from './new-edit-form/seasonality-card';

// ----------------------------------------------------------------------

const UNIT_OPTIONS = [
    { value: 'kg', label: 'kg' }, { value: 'db', label: 'db' }, { value: 'csomag', label: 'csomag' },
    { value: 'üveg', label: 'üveg' }, { value: 'csokor', label: 'csokor' }, { value: 'doboz', label: 'doboz' },
    { value: 'box', label: 'box' }, { value: 'köteg', label: 'köteg' }, { value: 'csomó', label: 'csomó' },
    { value: 'rekesz', label: 'rekesz' }, { value: 'tálca', label: 'tálca' }, { value: 'zsák', label: 'zsák' }
];

const monthValues: [MonthKeys, ...MonthKeys[]] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const NewProductSchema = zod.object({
    name: zod.string().min(1, { message: 'Név megadása kötelező!' }),
    url: zod.string().min(1, { message: 'URL megadása kötelező!' }),
    shortDescription: zod.string().optional(),
    cardText: zod.string().optional(),
    storingInformation: zod.string().optional(),
    usageInformation: zod.string().optional(),
    images: zod.array(zod.any()).max(3, { message: 'Maximum 3 kép tölthető fel!' }).optional(),
    featuredImage: zod.any().optional(),
    categoryIds: zod.array(zod.number()).min(1, { message: 'Legalább egy kategória választása kötelező.' }),
    tags: zod.array(zod.string()).optional(),
    seasonality: zod.array(zod.enum(monthValues)).optional(),
    unit: zod.string().min(1, { message: 'Mértékegység választása kötelező.' }),
    producerId: zod.preprocess(
        (value) => (value === '' ? null : value),
        zod.string().nullable().optional()
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
        .min(0, { message: 'Kérjük, adjon meg egy érvényes nettó árat!' })
        .max(999999, { message: 'Kérjük, adjon meg egy érvényes nettó árat!' }),
    grossPrice: zod
        .number({ coerce: true })
        .int({ message: 'Kérjük, adjon meg egy érvényes (egész) bruttó árat!' })
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
            cardText: currentProduct?.cardText || '',
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
            storingInformation: currentProduct?.storingInformation || '',
            usageInformation: currentProduct?.usageInformation || '',
        }
    }, [currentProduct, connection]);

    const methods = useForm<NewProductSchemaType>({
        resolver: zodResolver(NewProductSchema),
        values: defaultValues,
    });

    const { reset, watch, setValue, handleSubmit, control, formState: { isSubmitting } } = methods;

    const [netPrice, grossPrice, vat] = watch(['netPrice', 'grossPrice', 'vat']);

    const [handleStock, setHandleStock] = useState(currentProduct ? currentProduct.stock !== null : false);
    
    useEffect(() => {
        setHandleStock(currentProduct ? currentProduct.stock !== null : false);
    }, [currentProduct]);

    const toggleHandleStock = () => {
        if (handleStock === true) {
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
        const hungarianMap: Record<string, string> = { 'á': 'a', 'é': 'e', 'ő': 'o', 'ú': 'u', 'ű': 'u', 'ó': 'o', 'ü': 'u', 'ö': 'o', 'Á': 'A', 'É': 'E', 'Ő': 'O', 'Ú': 'U', 'Ű': 'U', 'Ó': 'O', 'Ü': 'U', 'Ö': 'O', 'í': 'i', 'Í': 'I' };
        return name.split('').map(char => hungarianMap[char] || char).join('').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    };

    const scrollToInvalidField = useCallback(() => {
        // Get the first field with an error
        const firstError = Object.keys(methods.formState.errors)[0];
        if (firstError) {
            // Try to find the field element by name attribute
            const fieldElement = document.querySelector(`.Mui-error`) as HTMLElement;
            if (fieldElement) {
                // Scroll to the field with some offset for better visibility
                fieldElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                // Focus the field if it's focusable
                if (fieldElement.focus) {
                    setTimeout(() => fieldElement.focus(), 100);
                }
                return;
            }
            
            // Fallback: try to find by data-testid or aria-label
            const fallbackElement = document.querySelector(`[data-testid="${firstError}"]`) || 
                                   document.querySelector(`[aria-label*="${firstError}"]`) as HTMLElement;
            if (fallbackElement) {
                fallbackElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
        }
    }, [methods.formState.errors]);

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
                console.info('Uploading new featured image...');
                const response = await uploadFile(finalFeaturedImageUrl, 'products', 0);
                if (!response.url) throw new Error('A kiemelt kép feltöltése sikertelen.');
                finalFeaturedImageUrl = response.url;
            }

            // Handle multiple images upload
            const finalImages: string[] = [];
            const currentImages = currentProduct?.images || [];
            const newImages = data.images || [];

            // Determine which images to delete (images that were in currentImages but not in newImages)
            const imagesToDelete = currentImages.filter(
                (currentImage: string) => !newImages.some((newImage: File | string) => 
                    typeof newImage === 'string' && newImage === currentImage
                )
            );

            // Process new images - upload files and keep existing URLs
            for (const image of newImages) {
                if (image instanceof File) {
                    console.info('Uploading new product image...');
                    const response = await uploadFile(image, 'products', finalImages.length);
                    if (!response.url) throw new Error('Egy termék kép feltöltése sikertelen.');
                    finalImages.push(response.url);
                } else if (typeof image === 'string') {
                    // Keep existing image URL
                    finalImages.push(image);
                }
            }

            const productData: any = {
                ...data,
                tags: data.tags?.length ? data.tags.join('|') : null,
                images: finalImages.length > 0 ? finalImages : null,
                featuredImage: finalFeaturedImageUrl ?? null,
                mininumQuantity: data.mininumQuantity ?? undefined,
                maximumQuantity: data.maximumQuantity ?? undefined,
                stepQuantity: data.stepQuantity ?? undefined,
                netPriceVIP: data.netPriceVIP ?? undefined,
                netPriceCompany: data.netPriceCompany ?? undefined,
                stock: handleStock ? data.stock ?? 0 : null,
            };
            delete productData.categoryIds;

            let productId = currentProduct?.id;

            if (currentProduct) {
                await updateProduct(currentProduct.id, productData);
            } else {
                const newProduct = await createProduct(productData);
                productId = newProduct.id;
            }

            // Delete old featured image if it was removed
            if((productData.featuredImage == null || productData.featuredImage === '' || productData.featuredImage === undefined)
            && currentProduct?.featuredImage) {
                console.info('Deleted old featured image:', currentProduct.featuredImage);
                await deleteFile(currentProduct.featuredImage);
            }

            // Delete removed product images
            for (const imageToDelete of imagesToDelete) {
                if (typeof imageToDelete === 'string') {
                    console.info('Deleting removed product image:', imageToDelete);
                    await deleteFile(imageToDelete);
                }
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
    }, (errors) => {
        // This callback is called when form validation fails
        console.log('Form validation errors:', errors);
        // Scroll to the first invalid field
        setTimeout(() => {
            scrollToInvalidField();
        }, 100);
    });

    const renderDetails = () => (
        <DetailsCard isOpen={openDetails} handleURLGenerate={handleURLGenerate} />
    );

    const renderProperties = () => (
            <PropertiesCard isOpen={openProperties} control={control} producers={producers} UNIT_OPTIONS={UNIT_OPTIONS} />
        );

    const renderPricingAndStock = () => (
        <PricingCard isOpen={openPricing} handleStock={handleStock} handleStockChange={toggleHandleStock} handleGrossPriceChange={handleGrossPriceChange} />
    );

    const renderFeatured = () => <FeaturedCard isOpen={openFeatured} />;

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


