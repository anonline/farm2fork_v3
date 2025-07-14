import { useState } from "react";

import { Chip, Paper, Stack, Button, Typography } from "@mui/material";

import F2FIcons from "src/components/f2ficons/f2ficons";

import BillingAddressKartyaEdit from "./billing-address-kartya-edit";
import ShippingAddressKartyaEdit from "./shipping-address-kartya-edit";


interface IAddress {
    id: number;
    type: 'shipping' | 'billing';
    name: string; address: string;
    phone: string; email?: string;
    taxNumber?: string;
    isDefault: boolean;
}
export default function ProfilAddressKartya({ address: initialAddress }: Readonly<{ address: IAddress }>) {
    const [isEditing, setIsEditing] = useState(false);
    const [address, setAddress] = useState(initialAddress);

    const handleSave = (updatedAddress: IAddress) => {
        setAddress(updatedAddress);
        setIsEditing(false);
    };

    const handleDelete = () => {
        console.log("Törlés:", address.id);
    };

    if (isEditing) {
        if (address.type === 'billing') {
            return (
                <BillingAddressKartyaEdit 
                    address={address}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                    onDelete={handleDelete}
                />
            );
        }
        return (
            <ShippingAddressKartyaEdit 
                address={address}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
                onDelete={handleDelete}
            />
        );
    }

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Stack spacing={0.5}>
                <Typography sx={{ fontSize: "20px", fontWeight: 700 }}>{address.name}</Typography>
                <Typography sx={{ fontSize: "16px", color: "rgb(75, 75, 74)" }}>{address.address}</Typography>
                <Typography sx={{ fontSize: "16px", color: "rgb(75, 75, 74)" }}>{address.phone}</Typography>
                {address.email && <Typography sx={{ fontSize: "16px", color: "rgb(75, 75, 74)" }}>{address.email}</Typography>}
                {address.taxNumber && <Typography sx={{ fontSize: "16px", color: "rgb(75, 75, 74)" }}>Adószám: {address.taxNumber}</Typography>}
            </Stack>
            <Stack spacing={1} alignItems="flex-end">
                {address.isDefault && <Chip label="Alapértelmezett cím" size="small" />}
                <Button 
                    variant="outlined"
                    onClick={() => setIsEditing(true)}
                    startIcon={<F2FIcons name="EditPen" height={16} width={16} />}
                    sx={{ borderColor: '#E0E0E0', color: 'rgb(38, 38, 38)', '&:hover': { backgroundColor: 'black', color: 'white', borderColor: 'black' } }}
                >
                    Szerkesztés
                </Button>
            </Stack>
        </Paper>
    );
}
