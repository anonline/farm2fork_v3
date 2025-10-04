import type { IRole, IUserItem, ICustomerData } from 'src/types/user';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { addUser, deleteUser, upsertUserCustomerData } from 'src/actions/user-client';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';




// ----------------------------------------------------------------------

export type UpdateUserSchemaType = zod.infer<typeof UpdateUserSchema>;

export const UpdateUserSchema = zod.object({
    firstname: zod.string().min(1, { message: 'Keresztnév megadása kötelező!' }),
    lastname: zod.string().min(1, { message: 'Vezetéknév megadása kötelező!' }),
    email: zod
        .string()
        .min(1, { message: 'E-mail megadása kötelező!' })
        .email({ message: 'E-mail érvénytelen!' }),
    acquisitionSource: zod.string().optional(),
    discountPercent: zod.preprocess(
        (val) => {
            if (val === '' || val === null || val === undefined) return undefined;
            const num = Number(val);
            return isNaN(num) ? val : num;
        },
        zod.number({ message: 'Csak számot lehet megadni!' })
            .min(0, { message: 'Érvényes kedvezmény százalék megadása szükséges!' })
            .max(100, { message: 'A kedvezmény százalékának 0 és 100 között kell lennie!' })
            .optional()
    ),
    isCompany: zod.boolean(),
    CompanyName: zod.string().optional(),
    role: zod.object({
        uid: zod.string().optional(),
        is_admin: zod.boolean().optional(),
        is_vip: zod.boolean().optional(),
        is_corp: zod.boolean().optional(),
    }).optional(),
    id: zod.string().optional(),
    newsletterConsent: zod.boolean(),
    paymentDue: zod.preprocess(
        (val) => {
            if (val === '' || val === null || val === undefined) return undefined;
            const num = Number(val);
            return isNaN(num) ? val : num;
        },
        zod.number({ message: 'Csak számot lehet megadni!' })
            .min(1, { message: 'Fizetési határidő 1-365 nap között kell lennie!' })
            .max(365, { message: 'Fizetési határidő 1-365 nap között kell lennie!' })
    ),
    password: zod.string().optional(),
});

// ----------------------------------------------------------------------

type AccountGeneralProps = {
    user?: IUserItem;
    onUserDeleted?: () => void;
};

