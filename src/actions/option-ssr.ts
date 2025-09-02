import type { Option, OptionsEnum } from 'src/types/option';

import { cookies } from 'next/headers';

import { supabaseSSR } from 'src/lib/supabase-ssr';

// ----------------------------------------------------------------------

const CACHE_TTL_MS = 5000; // cache time-to-live in milliseconds

type CachedOption = {
    value: Option<any> | null;
    expiresAt: number;
};

const optionCache = new Map<OptionsEnum, CachedOption>();

function refreshOptionCache(option: OptionsEnum) {
    optionCache.delete(option);
}
export async function getOption(option: OptionsEnum) {
    const now = Date.now();
    if (optionCache.has(option)) {
        const cachedOption = optionCache.get(option);
        if (cachedOption && cachedOption.expiresAt > now) {
            return cachedOption;
        }
        optionCache.delete(option);
    }
    const value = await fetchOption(option);

    optionCache.set(option, { value, expiresAt: now + CACHE_TTL_MS });
    return value;
}

export async function fetchOption(option: OptionsEnum) {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);

    const response = await supabase.from('Options').select('*').eq('name', option).maybeSingle();

    const { data, error: responseError } = response;

    let optionValue: Option<any> | null = null;
    if (data) {
        switch (data.type) {
            case 'number':
                optionValue = { ...data, value: Number(data.value) };
                break;
            case 'boolean':
                optionValue = { ...data, value: data.value === 'true' };
                break;
            default:
                optionValue = data;
        }
    }

    if (responseError) throw responseError.message;
    return optionValue;
}
