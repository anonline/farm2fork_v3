import type EmailTemplate from 'src/types/emails/email-template';

import { z as zod } from 'zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { updateEmailTemplate, createEmailTemplate } from 'src/actions/email';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { EmailTrigger } from 'src/types/emails/email-trigger';

import { TestEmailModal } from './test-email-modal';

// ----------------------------------------------------------------------

export type NewEmailTemplateSchemaType = zod.infer<typeof NewEmailTemplateSchema>;

export const NewEmailTemplateSchema = zod.object({
    type: zod.nativeEnum(EmailTrigger, { message: 'Email típus megadása kötelező' }),
    subject: zod.string().min(1, { message: 'Tárgy megadása kötelező' }),
    header: zod.string().optional(),
    body: zod.string().min(1, { message: 'Tartalom megadása kötelező' }),
    enabled: zod.boolean().default(true),
});

// ----------------------------------------------------------------------

type Props = {
    currentTemplate?: EmailTemplate;
    type?: EmailTrigger;
};

export function EmailTemplateNewEditForm({
    currentTemplate,
    type,
}: Readonly<Props>) {
    const router = useRouter();
    const openDetails = useBoolean(true);
    const testEmailModal = useBoolean();

    const defaultValues: NewEmailTemplateSchemaType = {
        type: type || currentTemplate?.type || EmailTrigger.WELCOME_EMAIL,
        subject: currentTemplate?.subject || '',
        body: currentTemplate?.body || '',
        header: currentTemplate?.header || '',
        enabled: currentTemplate?.enabled ?? true,
    };

    const methods = useForm<NewEmailTemplateSchemaType>({
        resolver: zodResolver(NewEmailTemplateSchema),
        defaultValues,
    });

    const {
        reset,
        watch,
        setValue,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const values = watch();

    const onSubmit = handleSubmit(async (data) => {
        try {
            if (currentTemplate) {
                await updateEmailTemplate({
                    type: data.type,
                    subject: data.subject,
                    body: data.body,
                    header: data.header || '',
                    enabled: data.enabled,
                });
            } else {
                await createEmailTemplate({
                    type: data.type,
                    subject: data.subject,
                    body: data.body,
                    header: data.header || '',
                    enabled: data.enabled,
                });
            }

            toast.success(currentTemplate ? 'Email sablon frissítve!' : 'Email sablon létrehozva!');
            // Don't redirect, stay on the same page
        } catch (error) {
            console.error(error);
            toast.error('Sablon mentése sikertelen');
        }
    });

    const handleToggleEnabled = useCallback(() => {
        setValue('enabled', !values.enabled);
    }, [setValue, values.enabled]);

    const emailTypeOptions = Object.values(EmailTrigger).map((triggerType) => ({
        value: triggerType,
        label: triggerType.replace(/_/g, ' '),
    }));

    const renderDetails = () => (
        <Card>
            <CardHeader
                title="Sablon részletei"
                action={
                    <IconButton onClick={openDetails.onToggle}>
                        <Iconify icon={openDetails.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} />
                    </IconButton>
                }
            />

            <Collapse in={openDetails.value} unmountOnExit>
                <Divider />

                <Stack spacing={3} sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Field.Select
                                name="type"
                                label="Email Típus"
                                disabled={!!currentTemplate} // Disable editing type for existing templates
                            >
                                {emailTypeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Field.Select>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={values.enabled}
                                        onChange={handleToggleEnabled}
                                    />
                                }
                                label="Engedélyezve"
                                sx={{ mt: 2 }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Field.Text
                                name="subject"
                                label="Tárgy"
                                helperText="Használható helyettesítők: {{name}}, {{order_id}}"
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Field.Text
                                name="header"
                                label="Fejléc"
                                helperText=""
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Field.Editor
                                name="body"
                                helperText="Használható helyettesítők: {{name}}, {{order_id}}, {{order_details_table}}, {{futar_info}}, {{change_log_section}}, {{expected_delivery_section}}."
                                sx={{ minHeight: 300 }}
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </Collapse>
        </Card>
    );

    const renderActions = () => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
            <Button 
                variant="outlined" 
                color="info"
                onClick={testEmailModal.onTrue}
                disabled={!values.subject || !values.body}
                startIcon={<Iconify icon="solar:letter-bold" />}
            >
                Teszt email küldése
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button 
                    variant="outlined" 
                    onClick={() => router.push(paths.dashboard.emailtemplates.root)}
                >
                    Vissza a listához
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                >
                    {currentTemplate ? 'Sablon frissítése' : 'Sablon létrehozása'}
                </Button>
            </Box>
        </Box>
    );

    return (
        <>
            <Form methods={methods} onSubmit={onSubmit}>
                <Stack spacing={3}>
                    {renderDetails()}
                    
                    {renderActions()}
                </Stack>
            </Form>

            <TestEmailModal
                open={testEmailModal.value}
                onClose={testEmailModal.onFalse}
                templateType={values.type}
                templateSubject={values.subject}
                templateBody={values.body}
            />
        </>
    );
}