import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { themeConfig } from 'src/theme/theme-config';
import { useCategories } from 'src/contexts/category-context';

import { Image } from 'src/components/image';

interface ITarolasMethod {
    id: number;
    name: string;
    description: string | null;
    imageUrl: string | null;
    order: number;
    categoryId: number | null;
}

interface TarolasKartyaProps {
    method: ITarolasMethod;
}

export default function TarolasKartya({ method }: Readonly<TarolasKartyaProps>) {

    const {categories} = useCategories();

    const nameStyle = {
        textAlign: 'start',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontFamily: themeConfig.fontFamily.bricolage,
        fontSize: { xs: '20px', sm: '20px', md: '22px', lg: '28px' },
        lineHeight: { xs: '36px', md: '36px', lg: '36px' },
    };

    const descriptionStyle = {
        textAlign: 'start',
        fontWeight: 400,
        fontSize: '16px',
        lineHeight: '24px',
        marginBlockEnd: '14.4px',
    };
    const [categoryLink, setCategoryLink] = useState<string | null>(null);

    useEffect(() => {
        if(method.categoryId !== null) {
            const category = categories.find(cat => cat.id === method.categoryId);
            setCategoryLink(category ? paths.categories.list(category.slug) : null);
        }
    }, [categories]);

    return (
        <Box sx={{ backgroundColor: 'transparent' }}>
            <Stack spacing="10px">
                {categoryLink ? (
                    <Link href={categoryLink} style={{ 
                        textDecoration: 'none',
                        display: 'block',
                        overflow: 'hidden',
                        borderRadius: '8px'
                    }}>
                        <Image
                            src={method.imageUrl ?? 'https://placehold.co/414x282'}
                            alt={method.name}
                            style={{
                                width: '100%',
                                height: 'auto',
                                aspectRatio: '414/282',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                transition: 'transform 0.3s ease-in-out',
                                cursor: 'pointer'
                            }}
                            sx={{
                                '&:hover': {
                                    transform: 'scale(1.1)'
                                }
                            }}
                        />
                    </Link>
                ): (
                    <Image
                    src={method.imageUrl ?? 'https://placehold.co/414x282'}
                    alt={method.name}
                    style={{
                        width: '100%',
                        height: 'auto',
                        aspectRatio: '414/282',
                        objectFit: 'cover',
                        borderRadius: '8px',
                    }}
                />
                )}
                <Typography variant="h3" sx={nameStyle}>
                    {method.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={descriptionStyle}>
                    {method.description}
                </Typography>
            </Stack>
        </Box>
    );
}
