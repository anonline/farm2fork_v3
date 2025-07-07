'use client';

import type { Theme, SxProps } from '@mui/material';

import { useRouter } from 'next/navigation';

import { Box, Stack, Button, Typography, CircularProgress } from '@mui/material';

import { useProducers } from 'src/contexts/producers-context';



interface ProducerCardProps {
    producerId: number;
}

export default function ProducerCard({ producerId }: Readonly<ProducerCardProps>) {
    const router = useRouter();
    const { producers, loading, error } = useProducers();
    const producer = producers.find(p => p.id === producerId);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">Hiba: {error}</Typography>;
    }

    if (!producer) {
        return null;
    }

    const openProducerPage = () => {
        router.push(`/termelok/${producer.slug}`);
    };

    const buttonStyle: SxProps<Theme> = {
        mt: 3,
        alignSelf: 'flex-start',
        border: '2px solid black',
        color: 'black',
        fontWeight: 600,
        px: 2.5,
        py: 1,
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: 'rgb(70, 110, 80)',
            color: 'white',
            border: '2px solid rgb(70, 110, 80)',
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#F7F5EF',
                cursor: 'pointer',
                height: '100%',
            }}
            onClick={openProducerPage}
        >
            <Box sx={{ width: { xs: '100%', md: '50%' }, aspectRatio: '4/3', flexShrink: 0 }}>
                <img
                    src={producer.featuredImage ?? "https://placehold.co/600x450"}
                    alt={producer.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius:'12px' }}
                />
            </Box>
            <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
                <Stack spacing={1.5}>
                    <Typography variant="overline" color="text.secondary">Termelő</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: { xs: '28px', md: '36px' }, lineHeight: { xs: '34px', md: '42px' } }}>
                        {producer.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {producer.shortDescription ?? 'Az üvegházban biológiai növényvédelmet alkalmazunk.'}
                    </Typography>
                    <Button sx={buttonStyle}>Tovább a termelőhöz</Button>
                </Stack>
            </Box>
        </Box>
    );
}