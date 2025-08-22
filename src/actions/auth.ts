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
        zipCode: data.stepThree.zipCode,
        city: data.stepThree.city,
        streetAddress: data.stepThree.streetAddress,
        floorDoor: data.stepThree.floorDoor,
        comment: data.stepThree.comment,
        phone: data.stepThree.phone,
      },
    ]),
    billingAddress: JSON.stringify([
      {
        fullName: data.stepThree.fullName,
        zipCode: data.stepThree.zipCode,
        city: data.stepThree.city,
        streetAddress: data.stepThree.streetAddress,
        floorDoor: data.stepThree.floorDoor,
        companyName: data.stepTwo.companyName || null,
        taxNumber: data.stepTwo.taxNumber || null,
      },
    ]),
  };

  const { error: dbError } = await supabase.from('customerdata').insert(customerDataObject);

  if (dbError) {
    console.error('Supabase DB Error:', dbError);
    throw new Error(`Adatbázis hiba: ${dbError.message || 'Ismeretlen hiba a mentés során.'}`);
  }

  return { user: authData.user };
}