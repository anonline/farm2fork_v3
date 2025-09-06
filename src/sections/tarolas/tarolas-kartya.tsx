import { Box, Stack, Typography } from '@mui/material';

import { Image } from 'src/components/image';

interface ITarolasMethod {
    id: number;
    name: string;
    description: string | null;
    imageUrl: string | null;
    order: number;
}

interface TarolasKartyaProps {
    method: ITarolasMethod;
}

export default function TarolasKartya({ method }: Readonly<TarolasKartyaProps>) {
    const nameStyle = {
        textAlign: 'start',
        textTransform: 'uppercase',
        fontWeight: 600,
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
    return (
        <Box sx={{ backgroundColor: 'transparent' }}>
            <Stack spacing="10px">
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
