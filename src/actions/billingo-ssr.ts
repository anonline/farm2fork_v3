'use server';

import type { IAddressItem } from 'src/types/common';
import type { IOrderData } from 'src/types/order-management';
import type {
    Partner,
    DocumentInsert,
    DocumentProductData
} from '@codingsans/billingo-client';

import {
    Vat,
    OpenAPI,
    Country,
    Currency,
    UnitPriceType,
    PartnerService,
    PartnerTaxType,
    DocumentService,
    DocumentLanguage,
    DocumentInsertType,
    PaymentMethod as BillingoPaymentMethod,
} from '@codingsans/billingo-client';

// ----------------------------------------------------------------------

// Add Billingo API key
function addBillingoApiKey() {
    const apiKey = '1d194930-a333-11f0-ba86-0ac27c983f59';
    if (apiKey) {
        OpenAPI.HEADERS = {
            'X-API-KEY': apiKey,
        };
    }
}

// Map payment method from our system to Billingo
function mapPaymentMethod(paymentMethodSlug?: string): BillingoPaymentMethod {
    switch (paymentMethodSlug) {
        case 'cod':
        case 'utanvet':
            return BillingoPaymentMethod.CASH_ON_DELIVERY;
        case 'wire':
        case 'bank_transfer':
        case 'utalas':
            return BillingoPaymentMethod.WIRE_TRANSFER;
        case 'online':
        case 'card':
        case 'simple':
            return BillingoPaymentMethod.ONLINE_BANKCARD;
        case 'cash':
            return BillingoPaymentMethod.CASH;
        default:
            return BillingoPaymentMethod.OTHER;
    }
}

// Create or find partner in Billingo
async function createOrFindPartner(customerName: string, billingAddress: IAddressItem | null, orderData: IOrderData): Promise<number> {
    addBillingoApiKey();

    let existingPartner: Partner | undefined;
    // First try to find existing partner by name
    try {
        const partnerList = await PartnerService.listPartner(1, 100, customerName);
        existingPartner = partnerList.data?.find(p =>
            (p.tax_type == PartnerTaxType.HAS_TAX_NUMBER && p.taxcode === billingAddress?.taxNumber)
            || (p.tax_type == PartnerTaxType.NO_TAX_NUMBER && p.emails?.includes(billingAddress?.email || ''))
        );

    } catch (error) {
        console.warn('Error searching for existing partner:', error);
    }

    // Create new partner if not found
    try {
        if (existingPartner?.id) {
            existingPartner.name = existingPartner.name !== customerName ? existingPartner.name : customerName;
            existingPartner.emails = billingAddress?.email ? [billingAddress.email] : existingPartner.emails;
            existingPartner.phone = billingAddress?.phoneNumber ? billingAddress.phoneNumber : existingPartner.phone;
            existingPartner.address = existingPartner.address || (billingAddress?.fullAddress ? {
                country_code: Country.HU,
                post_code: billingAddress.postcode || '',
                city: billingAddress.city || '',
                address: ((billingAddress.street || '') + ' ' + (billingAddress.houseNumber || '') + ' ' + (billingAddress.doorbell || '')).trim(),
            } : undefined);

            const updatedPartner = await PartnerService.updatePartner(existingPartner.id, existingPartner);
            if (updatedPartner.id) {
                return updatedPartner.id;
            }
        }

        // Prepare partner data with proper validation
        const partnerData: Partner = {
            name: customerName,
        };

        // Add emails if available
        if (orderData.billingEmails.length > 0) {
            partnerData.emails = orderData.billingEmails;
        }

        // Add phone if available
        if (billingAddress?.phoneNumber) {
            partnerData.phone = billingAddress.phoneNumber;
        }

        // Add address if available - ALL fields are required if address is provided
        if (billingAddress?.fullAddress) {
            // If no billing address available, provide a minimal default address
            // This ensures Billingo gets all required fields
            partnerData.address = {
                country_code: Country.HU,
                post_code: billingAddress.postcode || '',
                city: billingAddress.city || '',
                address: ((billingAddress.street || '') + ' ' + (billingAddress.houseNumber || '') + ' ' + (billingAddress.doorbell || '')).trim(),
            };
        }

        if (billingAddress?.taxNumber) {
            partnerData.taxcode = billingAddress.taxNumber;
            partnerData.tax_type = PartnerTaxType.HAS_TAX_NUMBER;
        }
        else {
            partnerData.tax_type = PartnerTaxType.NO_TAX_NUMBER;
        }

        console.log('Creating partner with data:', partnerData);

        const newPartner = await PartnerService.createPartner(partnerData);

        if (newPartner.id) {
            return newPartner.id;
        }

        throw new Error('Failed to create partner - no ID returned');
    } catch (error) {
        console.error('Error creating partner in Billingo:', error);

        // Log detailed validation errors if available
        if (error && typeof error === 'object' && 'body' in error) {
            console.error('Billingo validation errors:', error.body);
        }

        throw new Error('Failed to create customer in Billingo');
    }
}

/**
 * Create invoice in Billingo - Server Action
 */
