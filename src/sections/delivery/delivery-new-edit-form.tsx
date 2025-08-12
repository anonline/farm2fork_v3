'use client';

import type { IDeliveryPerson } from 'src/types/delivery';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { createDelivery, updateDelivery } from 'src/actions/delivery';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

// MÓDOSÍTÁS: A függvény most már fel van készítve, hogy számot is kaphat.
const formatPhoneNumber = (value: string | number | null | undefined) => {
    // Ha az érték null vagy undefined, üres stringet adunk vissza.
    if (!value) {
        return '';
    }
    // Biztos, ami biztos, stringgé alakítjuk.
    const stringValue = String(value);

    const digits = stringValue.replace(/\D/g, '');

    let formatted = '';
    // Csak akkor kezdjük el a "+36"-ot, ha van mit formázni.
    if (digits.length > 0) {
        // Ha a szám már tartalmazza a 36-ot az elején, ne duplázzuk meg.
        const numberSlice = digits.startsWith('36') ? digits.substring(2) : digits;
        
        formatted = `+36 (${numberSlice.substring(0, 2)}`;
        
        if (numberSlice.length > 2) {
            formatted += `) ${numberSlice.substring(2, 5)}`;
        }
        if (numberSlice.length > 5) {
            formatted += ` ${numberSlice.substring(5, 9)}`;
        }
    }
    return formatted;
};

// ----------------------------------------------------------------------

type Props = {
    currentDelivery?: IDeliveryPerson;
};

export default function DeliveryNewEditForm({ currentDelivery }: Readonly<Props>) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (currentDelivery) {
            setFormData({
                name: currentDelivery.name,
                phone: currentDelivery.phone ? formatPhoneNumber(currentDelivery.phone) : '',
            });
        }
    }, [currentDelivery]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        if (name === 'phone') {
            const formatted = formatPhoneNumber(value);
            setFormData(prev => ({ ...prev, phone: formatted }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            // Mentés előtt a biztonság kedvéért újra megtisztítjuk a számot
            const submissionData = {
                ...formData,
                phone: formData.phone.replace(/\D/g, ''),
            };

            if (currentDelivery) {
                await updateDelivery(currentDelivery.id, submissionData);
                toast.success('Sikeres mentés!');
                window.close();
            } else {
                await createDelivery(submissionData);
                toast.success('Futár sikeresen létrehozva!');
                router.push(paths.dashboard.delivery.root);
            }
        } catch (error: any) {
            toast.error(error.message);
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <Stack spacing={3} sx={{ p: 3 }}>
                    <Typography variant="h6">Futár adatai</Typography>
                    <TextField
                        name="name"
                        label="Név"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        name="phone"
                        label="Telefonszám"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+36 (20) 123 4567"
                        type="text"
                    />
                </Stack>
            </Card>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    {currentDelivery ? 'Változtatások mentése' : 'Futár létrehozása'}
                </LoadingButton>
            </Stack>
        </form>
    );
}