"use client";

import Script from "next/script";

import { CONFIG } from "src/global-config";

declare global {
    const grecaptcha: {
        enterprise: {
            ready: (cb: () => void) => void;
            execute: (
                siteKey: string,
                options: { action: string }
            ) => Promise<string>;
        };
    };
}
interface Props {
    action: string;
}

export function captchaWrapper({ action }: Readonly<Props>) {
    const siteKey = CONFIG.recaptchaSiteKey;
    const executeRecaptcha = () => {
        if (typeof grecaptcha !== "undefined") {
            grecaptcha.enterprise.ready(async () => {
                try {
                    const token = await grecaptcha.enterprise.execute(
                        siteKey,
                        { action }
                    );
                    const tokenInput = document.getElementById(
                        "recaptcha-token"
                    ) as HTMLInputElement;
                    if (tokenInput) tokenInput.value = token;
                } catch (e) {
                    console.error("Recaptcha error", e);
                }
            });
        }
    };

    return (
        <>
            <Script
                src={`https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`}
                strategy="afterInteractive"
                onLoad={executeRecaptcha}
            />
            <input type="hidden" name="recaptchaToken" id="recaptcha-token" />
        </>
    );
}