export async function createBillingoInvoiceSSR(orderData: IOrderData): Promise<{ success: boolean; invoiceId?: number; downloadUrl?: string; error?: string; response?: any }> {
    try {
        addBillingoApiKey();

        // Create or find partner
        const partnerId = await createOrFindPartner(orderData.customerName, orderData.billingAddress, orderData);

        // Calculate due date (add payment due days to current date)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (orderData.paymentDueDays || 30));

        // Prepare invoice items
        const invoiceItems: DocumentProductData[] = [];

        // Add order items
        orderData.items.forEach((item) => {
            const vatPercent = item.vatPercent || item.netPrice ? Math.round((item.grossPrice - item.netPrice) / item.netPrice * 100) : 27;

            invoiceItems.push({
                name: item.name,
                unit_price: item.grossPrice, // Round to 2 decimals
                unit_price_type: UnitPriceType.GROSS,
                quantity: Math.round(item.quantity * 100) / 100,
                unit: item.unit || 'db', // piece
                vat: ItemVatToBillingoVat(vatPercent || 27),
                comment: item.note || undefined,
            });
        });

        // Add shipping as separate line item if it costs more than 0
        if (orderData.shippingCost && orderData.shippingCost > 0) {
            invoiceItems.push({
                name: 'Szállítási költség',
                unit_price: Math.round(orderData.shippingCost * 100) / 100,
                unit_price_type: UnitPriceType.GROSS,
                quantity: 1,
                unit: 'db',
                vat: Vat._27_,
            });
        }

        if (orderData.discountTotal > 0) {
            invoiceItems.push({
                name: 'Kedvezmény',
                unit_price: -Math.round(orderData.discountTotal / 1.27 * 100) / 100,
                unit_price_type: UnitPriceType.NET,
                quantity: 1,
                unit: 'db',
                vat: Vat._27_,
            });
        }

        // Prepare invoice data
        const invoiceData: DocumentInsert = {
            partner_id: partnerId,
            block_id: 0, // Default block
            type: DocumentInsertType.INVOICE,
            fulfillment_date: new Date().toISOString().split('T')[0], // Today
            due_date: dueDate.toISOString().split('T')[0],
            payment_method: mapPaymentMethod(orderData.paymentMethod?.slug),
            language: DocumentLanguage.HU,
            currency: Currency.HUF,
            conversion_rate: 1,
            electronic: true,
            paid: orderData.paymentStatus === 'closed' || mapPaymentMethod(orderData.paymentMethod?.slug) === BillingoPaymentMethod.ONLINE_BANKCARD,
            items: invoiceItems,
            comment: orderData.note || '',
        };

        // Create the invoice
        const invoice = await DocumentService.createDocument(invoiceData);

        if (!invoice.id) {
            throw new Error('Invoice creation failed - no ID returned');
        }

        // Get the download URL for the invoice
        let downloadUrl: string | undefined;
        try {
            const urlResponse = await DocumentService.getPublicUrl(invoice.id);
            downloadUrl = urlResponse.public_url;
            console.log('Got Billingo download URL:', downloadUrl);
        } catch (urlError) {
            console.warn('Failed to get download URL:', urlError);
            // Don't fail the whole operation if URL retrieval fails
        }

        console.log('Created Billingo invoice:', invoice.id, 'for order', orderData.id);

        const response = {
            success: true,
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoice_number,
            downloadUrl,
            partnerId,
            totalAmount: orderData.total,
            currency: 'HUF',
            createdAt: new Date().toISOString(),
        };

        return response;

    } catch (error) {
        console.error('Error creating Billingo invoice:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Cancel/Storno an invoice in Billingo - Server Action
 */
export async function stornoBillingoInvoiceSSR(invoiceId: number): Promise<{ success: boolean; stornoInvoiceId?: number; error?: string; response?: any }> {
    try {
        addBillingoApiKey();

        // Cancel the invoice using Billingo's cancel endpoint
        // This creates a storno (cancellation) document automatically
        const stornoInvoice = await DocumentService.cancelDocument(invoiceId);

        if (!stornoInvoice.id) {
            throw new Error('Storno invoice creation failed - no ID returned');
        }

        console.log('Created Billingo storno invoice:', stornoInvoice);

        const response = {
            success: true,
            stornoInvoiceId: stornoInvoice.id,
            stornoInvoiceNumber: stornoInvoice.invoice_number,
            originalInvoiceId: invoiceId,
            createdAt: new Date().toISOString(),
        };

        return response;

    } catch (error) {
        console.error('Error creating Billingo storno invoice:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to cancel invoice'
        };
    }
}

function ItemVatToBillingoVat(vat: number): Vat {
    switch (vat) {
        case 0: return Vat._0_;
        case 1: return Vat._1_;
        case 2: return Vat._2_;
        case 3: return Vat._3_;
        case 4: return Vat._4_;
        case 5: return Vat._5_;
        case 5.5: return Vat._5_5_;
        case 6: return Vat._6_;
        case 7: return Vat._7_;
        case 7.7: return Vat._7_7_;
        case 8: return Vat._8_;
        case 9: return Vat._9_;
        case 9.5: return Vat._9_5_;
        case 10: return Vat._10_;
        case 11: return Vat._11_;
        case 12: return Vat._12_;
        case 13: return Vat._13_;
        case 14: return Vat._14_;
        case 15: return Vat._15_;
        case 16: return Vat._16_;
        case 17: return Vat._17_;
        case 18: return Vat._18_;
        case 19: return Vat._19_;
        case 20: return Vat._20_;
        case 21: return Vat._21_;
        case 22: return Vat._22_;
        case 23: return Vat._23_;
        case 24: return Vat._24_;
        case 25: return Vat._25_;
        case 26: return Vat._26_;
        default: return Vat._27_;
    }
}