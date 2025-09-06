import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { CONFIG } from 'src/global-config';

import { PostEditView } from 'src/sections/blog/view';
import { getPostById } from 'src/sections/blog/view/get-post-by-ip';

export const metadata: Metadata = { title: `Post edit | Dashboard - ${CONFIG.appName}` };

type Props = {
    params: Promise<{ id: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
    const { id } = await params;

    const { post } = await getPostById(id);

    if (post == null) {
        console.log('Id:', id);
        notFound();
    }

    return <PostEditView post={post} />;
}
