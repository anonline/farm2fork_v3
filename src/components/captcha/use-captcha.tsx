"use client";

import Script from "next/script";
import { useState, useEffect } from "react";

import { CONFIG } from "src/global-config";

declare global {
    interface Window {
        grecaptcha: {
            enterprise: {
                ready: (cb: () => void) => void;
                execute: (
                    siteKey: string,
                    options: { action: string }
                ) => Promise<string>;
            };
        };
    }
}

interface UseCaptchaReturn {
    executeRecaptcha: () => Promise<string | null>;
    scriptElement: React.ReactElement | null;
    isReady: boolean;
}

export function useCaptcha(action: string): UseCaptchaReturn {
    const [isReady, setIsReady] = useState(false);
    const siteKey = CONFIG.recaptchaSiteKey;

    useEffect(() => {
        // Check if grecaptcha is already loaded
        if (globalThis.window !== undefined && globalThis.window.grecaptcha?.enterprise) {
            setIsReady(true);
        }
    }, []);

    const executeRecaptcha = async (): Promise<string | null> => {
        if (!siteKey) {
            console.warn('ReCAPTCHA site key is not configured');
            return null;
        }

        return new Promise((resolve) => {
            if (globalThis.window === undefined || !globalThis.window.grecaptcha?.enterprise) {
                console.error('ReCAPTCHA not loaded');
                resolve(null);
                return;
            }

            globalThis.window.grecaptcha.enterprise.ready(async () => {
                try {
                    const token = await globalThis.window.grecaptcha.enterprise.execute(siteKey, {
                        action,
                    });
                    resolve(token);
                } catch (error) {
                    console.error('ReCAPTCHA execution error:', error);
                    resolve(null);
                }
            });
        });
    };

    const handleScriptLoad = () => {
        setIsReady(true);
    };

    const scriptElement = siteKey ? (
        <Script
            src={`https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`}
            strategy="afterInteractive"
            onLoad={handleScriptLoad}
        />
    ) : null;

    return {
        executeRecaptcha,
        scriptElement,
        isReady,
    };
}
