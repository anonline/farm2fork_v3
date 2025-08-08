import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import CategoryListView from 'src/sections/blog/view/category-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Kategóriák Kezelése | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <CategoryListView />;
}