'use client';

import { useState } from 'react';

import { Box, Grid, Button, Skeleton, Typography, CircularProgress } from '@mui/material';

import { useInfiniteScroll } from 'src/hooks/use-infinite-scroll';
import { useInfiniteProducers } from 'src/hooks/use-infinite-producers';

import { themeConfig } from 'src/theme';
import { CONFIG } from 'src/global-config';

import { SortingOrder } from 'src/types/search';

import ProducerCard from '../producer-card/producer-card';
import { ContactModal } from '../contact-modal';
import ProducersPageFilter from '../producers-page-filter/producers-page-filter';

export default function ProducersPage() {
    const [keyword, setKeyword] = useState('');
    const [sortDirection, setSortDirection] = useState<SortingOrder>(SortingOrder.Ascending);
    const [contactModalOpen, setContactModalOpen] = useState(false);

    // Use infinite producers hook
    const {
        producers,
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore,
        totalCount,
    } = useInfiniteProducers({
        keyword,
        sortDirection,
    });

    // Set up infinite scroll
    useInfiniteScroll({
        hasMore,
        loading: loadingMore,
        onLoadMore: loadMore,
        threshold: CONFIG.pagination.infiniteScrollThreshold,
    });

    const handleSearch = (filters: { keyword: string; direction: SortingOrder }) => {
        setKeyword(filters.keyword);
        setSortDirection(filters.direction);
    };

    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '490px',
                    maxHeight: '490px',
                    overflow: 'hidden',
                    zIndex: 0,
                    borderRadius: '8px',
                    padding: '30px',
                    marginBottom: '20px',
                }}
            >
                {/* YouTube video háttérként */}
                <Box
                    component="iframe"
                    src="https://www.youtube.com/embed/JT3RKC0fecc?autoplay=1&mute=1&loop=1&playlist=JT3RKC0fecc&controls=0&showinfo=0&modestbranding=1&rel=0"
                    allow="autoplay"
                    allowFullScreen
                    sx={{
                        position: 'absolute',
                        top: {xs: '-75%', sm: '-50%'},
                        left: {xs: '-75%', sm: '-50%'},
                        width: {xs: '250%', sm: '200%'},
                        height: {xs: '250%', sm: '200%'},
                        zIndex: -1,
                        border: 0,
                        pointerEvents: 'none',
                    }}
                />

                {/* Tartalom */}
                <Box
                    sx={{
                        position: 'absolute',
                        zIndex: 1,
                        color: 'white',
                        bottom: 0,
                        left: 0,
                        p: 4,
                    }}
                >
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '32px', sm: '48px', md: '64px' },
                            fontWeight: '600',
                            fontFamily: themeConfig.fontFamily.bricolage,
                            letterSpacing: '-1px',
                            textTransform: 'uppercase',
                        }}
                    >
                        Termelők
                    </Typography>
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                    marginBottom: '50px',
                    gap: '30px',
                    width: '100%',
                    justifyContent: 'space-between',
                }}
            >
                <Typography
                    sx={{
                        width: {sm: '100%', md: '55%'},
                        fontFamily: themeConfig.fontFamily.primary,
                        fontSize: '16px',
                        fontWeight: 500,
                        lineHeight: '28px',
                    }}
                >
                    A Farm2Forknál alapelveink a kiváló minőség és a méltányos kereskedelem.
                    Termelőinket személyesen ismerjük, és hosszú ideje jó kapcsolatot ápolunk velük.
                    Kiemelten fontos számunkra a méltányos kereskedelem elve, így rendeléseddel te
                    is hozzájárulhatsz a magyar termelők támogatásához. A Farm2Fork azért jött
                    létre, hogy összekapcsolja a tudatos vásárlókat az elhivatott helyi termelőkkel.
                </Typography>
                <Box
                    sx={{
                        width: {sm: '100%', md: '40%'},
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        padding: '24px',
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            textTransform: 'uppercase',
                            fontFamily: themeConfig.fontFamily.bricolage,
                            fontSize: '28px',
                            fontWeight: 600,
                            lineHeight: '36px',
                        }}
                    >
                        Termelő vagy?
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: themeConfig.fontFamily.primary,
                            fontWeight: 400,
                            fontSize: '16px',
                            lineHeight: '24px',
                            letterSpacing: '0.01em',
                            verticalAlign: 'middle',
                            color: themeConfig.palette.grey[500],
                        }}
                    >
                        Amennyiben szívesen dolgoznál velünk, várjuk jelentkezésedet!
                    </Typography>
                    <Button
                        style={{ width: '125px', padding: '10px 24px' }}
                        variant="outlined"
                        onClick={() => setContactModalOpen(true)}
                    >
                        Írj nekünk
                    </Button>
                </Box>
            </Box>

            <ProducersPageFilter onChange={handleSearch} />

            {/* Results summary */}
            {!loading && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {producers.length} termelő betöltve{totalCount > producers.length && ` (${totalCount} összesen)`}
                    {keyword && ` "${keyword}" keresésre`}
                </Typography>
            )}

            {loading ? (
                <Grid container spacing={1} justifyContent="start" style={{ marginTop: '20px' }}>
                    {Array.from({ length: CONFIG.pagination.producersPerPage }).map((_, index) => (
                        <Grid size={{ xs: 12, sm: 4, md: 2.4, lg: 2.4 }} key={index}>
                            <Skeleton height={400} />
                        </Grid>
                    ))}
                </Grid>
            ) : producers.length === 0 ? (
                <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
                    <Typography variant="h6" sx={{ color: themeConfig.palette.grey[600] }}>
                        {error ? 'Hiba történt a termelők betöltése során' : 'Nincs a keresésnek megfelelő termelő.'}
                    </Typography>
                    {keyword && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Próbáld meg módosítani a keresési feltételeket.
                        </Typography>
                    )}
                </Box>
            ) : (
                <Grid container spacing="5px" justifyContent="start" style={{ marginTop: '20px' }}>
                    {producers.map((producer) => (
                        <Grid size={{ xs: 6, sm: 4, md: 2.4, lg: 2.4 }} key={producer.id}>
                            <ProducerCard producer={producer} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Loading more indicator */}
            {loadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 3 }}>
                    <CircularProgress size={32} />
                </Box>
            )}

            {/* Load more button (fallback for users without scroll) */}
            {!loading && !loadingMore && hasMore && producers.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={loadMore}
                        disabled={loadingMore}
                        size="large"
                        sx={{ minWidth: 200 }}
                    >
                        Több termelő betöltése
                    </Button>
                </Box>
            )}
            
            {/* Contact Modal */}
            <ContactModal
                open={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                onSuccess={() => {
                    console.log('Contact form submitted successfully');
                }}
            />
        </>
    );
}
