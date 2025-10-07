'use client';

import Script from 'next/script';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export function GoogleAnalytics() {
    const measurementId = CONFIG.googleAnalytics.measurementId;

    // Don't render if no measurement ID is configured
    if (!measurementId) {
        return null;
    }

    return (
        <>
            {/* Google tag (gtag.js) */}
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${measurementId}', {
                            page_path: window.location.pathname,
                        });
                    `,
                }}
            />
        </>
    );
}
