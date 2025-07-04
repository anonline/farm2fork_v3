'use client';

import type { SxProps, Theme } from '@mui/material';
import type { IProducerItem } from 'src/types/producer';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Typography, Box, Stack, Button, CircularProgress } from '@mui/material';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Kliens Beállítása ---
// Feltételezzük, hogy ezek a környezeti változók léteznek
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


// --- A "BUTA" MEGJELENÍTŐ KOMPONENS ---
// Ez a komponens csak a kinézetért felel, és megkapja a már betöltött producer adatokat.
interface ProducerCardDisplayProps {
    producer: IProducerItem;
}

function ProducerCardDisplay({ producer }: ProducerCardDisplayProps) {
    const router = useRouter();

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
        <Paper 
            elevation={2}
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
            <Box 
                sx={{ 
                    width: { xs: '100%', md: '50%' },
                    aspectRatio: '4/3',
                    flexShrink: 0,
                }}
            >
                <img
                    src={producer.featuredImage || "https://placehold.co/600x450"}
                    alt={producer.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </Box>

            <Box 
                sx={{ 
                    p: { xs: 3, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    flexGrow: 1,
                }}
            >
                <Stack spacing={1.5}>
                    <Typography variant="overline" color="text.secondary">
                        Termelő
                    </Typography>
                    <Typography 
                        variant="h3" 
                        sx={{ 
                            fontWeight: 700, 
                            textTransform: 'uppercase',
                            fontSize: { xs: '28px', md: '36px' },
                            lineHeight: { xs: '34px', md: '42px' },
                        }}
                    >
                        {producer.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {producer.shortDescription || 'Az üvegházban biológiai növényvédelmet alkalmazunk.'}
                    </Typography>
                    <Button sx={buttonStyle}>
                        Tovább a termelőhöz
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
}


// --- AZ "OKOS" FŐ KOMPONENS (ÁTALAKÍTVA) ---
// Ez a komponens kapja meg az ID-t, és felel az adatlekérésért.
interface ProducerCardProps {
    producerId: number;
}

export default function FeaturedProducerCard(props: ProducerCardProps) {
    const { producerId } = props;

    // Állapotok az adatok, a betöltés és a hiba kezelésére
    const [producer, setProducer] = useState<IProducerItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Adatlekérés a Supabase-ből a producerId változásakor
    useEffect(() => {
        if (!producerId) {
            setLoading(false);
            return;
        };

        const fetchProducer = async () => {
            setLoading(true);
            setError(null);

            // Feltételezzük, hogy a termelők táblája 'Producers'
            const { data, error: supabaseError } = await supabase
                .from('Producers')
                .select('*')
                .eq('id', producerId)
                .single(); // .single() egyetlen sort ad vissza objektumként

            if (supabaseError) {
                console.error("Hiba a termelő lekérésekor:", supabaseError);
                setError(supabaseError.message);
            } else {
                setProducer(data);
            }
            setLoading(false);
        };

        fetchProducer();
    }, [producerId]);

    // Betöltési állapot megjelenítése
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Hiba állapot megjelenítése
    if (error) {
        return <Typography color="error">Hiba: {error}</Typography>;
    }

    // Ha nincs adat, nem jelenítünk meg semmit
    if (!producer) {
        return null;
    }

    // Ha minden rendben, megjelenítjük a kártyát a betöltött adatokkal
    return <ProducerCardDisplay producer={producer} />;
}
