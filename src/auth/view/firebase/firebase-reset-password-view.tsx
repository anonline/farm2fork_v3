'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { PasswordIcon } from 'src/assets/icons';

import { Form, Field } from 'src/components/hook-form';

import { FormHead } from '../../components/form-head';
import { sendPasswordResetEmail } from '../../context/firebase';
import { FormReturnLink } from '../../components/form-return-link';

// ----------------------------------------------------------------------

export type ResetPasswordSchemaType = zod.infer<typeof ResetPasswordSchema>;

export const ResetPasswordSchema = zod.object({
    email: zod
        .string()
        .min(1, { message: 'Email is required!' })
        .email({ message: 'Email must be a valid email address!' }),
});

// ----------------------------------------------------------------------

export function FirebaseResetPasswordView() {
    const router = useRouter();

    const defaultValues: ResetPasswordSchemaType = {
        email: '',
    };

    const methods = useForm<ResetPasswordSchemaType>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const createRedirectPath = (query: string) => {
        const queryString = new URLSearchParams({ email: query }).toString();
        return `${paths.auth.firebase.verify}?${queryString}`;
    };

    const onSubmit = handleSubmit(async (data) => {
        try {
            await sendPasswordResetEmail({ email: data.email });

            const redirectPath = createRedirectPath(data.email);

            router.push(redirectPath);
        } catch (error) {
            console.error(error);
        }
    });

    const renderForm = () => (
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <Field.Text
                autoFocus
                name="email"
                label="Email address"
                placeholder="example@gmail.com"
                slotProps={{ inputLabel: { shrink: true } }}
            />

            <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
                loadingIndicator="Send request..."
            >
                Send request
            </Button>
        </Box>
    );

    return (
        <>
            <FormHead
                icon={<PasswordIcon />}
                title="Forgot your password?"
                description={`Please enter the email address associated with your account and we'll email you a link to reset your password.`}
            />

            <Form methods={methods} onSubmit={onSubmit}>
                {renderForm()}
            </Form>

            <FormReturnLink href={paths.auth.firebase.signIn} />
        </>
    );
}
