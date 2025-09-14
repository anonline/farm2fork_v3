import type { RegistrationSchemaType } from 'src/auth/components/sign-up-wizard';

import { supabase } from 'src/lib/supabase';

export async function registerUser(data: RegistrationSchemaType) {
    const { email, password } = data.stepTwo;
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        throw new Error(authError.message);
    }
    if (!authData.user) {
        throw new Error('A felhasználó létrehozása sikertelen, próbáld újra később.');
    }

    const roleData = {
        uid: authData.user.id,
        is_admin: false,
        is_vip: false,
        is_corp: data.stepOne.role === 'company',
    };

    const { error: rolesError } = await supabase.from('roles').insert(roleData);

    if (rolesError) {
        console.error('Supabase Roles Error:', rolesError);
        throw new Error(`Hiba a felhasználói szerepkör beállítása során: ${rolesError.message}`);
    }

    const customerDataObject = {
        uid: authData.user.id,
        firstname: data.stepTwo.firstName,
        lastname: data.stepTwo.lastName,
        companyName: null,
        newsletterConsent: data.stepTwo.newsletter,
        acquisitionSource: data.stepThree.source || null,
        deliveryAddress: JSON.stringify([
            {
                fullName: data.stepThree.fullName,
                postcode: data.stepThree.zipCode,
                city: data.stepThree.city,
                street: data.stepThree.street,
                floorDoor: data.stepThree.floorDoor,
                houseNumber: data.stepThree.houseNumber,
                comment: data.stepThree.comment,
                doorBell: data.stepThree.doorBell || null,
                phone: data.stepThree.phone,
            },
        ]),
        billingAddress: JSON.stringify([
            {
                fullName: data.stepThree.fullName,
                postcode: data.stepThree.zipCode,
                city: data.stepThree.city,
                street: data.stepThree.street,
                floorDoor: data.stepThree.floorDoor,
                houseNumber: data.stepThree.houseNumber,
                doorBell: data.stepThree.doorBell || null,
                phone: data.stepThree.phone,
                companyName: data.stepTwo.companyName || null,
                taxNumber: data.stepTwo.taxNumber || null,
            },
        ]),
    };

    const { error: dbError } = await supabase.from('CustomerDatas').insert(customerDataObject);

    if (dbError) {
        console.error('Supabase DB Error:', dbError);
        throw new Error(`Adatbázis hiba: ${dbError.message || 'Ismeretlen hiba a mentés során.'}`);
    }

    return { user: authData.user };
}
