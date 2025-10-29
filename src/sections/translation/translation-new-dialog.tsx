'use client';

import type { ITranslation } from 'src/types/translation';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { languages } from 'src/locales/locales-config';
import { createTranslationKey } from 'src/actions/translation-management';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

type Props = Readonly<{
    open: boolean;
    onClose: () => void;
    onCreate: (translations: ITranslation[]) => void;
}>;

export function TranslationNewDialog({ open, onClose, onCreate }: Props) {
    const [namespace, setNamespace] = useState('');
    const [key, setKey] = useState('');
    const [values, setValues] = useState<Record<string, string>>(
        languages.reduce((acc, lang) => ({ ...acc, [lang]: '' }), {})
    );

    const handleReset = useCallback(() => {
        setNamespace('');
        setKey('');
        setValues(languages.reduce((acc, lang) => ({ ...acc, [lang]: '' }), {}));
    }, []);

    const handleClose = useCallback(() => {
        handleReset();
        onClose();
    }, [handleReset, onClose]);

    const handleSubmit = useCallback(async () => {
        if (!namespace.trim() || !key.trim()) {
            toast.error('A namespace és a key mezők kitöltése kötelező!');
            return;
        }

        // Check if at least one language value is provided
        const hasValue = Object.values(values).some((v) => v.trim());
        if (!hasValue) {
            toast.error('Legalább egy nyelv fordítását meg kell adni!');
            return;
        }

        try {
            const createdTranslations = await createTranslationKey(
                namespace.trim(),
                key.trim(),
                values
            );

            onCreate(createdTranslations);
            toast.success('Új fordítási kulcs létrehozva!');
            handleClose();
        } catch (error) {
            console.error('Error creating translation:', error);
            toast.error('Hiba történt a létrehozás során!');
        }
    }, [namespace, key, values, onCreate, handleClose]);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Új fordítási kulcs</DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ pt: 2 }}>
                    <TextField
                        fullWidth
                        label="Namespace"
                        value={namespace}
                        onChange={(e) => setNamespace(e.target.value)}
                        placeholder="pl. common, product, auth"
                        helperText="A fordítások csoportosítása (pl. common, product, auth)"
                    />

                    <TextField
                        fullWidth
                        label="Key"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="pl. signin_button_label"
                        helperText="A fordítás egyedi azonosítója"
                    />

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2 }}>
                            Fordítások
                        </Typography>

                        <Stack spacing={2}>
                            {languages.map((lang) => (
                                <TextField
                                    key={lang}
                                    fullWidth
                                    label={lang.toUpperCase()}
                                    value={values[lang]}
                                    onChange={(e) =>
                                        setValues((prev) => ({ ...prev, [lang]: e.target.value }))
                                    }
                                    placeholder={`Fordítás ${lang.toUpperCase()} nyelven`}
                                    multiline
                                    rows={2}
                                />
                            ))}
                        </Stack>
                    </Box>

                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'background.neutral',
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            <strong>Előnézet:</strong> {namespace}.{key}
                        </Typography>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" color="inherit" onClick={handleClose}>
                    Mégse
                </Button>
                <Button variant="contained" onClick={handleSubmit}>
                    Létrehozás
                </Button>
            </DialogActions>
        </Dialog>
    );
}
