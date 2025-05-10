'use client';

import Container from '@mui/material/Container';

import { FaqsHero } from '../faqs-hero';
import { FaqsCategory } from '../faqs-category';

// ----------------------------------------------------------------------

export function FaqsView() {
    return (
        <>
            <FaqsHero />
            <Container
                component="section"
                sx={{ pb: 10, position: 'relative', pt: { xs: 10, md: 5 } }}
            >
                <FaqsCategory />
            </Container>
        </>
    );
}
