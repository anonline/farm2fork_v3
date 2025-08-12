import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ArticlesProvider } from 'src/contexts/articles-context';

import PostListView from 'src/sections/blog/view/post-list-view';


// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Hírek kezelése | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return (
        <ArticlesProvider>
            <PostListView />
        </ArticlesProvider>
    )
}
