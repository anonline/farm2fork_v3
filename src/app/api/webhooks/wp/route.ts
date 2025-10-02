import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import { supabaseSSR } from 'src/lib/supabase-ssr';
import { cookies } from 'next/headers';
import { WPTransferUser } from 'src/types/woocommerce/user';

export async function POST(request: NextRequest) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 403 });    
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);

    const result = [] as {
        id?: number;
        email: string;
        inserted: boolean;
        error: string | Error | null;
    }[];

    try {
        const body = await request.text();
        const data = JSON.parse(body) as WPTransferUser[];

        data.forEach(async (user) => {
            
            try {

                if (user.id === undefined || user.id === null) {
                    throw new Error('Missing user ID');
                }

                if (!user.password) {
                    throw new Error('Missing password');
                }

                if (!user.email) {
                    throw new Error('Missing email');
                }

                const { data: wp_users } = await supabase
                    .from('wp_users')
                    .select('*')
                    .eq('user_email', user.email)
                    .single();

                
                if(wp_users) {
                    throw new Error('WordPress user already exists');
                }

                const {error:insertError } = await supabase
                    .from('wp_users')
                    .insert(user);

                if(insertError) {
                    throw new Error('Error inserting user: ' + insertError.message);
                }

                result.push({
                    id: user.id,
                    email: user.email,
                    inserted: true,
                    error: null,
                });
            } catch (err: Error | any) {
                console.error(err);

                result.push({
                    id: user.id,
                    email: user.email,
                    inserted: false,
                    error: err instanceof Error ? err.message : err,
                });
            }
        });
        
        return NextResponse.json(result);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
}



