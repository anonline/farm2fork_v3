import type { IInvoice} from 'src/types/invoice';
import type { IDateValue } from 'src/types/common';

import { OpenAPI, DocumentService, DocumentNotificationStatus } from '@codingsans/billingo-client';


function addBillingoApiKey() {
    const apiKey = '8f0a70aa-6deb-11f0-a720-0adb4fd9a356';
    if (apiKey) {
        OpenAPI.HEADERS = {
            'X-API-KEY': apiKey,
        };
    }
}

export default async function GetDocuments({per_page, page}: {per_page?: number, page?: number} = {}) {
    addBillingoApiKey();
    if (!per_page) per_page = 25;
    if (!page) page = 1;

    let currentPage = page;
    let lastPage = page;

    const documentList: IInvoice[] = [];
    do {
        const documentResponse = await DocumentService.listDocument(currentPage, per_page);
        if (documentResponse.data) {
            documentResponse.data.map((doc) => {
                // Convert the document to IInvoice type if necessary
                
                const invoice: IInvoice = {
                    id: doc.id?.toString() || '',
                    invoiceNumber: doc.invoice_number?.toString() || '',
                    createDate: doc.invoice_date?.toString() as IDateValue || '',
                    dueDate: doc.due_date?.toString() as IDateValue || '',
                    status: doc.payment_status?.toString() || '',
                    totalAmount: doc.gross_total || 0,
                    invoiceFrom: {
                        name: doc.document_partner?.name || '',
                        fullAddress: doc.document_partner?.address?.post_code + ' ' + doc.document_partner?.address?.city + ' ' + doc.document_partner?.address?.address + ' ' + doc.document_partner?.address?.country_code,
                        phoneNumber: doc.document_partner?.phone || '',
                    },
                    invoiceTo: {
                        name: doc.partner?.name || '',
                        fullAddress: doc.partner?.address?.post_code + ' ' + doc.partner?.address?.city + ' ' + doc.partner?.address?.address + ' ' + doc.partner?.address?.country_code,
                        phoneNumber: doc.partner?.phone || '',
                    },
                    items: doc.items && doc.items.map((item) => ({
                        id: item.product_id?.toString() || '',
                        title: item.name || '',
                        price: item.net_unit_amount || 0,
                        total: item.net_amount || 0,
                        service: item.comment || '',
                        quantity: item.quantity || 0,
                        description: item.comment || '',
                    })) || [],
                    subtotal: doc.gross_total || 0,
                    discount: doc.discount?.value || 0,
                    shipping: 0,
                    sent: doc.notification_status === DocumentNotificationStatus.OPENED ? 1 : 0,
                    taxes: doc.items?.map(item => item.vat_amount || 0).reduce((acc, tax) => acc + tax, 0) || 0,
                };
                documentList.push(invoice);
            });
        
            lastPage = documentResponse.last_page ?? 1;
        }
        currentPage++;
    } while (currentPage < lastPage);
    return documentList;
}
