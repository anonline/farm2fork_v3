import type { Currency } from 'simplepay-js-sdk'

import crypto from 'crypto'

/**
 * SimplePay Finish Transaction Types
 */
export interface FinishTransactionData {
  /** Either orderRef or transactionId must be provided to identify the transaction */
  orderRef?: string
  /** Either orderRef or transactionId must be provided to identify the transaction */
  transactionId?: string
  /** Original amount that was reserved/captured */
  originalTotal: number | string
  /** 
   * Amount to actually charge:
   * - Full originalTotal: charges the full reserved amount
   * - Less than originalTotal but > 0: charges partial amount, releases the rest
   * - 0: releases the full reserved amount
   */
  approveTotal: number | string
  /** Currency (defaults to HUF) */
  currency?: Currency
}

export interface FinishTransactionConfig {
  /** Optional merchant account override */
  merchantAccount?: string
}

export interface SimplePayFinishRequestBody {
  salt: string
  merchant: string
  orderRef?: string
  transactionId?: string
  originalTotal: string
  approveTotal: string
  currency: Currency
  sdkVersion: string
}

export interface SimplePayFinishResponse {
  salt: string
  merchant: string
  orderRef?: string
  transactionId?: string
  originalTotal: string
  approveTotal: string
  currency: Currency
  status: 'FINISHED' | 'ERROR'
  errorCodes?: string[]
}

/**
 * SimplePay finish utility functions
 */

const simplepayLogger = (...args: any[]) => {
    if (process.env.SIMPLEPAY_LOGGER !== 'true') {
        return
    }
    console.log('👉 SimplePay Finish:', ...args)
}

const getSimplePayConfig = (currency: Currency) => {
    const CURRENCIES = ['HUF', 'HUF_SZEP', 'EUR', 'USD'] as const
    
    if (!CURRENCIES.includes(currency)) {
        throw new Error(`Unsupported currency: ${currency}`)
    }

    const SIMPLEPAY_API_URL = 'https://secure.simplepay.hu/payment/v2'
    const SIMPLEPAY_SANDBOX_URL = 'https://sandbox.simplepay.hu/payment/v2'
    const SDK_VERSION = 'SimplePay_Finish_TS_1.0.0'
    
    const MERCHANT_KEY = process.env.NEXT_PUBLIC_SIMPLEPAY_MERCHANT_KEY_HUF
    const MERCHANT_ID = process.env.NEXT_PUBLIC_SIMPLEPAY_MERCHANT_ID_HUF

    const API_URL = process.env.NEXT_PUBLIC_SIMPLEPAY_PRODUCTION === 'true' ? SIMPLEPAY_API_URL : SIMPLEPAY_SANDBOX_URL
    const API_URL_FINISH = API_URL + '/finish'
    
    return {
        MERCHANT_KEY,
        MERCHANT_ID,
        API_URL_FINISH,
        SDK_VERSION
    }
}

