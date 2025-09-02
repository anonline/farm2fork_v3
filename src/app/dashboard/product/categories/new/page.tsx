import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { getOption } from 'src/actions/option-ssr';
import { getCategories } from 'src/actions/category-ssr';

import { CategoryCreateView } from 'src/sections/category/view/category-create-view';

import { OptionsEnum } from 'src/types/option';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Új kategória | Dashboard - ${CONFIG.appName}` };

export default async function Page() {
    const maxFileSize = await getOption(OptionsEnum.MaxFileUploadSizeMB);
    const categories = await getCategories();
    return (
        <CategoryCreateView
            maxFileSize={Number(maxFileSize?.value ?? 3)}
            allCategories={categories}
        />
    );
}
