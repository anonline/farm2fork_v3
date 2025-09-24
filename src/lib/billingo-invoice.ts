import type { IAddressItem } from 'src/types/common';
import type { IOrderData } from 'src/types/order-management';
import type { 
    DocumentInsert,
    PaymentHistory,
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
async function createOrFindPartner(customerName: string, billingAddress: IAddressItem | null): Promise<number> {
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
        const newPartner = await PartnerService.createPartner({
            name: customerName,
            address: billingAddress ? {
                country_code: Country.HU, // Hungary
                post_code: '', // Will be extracted from fullAddress if needed
                city: '', // Will be extracted from fullAddress if needed
                address: billingAddress.fullAddress || '',
            } : undefined,
            emails: [],
            phone: billingAddress?.phoneNumber || '',
            taxcode: '', // Can be added later if needed
        });
        
        if (newPartner.id) {
            return newPartner.id;
        }
        
        throw new Error('Failed to create partner - no ID returned');
    } catch (error) {
        console.error('Error creating partner in Billingo:', error);
        throw new Error('Failed to create customer in Billingo');
    }
}

// Create invoice in Billingo
export async function createBillingoInvoice(orderData: IOrderData): Promise<{ success: boolean; invoiceId?: number; error?: string }> {
    try {
        addBillingoApiKey();
        
        // Create or find partner
        const partnerId = await createOrFindPartner(orderData.customerName, orderData.billingAddress);
        
        // Calculate due date (add payment due days to current date)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (orderData.paymentDueDays || 30));
        
        // Prepare invoice items
        const invoiceItems: DocumentProductData[] = [];
        
        // Add order items
        orderData.items.forEach(item => {
            invoiceItems.push({
                name: item.name,
                unit_price: item.netPrice,
                unit_price_type: UnitPriceType.NET,
                quantity: item.quantity,
                unit: item.unit || 'db',
                vat: Vat._27_, // 27% VAT - adjust as needed
                comment: item.note || undefined,
            });
        });
        
        // Add shipping as separate line item if cost > 0
        if (orderData.shippingCost && orderData.shippingCost > 0) {
            invoiceItems.push({
                name: orderData.shippingMethod?.name || 'Szállítás',
                unit_price: orderData.shippingCost,
                unit_price_type: UnitPriceType.NET,
                quantity: 1,
                unit: 'db',
                vat: Vat._27_, // 27% VAT - adjust as needed
                comment: 'Szállítási költség',
            });
        }
        
        // Add surcharge if any
        if (orderData.surchargeAmount && orderData.surchargeAmount > 0) {
            invoiceItems.push({
                name: 'Pótdíj',
                unit_price: orderData.surchargeAmount,
                unit_price_type: UnitPriceType.NET,
                quantity: 1,
                unit: 'db',
                vat: Vat._27_, // 27% VAT - adjust as needed
                comment: 'Egyéb pótdíj',
            });
        }
        
        // Prepare invoice data
        const invoiceData: DocumentInsert = {
            partner_id: partnerId,
            block_id: 1, // Default block ID - you may need to adjust this
            type: DocumentInsertType.INVOICE,
            fulfillment_date: new Date().toISOString().split('T')[0], // Today's date
            due_date: dueDate.toISOString().split('T')[0],
            payment_method: mapPaymentMethod(orderData.paymentMethod?.slug),
            language: DocumentLanguage.HU,
            currency: Currency.HUF,
            electronic: true,
            paid: orderData.paymentStatus === 'closed', // Set as paid if payment status is closed
            items: invoiceItems,
            comment: orderData.note ? `Rendelés: ${orderData.id}\n${orderData.note}` : `Rendelés: ${orderData.id}`,
            vendor_id: orderData.id, // Use order ID as vendor ID for reference
        };
        
        // Create the invoice
        const createdInvoice = await DocumentService.createDocument(invoiceData);
        
        if (createdInvoice.id) {
            console.log(`Invoice created successfully in Billingo: ${createdInvoice.id}`);
            
            // If order is already paid, mark the invoice as paid
            if (orderData.paymentStatus === 'closed') {
                console.log('Order is paid, marking invoice as paid...');
                const paymentResult = await markInvoiceAsPaid(
                    createdInvoice.id,
                    orderData.total,
                    mapPaymentMethod(orderData.paymentMethod?.slug)
                );
                
                if (paymentResult.success) {
                    console.log('Invoice marked as paid successfully');
                } else {
                    console.warn('Failed to mark invoice as paid:', paymentResult.error);
                }
            }
            
            return {
                success: true,
                invoiceId: createdInvoice.id,
            };
        } else {
            return {
                success: false,
                error: 'Failed to create invoice - no ID returned',
            };
        }
        
    } catch (error) {
        console.error('Error creating Billingo invoice:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

// Update invoice payment status in Billingo
export async function markInvoiceAsPaid(invoiceId: number, amount: number, paymentMethod: BillingoPaymentMethod): Promise<{ success: boolean; error?: string }> {
    try {
        addBillingoApiKey();
        
        // Create payment history entry
        const paymentHistory: PaymentHistory[] = [{
            date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
            price: amount,
            payment_method: paymentMethod,
            voucher_number: null,
            conversion_rate: null,
        }];
        
        // Update payment history
        await DocumentService.updatePayment(invoiceId, paymentHistory);
        
        console.log(`Marked invoice ${invoiceId} as paid with amount ${amount}`);
        
        return {
            success: true,
        };
        
    } catch (error) {
        console.error('Error marking invoice as paid:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}