'use server';

import type { IAddressItem } from 'src/types/common';
import type { IOrderData } from 'src/types/order-management';
import type { 
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
    DocumentService,
    DocumentLanguage,
    DocumentInsertType,
    PaymentMethod as BillingoPaymentMethod
} from '@codingsans/billingo-client';

// ----------------------------------------------------------------------

// Add Billingo API key
function addBillingoApiKey() {
    const apiKey = '8f0a70aa-6deb-11f0-a720-0adb4fd9a356';
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
            return BillingoPaymentMethod.CASH_ON_DELIVERY;
        case 'wire':
        case 'bank_transfer':
            return BillingoPaymentMethod.WIRE_TRANSFER;
        case 'online':
        case 'card':
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
    
    // First try to find existing partner by name
    try {
        const partnerList = await PartnerService.listPartner(1, 100, customerName);
        const existingPartner = partnerList.data?.find(p => p.name === customerName);
        
        if (existingPartner && existingPartner.id) {
            return existingPartner.id;
        }
    } catch (error) {
        console.warn('Error searching for existing partner:', error);
    }
    
    // Create new partner if not found
    try {
        // Prepare partner data with proper validation
        const partnerData: any = {
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
            // Try to parse Hungarian address format
            const addressParts = billingAddress.fullAddress.split(',').map(part => part.trim());
            let city = '';
            let postCode = '';
            let streetAddress = billingAddress.fullAddress;

            // Try to extract postal code (Hungarian format: 4 digits)
            const postCodeMatch = billingAddress.fullAddress.match(/\b\d{4}\b/);
            if (postCodeMatch) {
                postCode = postCodeMatch[0];
            }

            // Try to extract city (usually after postal code or in separate part)
            for (const part of addressParts) {
                // Look for part that starts with postal code
                if (/^\d{4}/.test(part)) {
                    city = part.replace(/^\d{4}\s*/, '').trim();
                    break;
                }
            }

            // If no city found, try last part
            if (!city && addressParts.length > 1) {
                city = addressParts[addressParts.length - 1].replace(/\b\d{4}\b/, '').trim();
            }

            // Extract street address (everything before postal code and city)
            if (postCode && city) {
                streetAddress = billingAddress.fullAddress
                    .replace(new RegExp(`\\b${postCode}\\b.*$`), '')
                    .trim();
            }

            // Fallback values if parsing fails
            if (!postCode) postCode = '1000'; // Budapest default
            if (!city) city = 'Budapest';
            if (!streetAddress || streetAddress === billingAddress.fullAddress) {
                streetAddress = 'N/A'; // Fallback if we couldn't parse street
            }

            // Only add address if we have meaningful data
            partnerData.address = {
                country_code: Country.HU,
                post_code: postCode,
                city,
                address: streetAddress,
            };
        } else {
            // If no billing address available, provide a minimal default address
            // This ensures Billingo gets all required fields
            partnerData.address = {
                country_code: Country.HU,
                post_code: '1000',
                city: 'Budapest',
                address: 'N/A',
            };
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
            invoiceItems.push({
                name: item.name,
                unit_price: Math.round(item.netPrice), // Round to 2 decimals
                unit_price_type: UnitPriceType.GROSS,
                quantity: item.quantity,
                unit: 'db', // piece
                vat: Vat._27_, // 27% VAT for food products in Hungary
            });
        });
        
        // Add shipping as separate line item if it costs more than 0
        if (orderData.shippingCost && orderData.shippingCost > 0) {
            invoiceItems.push({
                name: 'Szállítási költség',
                unit_price: orderData.shippingCost,
                unit_price_type: UnitPriceType.GROSS,
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
            paid: orderData.paymentStatus === 'closed',
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
        
        console.log('Created Billingo invoice:', invoice);
        
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