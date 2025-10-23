"use server"

import { CONFIG } from "src/global-config";

export async function verifyCaptcha(recaptchaToken: string, action: string): Promise<boolean> {
    const projectKey = process.env.GOOGLE_PROJECT_KEY || 'farm2fork-v3';
    const googleApiKey = process.env.GOOGLE_API_KEY || 'YOUR-API-KEY';

    const recaptchaResponse = await fetch(
        `https://recaptchaenterprise.googleapis.com/v1/projects/${projectKey}/assessments?key=${googleApiKey}`,
        {
            method: "POST",
            body: JSON.stringify({
                event: {
                    token: recaptchaToken,
                    expectedAction: action,
                    siteKey: CONFIG.recaptchaSiteKey,
                },
            }),
        },
    );

    const recaptchaData = await recaptchaResponse.json();

    if (
        !recaptchaData?.riskAnalysis?.score ||
        recaptchaData?.tokenProperties?.valid !== true
    ) {
        console.log("Recaptcha failed", JSON.stringify(recaptchaData, null, 2));
        return false;
    }
    
    return true;
}