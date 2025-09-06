import type { Metadata } from 'next';
import type { IFaqCategoryItem } from 'src/types/faq';

import { CONFIG } from 'src/global-config';
import { fetchFaqs, fetchFaqCategories } from 'src/actions/faq-ssr';

import { FaqListView } from 'src/sections/faqs/view/faqs-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `GYIK | Dashboard - ${CONFIG.appName}` };

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
        order: 0,
    } as IFaqCategoryItem;

    faqsCategories = [all].concat(faqsCategories ?? []);

    return <FaqListView faqList={faqs} faqCategories={faqsCategories} />;
}
