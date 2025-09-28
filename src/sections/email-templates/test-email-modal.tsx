import type { DialogProps } from '@mui/material/Dialog';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { triggerEmailTest } from 'src/actions/email-ssr';
import type { EmailTrigger } from 'src/types/emails/email-trigger';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const TestEmailSchema = zod.object({
  email: zod.string().email({ message: 'Kérjük, adjon meg egy érvényes email címet' }),
  name: zod.string().min(1, { message: 'A név megadása kötelező' }),
});

type TestEmailSchemaType = zod.infer<typeof TestEmailSchema>;

type Props = DialogProps & {
  templateType: EmailTrigger;
  templateSubject: string;
  templateBody: string;
};

export function TestEmailModal({ templateType, templateSubject, templateBody, open, onClose, ...other }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: TestEmailSchemaType = {
    email: '',
    name: 'Test User',
  };

  const methods = useForm<TestEmailSchemaType>({
    resolver: zodResolver(TestEmailSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      await triggerEmailTest(templateType, {
        email: data.email,
        name: data.name,
      }, {
        subject: templateSubject,
        body: templateBody
      });
      toast.success(`Teszt email elküldve: ${data.email}!`);
      reset();
      if (onClose) onClose({}, 'escapeKeyDown');
    } catch (error) {
      console.error(error);
      toast.error('Teszt email küldése sikertelen');
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleClose = () => {
    reset();
    if (onClose) onClose({}, 'escapeKeyDown');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      {...other}
    >
      <DialogTitle>
        Teszt email küldése
      </DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Teszt email küldése a következő sablonnal: <strong>{templateSubject || 'Nincs tárgy'}</strong>
              </Typography>
            </Box>

            <Field.Text
              name="email"
              label="Teszt Email Cím"
              placeholder="Add meg a teszt email címet"
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <Field.Text
              name="name"
              label="Teszt Név"
              placeholder="Név a {{name}} helyettesítőhöz"
              error={!!errors.name}
              helperText={errors.name?.message || 'Ez helyettesíti a {{name}}-t a sablonban'}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button 
            variant="outlined" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Mégse
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Küldés...' : 'Teszt email küldése'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}