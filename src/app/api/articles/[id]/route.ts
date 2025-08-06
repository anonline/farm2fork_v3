import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import { IArticleItem } from 'src/types/article';
import { updateArticle } from 'src/actions/articles';

// POST api/articles/[id]
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const body = (await req.json()) as IArticleItem;

    try {
        const data = await updateArticle(Number(id), body);
        return NextResponse.json(data);
    } catch (error) {
        const errorMessage =
            typeof error === 'object' && error !== null && 'message' in error
                ? (error as { message: string }).message
                : String(error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
