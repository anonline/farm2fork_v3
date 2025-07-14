import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // vagy anon key, ha nincs jogosultságigény
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')

  if (!q) {
    return NextResponse.json({ error: 'Hiányzik a keresési kifejezés' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('Producers')
    .select('*')
    .or(`name.ilike.%${q}%,location.ilike.%${q}%,shortDescription.ilike.%${q}%,producingTags.ilike.%${q}%,companyName.ilike.%${q}%`)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
