'use client';

import { Box, Stack, Typography, CircularProgress } from '@mui/material';

import { useProducers } from 'src/contexts/producers-context';

import F2FIcons from 'src/components/f2ficons/f2ficons';

interface ProducerCardProps {
    producerId: number;
}

export default function TermelokHero({ producerId }: Readonly<ProducerCardProps>) {
    const { producers, loading, error } = useProducers();
    const producer = producers.find((p) => p.id === producerId);
    const IconTextStyle = {
        fontSize: '18px',
        fontWeight: 500,
        lineHeight: '28px',
        textAlign: 'left',
        wordBreak: 'break-word',
        color: 'rgb(126, 126, 126)',
    };
    const IconStyle = { color: 'rgb(126, 126, 126)' };
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 300,
                }}
            >
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

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                height: '100%',
                gap: { xs: 3, md: 5 },
                alignItems: { xs: 'center', lg: 'flex-start' },
                pb: 5,
            }}
        >
            <Box
                sx={{
                    width: { xs: '100%', lg: '614px' },
                    height: { xs: 'auto', lg: '614px' },
                    aspectRatio: { xs: '4/3', lg: '1/1' },
                    flexShrink: 0,
                }}
            >
                <Box
                    component="img"
                    src={producer.featuredImage ?? 'https://placehold.co/614x614'}
                    alt={producer.name}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px',
                    }}
                />
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    flexGrow: 1,
                    width: '100%',
                }}
            >
                <Stack spacing={3}>
                    <Typography
                        sx={{
                            textTransform: 'uppercase',
                            textAlign: 'start',
                            fontWeight: 600,
                            letterSpacing: '-1px',
                            fontSize: { xs: '40px', sm: '48px', md: '64px' },
                            lineHeight: { xs: '48px', sm: '57.6px', md: '70px' },
                        }}
                    >
                        {producer.name}
                    </Typography>

                    <>
                        <Stack
                            spacing={2}
                            sx={{
                                flexDirection: { xs: 'column', lg: 'row' },
                                gap: { xs: 3, lg: '120px' },
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <F2FIcons name="Map" height={24} width={24} style={IconStyle} />
                                <Typography variant="body1" sx={IconTextStyle}>
                                    {producer.location}
                                </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <F2FIcons name="House" height={24} width={24} style={IconStyle} />
                                <Typography variant="body1" sx={IconTextStyle}>
                                    {producer.companyName}
                                </Typography>
                            </Stack>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <F2FIcons name="Apple" height={24} width={24} style={IconStyle} />
                            <Typography variant="body1" sx={IconTextStyle}>
                                {producer.producingTags}
                            </Typography>
                        </Stack>
                    </>
                    <Typography
                        sx={{
                            fontSize: '16px',
                            fontWeight: 500,
                            lineHeight: '28px',
                            textAlign: 'start',
                        }}
                    >
                        {producer.shortDescription ?? 'Nincs megadva leírás.'}
                    </Typography>
                </Stack>
            </Box>
        </Box>
    );
}
