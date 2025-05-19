'use client';

import type { IFaqItem, IFaqCategoryItem } from 'src/types/faq';

import Container from '@mui/material/Container';

import { FaqsHero } from '../faqs-hero';
import { FaqsCategory } from '../faqs-category';

// ----------------------------------------------------------------------
type FaqsViewProps = {
    faqs: IFaqItem[];
    faqCategories: IFaqCategoryItem[];
}

export function FaqsView({faqs, faqCategories}:Readonly<FaqsViewProps>) {
    return (
        <>
            <FaqsHero />
            <Container
                component="section"
                sx={{ pb: 10, position: 'relative', pt: { xs: 10, md: 5 } }}
            >
                <FaqsCategory faqCategories={faqCategories} faqs={faqs}/>
            </Container>
        </>
    );
}
