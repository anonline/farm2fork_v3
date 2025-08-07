import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { updateArticle } from 'src/actions/articles';

// POST api/articles/[id]
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await req.json();

    const { categoryIds, ...articleData } = body;
    
    if (!Array.isArray(categoryIds)) {
      throw new Error("A 'categoryIds' mezőnek egy tömbnek kell lennie.");
    }
    
    const data = await updateArticle(Number(id), articleData, categoryIds);

    return NextResponse.json(data);
  } catch (error) {
    const errorMessage =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message: string }).message
        : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}