import { z as zod } from 'zod';

import { schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type ContactFormSchemaType = zod.infer<typeof ContactFormSchema>;

export const ContactFormSchema = zod.object({
    name: zod
        .string()
        .min(1, { message: 'A név megadása kötelező' })
        .min(2, { message: 'A névnek legalább 2 karakter hosszúnak kell lennie' }),
    email: zod
        .string()
        .min(1, { message: 'Az email cím megadása kötelező' })
        .email({ message: 'Érvénytelen email cím formátum' }),
    message: zod
        .string()
        .min(1, { message: 'Az üzenet megadása kötelező' })
        .min(10, { message: 'Az üzenetnek legalább 10 karakter hosszúnak kell lennie' }),
    acceptedPolicy: schemaHelper.boolean({ 
        message: 'Az adatkezelési nyilatkozat elfogadása kötelező' 
    }),
});
