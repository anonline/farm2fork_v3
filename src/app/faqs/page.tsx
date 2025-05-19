import type { Metadata } from 'next';
import { fetchFaqCategories, fetchFaqs } from 'src/actions/faq-ssr';

import { CONFIG } from 'src/global-config';

import { FaqsView } from 'src/sections/faqs/view';
import { IFaqCategoryItem } from 'src/types/faq';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `GYIK - ${CONFIG.appName}` };

export default async function Page() {
    const faqs = await fetchFaqs();
    let faqsCategories = await fetchFaqCategories();
    if (faqs && faqsCategories) {
        faqs.forEach((faq) => {
            const faqCategory = faqsCategories.find((cat) => cat.id == faq.faqCategoryId);

            faq.faqCategory = faqCategory ? { ...faqCategory } : null;
        });
    }

    const all = {
        id: -1,
        name: 'Összes',
        icon: '',
        order: 0
    } as IFaqCategoryItem

    faqsCategories = [all].concat(faqsCategories ?? []);
    console.log(faqsCategories);
    return <FaqsView faqs={faqs} faqCategories={faqsCategories}/>;
}
