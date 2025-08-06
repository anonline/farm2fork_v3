import type { NextRequest } from 'next/server';
import type { IArticleItem } from 'src/types/article';

import { NextResponse } from 'next/server';

import { insertNewArticle } from 'src/actions/articles';

// POST api/articles
export async function POST(req: NextRequest) {
    const body = await req.json() as IArticleItem;

    try {
        const data = await insertNewArticle(body);
        return NextResponse.json(data);
    } catch (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message: string }).message
            : String(error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
