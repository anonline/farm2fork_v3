import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { getOption } from 'src/actions/option-ssr';
import { getCategories, getCategoryById } from 'src/actions/category-ssr';

import CategoryEditView from 'src/sections/category/view/category-edit-view';

import { OptionsEnum } from 'src/types/option';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Kategória szerkesztés | Dashboard - ${CONFIG.appName}` };

type Props = {
    params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
    const { id } = await params;
    const category = await getCategoryById(Number(id));
    const maxFileSize = await getOption(OptionsEnum.MaxFileUploadSizeMB);
    const allCategories = await getCategories();

    return <CategoryEditView category={category ?? undefined} maxFileSize={Number(maxFileSize?.value ?? 3)} allCategories={allCategories} />;
}