import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // vagy anon key, ha nincs jogosultságigény
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const limit = searchParams.get('limit') ?? '3';

  if (!q || q.trim() === '') {
    return NextResponse.json({ error: 'Hiányzik a keresési kifejezés' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('Products')
    .select('*, Producer:Producers!inner(*)')
    .eq('publish', true)
    .ilike(`name`, `%${q}%`)
    .or(`name.ilike.%${q}%`, {referencedTable: 'Producers'})
    //.or(`name.ilike.%${q}%,Producer.name.ilike.%${q}%`)
    .limit(parseInt(limit))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
