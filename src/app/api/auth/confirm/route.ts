import type { NextRequest} from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { paths } from "src/routes/paths";

import { supabaseSSR } from "src/lib/supabase-ssr";

export async function GET(request: NextRequest) {
    const {searchParams} = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const next = searchParams.get('next') ?? paths.auth.supabase.signIn;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

    const redirectTo = new URL(next, baseUrl);

    if(token_hash && type != null) {
        const cookieStore = await cookies();
        const supabase = await supabaseSSR(cookieStore);
        
        // For email confirmation links, use verifyOtp with token_hash and type
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type,
        });
        
        if(!error) {
            // Force a cookie refresh to ensure the session is properly set
            cookieStore.getAll();
            return NextResponse.redirect(redirectTo);
        }
        
        return NextResponse.redirect(new URL(paths.auth.supabase.signIn + '?error=' + encodeURIComponent(error.message), baseUrl));
    }
}