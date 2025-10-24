import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { languages as locales, fallbackLng as defaultLocale } from './locales';

type Locale = (typeof locales)[number];

function getLocaleFromPath(pathname: string): { locale: Locale | null; pathnameWithoutLocale: string } {
    // Ellenőrizzük, hogy az URL tartalmaz-e nyelv prefix-et
    for (const locale of locales) {
        if (pathname === `/${locale}`) {
            return { locale, pathnameWithoutLocale: '/' };
        }
        if (pathname.startsWith(`/${locale}/`)) {
            return { locale, pathnameWithoutLocale: pathname.slice(locale.length + 1) };
        }
    }
    
    return { locale: null, pathnameWithoutLocale: pathname };
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Statikus fájlok és API útvonalak kihagyása
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/assets') ||
        pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
    ) {
        return NextResponse.next();
    }

    // Ellenőrizzük az URL-ben lévő nyelv prefix-et
    const { locale, pathnameWithoutLocale } = getLocaleFromPath(pathname);
    console.log('Detected locale in middleware:', locale);

    let response: NextResponse;

    // Ha van nyelv prefix az URL-ben
    if (locale && locale !== defaultLocale) {
        // REWRITE (nem redirect!): átírjuk az URL-t a Next.js számára
        // De a böngésző továbbra is az eredeti URL-t látja
        const url = request.nextUrl.clone();
        url.pathname = pathnameWithoutLocale;
        
        response = NextResponse.rewrite(url);
        
        // Beállítjuk a cookie-t a nyelvvel
        response.cookies.set('i18next', locale, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 év
        });
    } 
    // Ha magyar prefix van (ami nem kell)
    else if (locale === defaultLocale) {
        // Magyar esetén átirányítjuk prefix nélkülre
        const url = request.nextUrl.clone();
        url.pathname = pathnameWithoutLocale;
        
        response = NextResponse.redirect(url);
        
        response.cookies.set('i18next', defaultLocale, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365,
        });
    }
    // Ha nincs nyelv prefix (normál magyar oldal)
    else {
        response = NextResponse.next();
        
        // Beállítjuk a magyar cookie-t, ha még nincs
        const currentCookie = request.cookies.get('i18next')?.value;
        if (!currentCookie || currentCookie !== defaultLocale) {
            response.cookies.set('i18next', defaultLocale, {
                path: '/',
                maxAge: 60 * 60 * 24 * 365,
            });
        }
    }

    // Hozz létre egy szerveroldali supabase klienst a middleware kontextusában
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    // Frissíti a felhasználó session-jét, ha lejárt.
    await supabase.auth.getSession();

    return response;
}

// Biztosítja, hogy a middleware minden útvonalon lefusson, kivéve
// a statikus asseteket és a Next.js belső útvonalait.
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.svg (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.svg).*)',
    ],
};