export function AccountGeneral({ user, onUserDeleted }: Readonly<AccountGeneralProps>) {
    const router = useRouter();
    const [openConfirm, setOpenConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const currentUser: UpdateUserSchemaType = {
        id: user?.id || '',
        firstname: user?.customerData?.firstname || '',
        lastname: user?.customerData?.lastname || '',
        email: user?.email || '',
        acquisitionSource: user?.customerData?.acquisitionSource || '',
        discountPercent: user?.customerData?.discountPercent || 0,
        isCompany: user?.customerData?.isCompany || false,
        CompanyName: user?.customerData?.companyName || '',
        role: user?.role || { uid: '', is_admin: false, is_vip: false, is_corp: false } as IRole,
        newsletterConsent: user?.customerData?.newsletterConsent || false,
        paymentDue: user?.customerData?.paymentDue || 30,
        password: '',
    };

    const defaultValues: UpdateUserSchemaType = {
        id: '',
        firstname: '',
        lastname: '',
        email: '',
        acquisitionSource: '',
        discountPercent: 0,
        isCompany: false,
        CompanyName: '',
        role: { uid: '', is_admin: false, is_vip: false, is_corp: false } as IRole,
        newsletterConsent: false,
        paymentDue: 30,
        password: '',
    };

    const methods = useForm<UpdateUserSchemaType>({
        mode: 'all',
        resolver: zodResolver(UpdateUserSchema),
        defaultValues,
        values: currentUser,
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (data: UpdateUserSchemaType) => {
        try {

            const userId = await handleUpsertUser(data);

            toast.success('Mentés sikeres!');
            console.info('DATA', data);
        } catch (error: any) {
            console.error(error);
            toast.error(`Mentés sikertelen: ${error.message || 'Ismeretlen hiba történt'}`);
        }
    });

    const handleUpsertUser = useCallback(
        async (data: UpdateUserSchemaType) => {

            const userId = await addUser({
                id: user?.id || undefined,
                email: data.email,
                role: data.role || { uid: '', is_admin: false, is_vip: false, is_corp: false } as IRole,
            } as Partial<IUserItem>, data.password && data.password.trim() !== '' ? data.password : undefined);

            await upsertUserCustomerData({
                id: user?.customerData?.id || undefined,
                firstname: data.firstname,
                lastname: data.lastname,
                companyName: data.isCompany ? data.CompanyName : '',
                uid: userId,
                newsletterConsent: data.newsletterConsent || false,
                acquisitionSource: data.acquisitionSource || '',
                isCompany: data.isCompany || false,
                discountPercent: data.discountPercent || 0,
                paymentDue: data.paymentDue || 30,
            } as Partial<ICustomerData>);


        },
        [user]
    );

    const handleDeleteUser = useCallback(async () => {
        if (!user?.id) return;

        setIsDeleting(true);
        try {
            await deleteUser(user.id);
            toast.success('Felhasználó sikeresen törölve!');
            setOpenConfirm(false);
            onUserDeleted?.();
            router.push(paths.dashboard.user.list);
        } catch (error: any) {
            console.error('Delete user error:', error);
            toast.error(`Törlés sikertelen: ${error.message || 'Ismeretlen hiba történt'}`);
        } finally {
            setIsDeleting(false);
        }
    }, [user?.id, onUserDeleted, router]);

    return (
        <Form methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 12 }}>
                    <Card sx={{ p: 3 }}>
                        <Field.Text name="id" label="Felhasználó azonosító" disabled sx={{ mb: 3 }} />
                        <Box
                            sx={{
                                rowGap: 3,
                                columnGap: 2,
                                display: 'grid',
                                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                            }}
                        >
                            <Field.Text name="lastname" label="Vezetéknév" />
                            <Field.Text name="firstname" label="Keresztnév" />
                            <Field.Text name="email" label="Email cím" />
                            <Field.Text name="discountPercent" label="Kedvezmény százalék" />

                            <Field.Checkbox name="isCompany" label="Céges regisztráció" />
                            {methods.watch('isCompany') && (
                                <Field.Text name="CompanyName" label="Cégnév" />
                            )}
                            <Field.Text name="paymentDue" label="Fizetési határidő (nap)" />
                        </Box>

                        <Typography variant="h6" sx={{ mt: 5, mb: 3 }}>Felhasználói szerepkörök</Typography>
                        <Stack direction="column" spacing={1} sx={{ my: 3 }}>
                            <Field.Checkbox name="role.is_admin" label="Admin" />
                            <Field.Checkbox name="role.is_vip" label="VIP ügyfél" />
                            <Field.Checkbox name="role.is_corp" label="Vállalati ügyfél" />
                        </Stack>

                        <Field.Text name="acquisitionSource" multiline rows={4} label="Honnan hallott rólunk?" sx={{ my: 3 }} />

                        <Field.Checkbox name="newsletterConsent" label="Hozzájárulok, hogy hírlevelet küldjetek nekem." />

                        <Typography variant="h6" sx={{ mt: 5, mb: 3 }}>Jelszó</Typography>
                        <Stack direction="column" spacing={1} sx={{ my: 3 }}>
                            <Field.Text name="password" label="Jelszó" type="password" />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Új felhasználó létrehozásakor vagy jelszó módosításakor kötelező megadni a jelszót.
                            </Typography>
                        </Stack>

                        <Stack spacing={3} direction="row" sx={{ mt: 3, alignItems: 'center', justifyContent: 'space-between' }}>
                            <Button 
                                variant="soft" 
                                color="error"
                                onClick={() => setOpenConfirm(true)}
                                disabled={!user?.id || isSubmitting}
                            >
                                Felhasználó törlése
                            </Button>
                            <Button type="submit" variant="contained" loading={isSubmitting}>
                                Változtatások mentése
                            </Button>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                title="Felhasználó törlése"
                content={
                    <Typography>
                        Biztosan törölni szeretné ezt a felhasználót?
                        <br />
                        <strong>{user?.customerData?.lastname} {user?.customerData?.firstname}</strong>
                        <br />
                        <em>{user?.email}</em>
                        <br /><br />
                        Ez a művelet nem vonható vissza!
                    </Typography>
                }
                action={
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteUser}
                        loading={isDeleting}
                        disabled={isDeleting}
                    >
                        Törlés
                    </Button>
                }
            />
        </Form>
    );
}