const prepareRequestBody = (body: any) =>
    JSON.stringify(body).replace(/\//g, '\\/')

const generateSignature = (body: string, merchantKey: string) => {
    const hmac = crypto.createHmac('sha384', merchantKey.trim())
    hmac.update(body, 'utf8')
    return hmac.digest('base64')
}

const checkSignature = (responseText: string, signature: string, merchantKey: string) =>
    signature === generateSignature(responseText, merchantKey)

/**
 * Finish a SimplePay transaction
 * 
 * This function completes or cancels a previously initiated SimplePay transaction.
 * Key parameters:
 * - originalTotal: must exactly match the reserved amount
 * - approveTotal: determines the final charge:
 *   - Full amount: charges the entire reservation
 *   - Partial amount: charges partial, releases the rest
 *   - Zero: releases the entire reservation
 * 
 * @param finishData Transaction data including amounts and identifiers
 * @param config Optional configuration overrides
 * @returns Promise<SimplePayFinishResponse>
 */
export const finishTransaction = async (
    finishData: FinishTransactionData, 
    config: FinishTransactionConfig = {}
): Promise<SimplePayFinishResponse> => {
    simplepayLogger({ function: 'SimplePay/finishTransaction', finishData, config })
    console.log({ function: 'SimplePay/finishTransaction', finishData, config });
    // Validation
    if (!finishData.orderRef && !finishData.transactionId) {
        throw new Error('Either orderRef or transactionId must be provided')
    }
    
    if (finishData.originalTotal === undefined || finishData.approveTotal === undefined) {
        throw new Error('Both originalTotal and approveTotal are required')
    }

    const currency = finishData.currency || 'HUF'
    const { MERCHANT_KEY, MERCHANT_ID, API_URL_FINISH, SDK_VERSION } = getSimplePayConfig(currency)
    
    simplepayLogger({ 
        function: 'SimplePay/finishTransaction', 
        MERCHANT_KEY: MERCHANT_KEY ? '***' : undefined, 
        MERCHANT_ID, 
        API_URL_FINISH 
    })

    if (!MERCHANT_KEY || !MERCHANT_ID) {
        throw new Error(`Missing SimplePay configuration for ${currency}, ${MERCHANT_KEY} ${MERCHANT_ID}`)
    }

    const requestBody: SimplePayFinishRequestBody = {
        salt: crypto.randomBytes(16).toString('hex'),
        merchant: config.merchantAccount || MERCHANT_ID,
        currency: currency.replace('_SZEP', '') as Currency,
        originalTotal: String(finishData.originalTotal),
        approveTotal: String(finishData.approveTotal),
        sdkVersion: SDK_VERSION,
        ...(finishData.orderRef && { orderRef: finishData.orderRef }),
        ...(finishData.transactionId && { transactionId: finishData.transactionId }),
    }

    return makeFinishRequest(API_URL_FINISH, requestBody, MERCHANT_KEY)
}

const makeFinishRequest = async (
    apiUrl: string, 
    requestBody: SimplePayFinishRequestBody, 
    merchantKey: string
): Promise<SimplePayFinishResponse> => {
    const bodyString = prepareRequestBody(requestBody)
    const signature = generateSignature(bodyString, merchantKey)
    
    simplepayLogger({ function: 'SimplePay/makeFinishRequest', bodyString, signature: '***' })

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Signature': signature,
            },
            body: bodyString,
        })

        simplepayLogger({ function: 'SimplePay/makeFinishRequest', status: response.status, ok: response.ok })

        if (!response.ok) {
            throw new Error(`SimplePay API error: ${response.status}`)
        }

        const responseSignature = response.headers.get('Signature')
        if (!responseSignature) {
            throw new Error('Missing response signature')
        }

        const responseText = await response.text()
        const responseJSON = JSON.parse(responseText) as SimplePayFinishResponse
        
        simplepayLogger({ 
            function: 'SimplePay/makeFinishRequest', 
            responseJSON: { ...responseJSON, merchant: '***' } 
        })

        if (responseJSON.errorCodes && responseJSON.errorCodes.length > 0) {
            throw new Error(`SimplePay API error: ${responseJSON.errorCodes.join(', ')}`)
        }

        if (!checkSignature(responseText, responseSignature, merchantKey)) {
            throw new Error('Invalid response signature')
        }

        return responseJSON

    } catch (error) {
        simplepayLogger({ function: 'SimplePay/makeFinishRequest', error: error instanceof Error ? error.message : error })
        throw error
    }
}

/**
 * Helper function to fully charge a transaction
 */
export const fullyChargeTransaction = (
    orderRef: string, 
    originalTotal: number | string,
    config?: FinishTransactionConfig
) => 
    finishTransaction({
        orderRef,
        originalTotal,
        approveTotal: originalTotal
    }, config)

/**
 * Helper function to partially charge a transaction
 */
export const partiallyChargeTransaction = (
    orderRef: string,
    originalTotal: number | string,
    approveTotal: number | string,
    config?: FinishTransactionConfig
) => 
    finishTransaction({
        orderRef,
        originalTotal,
        approveTotal
    }, config)

/**
 * Helper function to fully release/cancel a transaction
 */
export const cancelTransaction = (
    orderRef: string,
    originalTotal: number | string,
    config?: FinishTransactionConfig
) => 
    finishTransaction({
        orderRef,
        originalTotal,
        approveTotal: 0
    }, config)
