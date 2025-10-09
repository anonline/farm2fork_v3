import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { IProducerItem } from 'src/types/producer';

import React from 'react';
import { useRouter } from 'next/navigation';

import { Box, Paper, Typography } from '@mui/material';

import { themeConfig } from 'src/theme';

import F2FIcons from '../f2ficons/f2ficons';
import BioBadge from '../bio-badge/bio-badge';

interface ProducerCardProps {
    producer: IProducerItem;
}

export default function ProducerCard(props: Readonly<ProducerCardProps>) {
    const { producer } = props;
    const router = useRouter();

    const openProductPage = () => {
        router.push(`/termelok/${producer.slug}`);
    };

    const producerCardStyle: SxProps<Theme> = {
        border: '1px solid #0000001A',
        borderRadius: '8px',
        boxShadow: '0px 2px 12px 0px #DFDBD14D',
        maxWidth: {
            xs: '100%',
            sm: 249,
            md: 249,
            lg: 249,
            xl: 249,
        },
        p: 0,
        backgroundColor: themeConfig.palette.common.white,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
    };

    const producerImageStyle: React.CSSProperties = {
        width: '100%',
        height: 249,
        objectFit: 'cover',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        cursor: 'pointer',
    };

    const producerCardDetailsUpperContainterStyle: React.CSSProperties = {
        padding: '32px 16px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
    };

    const producerCardDetailsUpperLabelContainerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        height: 52,
    };

    const producerCardNameStyle: React.CSSProperties = {
        fontSize: 18,
        fontWeight: 700,
        color: '#262626',
        lineHeight: '25px',
        fontFamily: themeConfig.fontFamily.primary,
        letterSpacing: '0em',
        margin: 0,
        cursor: 'pointer',
    };

    const producerCardPriceContentStyle: React.CSSProperties = {
        padding: '16px',
        display: 'flex',
        gap: 16,
    };

    const producerCardPriceDetailsStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
    };

    return (
        <Paper className="product-card" sx={producerCardStyle} onClick={openProductPage}>
            <img
                src={producer.featuredImage ?? 'https://placehold.co/429'}
                alt={producer.name}
                style={producerImageStyle}
            />

            {producer.bio && <BioBadge style={{ position: 'absolute', top: 16, right: 16 }} />}

            <div style={producerCardDetailsUpperContainterStyle}>
                <Box sx={producerCardDetailsUpperLabelContainerStyle} onClick={openProductPage}>
                    <h2 style={producerCardNameStyle}>{producer.name}</h2>
                </Box>
            </div>
            <div style={producerCardPriceContentStyle}>
                <div style={producerCardPriceDetailsStyle}>
                    <Typography display="flex" flexDirection="row" alignItems="center" gap="8px" sx={{color: '#7e7e7e', fontWeight: 500}}>
                        <F2FIcons name="Map" width={20} height={20} /> {producer.location}
                    </Typography>
                    <Typography
                        sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '14px', fontWeight: 400 }}
                    >
                        {producer.producingTags}
                    </Typography>
                </div>
            </div>
        </Paper>
    );
}
