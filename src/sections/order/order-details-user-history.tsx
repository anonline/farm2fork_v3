import type { CardProps } from '@mui/material/Card';

import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ----------------------------------------------------------------------

type Props = CardProps & {
    historyForUser?: string;
    onSave?: (newHistory: string) => Promise<void>;
    editable?: boolean;
};

export function OrderDetailsUserHistory({
    sx,
    historyForUser = '',
    onSave,
    editable = true,
    ...other
}: Props) {
    const [localValue, setLocalValue] = useState(historyForUser);
    const [isSaving, setIsSaving] = useState(false);

    // Update local value when prop changes (e.g., after items are edited)
    useEffect(() => {
        setLocalValue(historyForUser);
    }, [historyForUser]);

    const handleBlur = async () => {
        // Only save if value has changed
        if (localValue !== historyForUser && onSave) {
            setIsSaving(true);
            try {
                await onSave(localValue);
            } catch (error) {
                console.error('Error saving user history:', error);
                // Revert to original value on error
                setLocalValue(historyForUser);
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <Card sx={sx} {...other}>
            <CardHeader
                title="Változási előzmények"
                subheader="Ezeket az információkat a vásárló is látja az e-mailekben"
            />
            <CardContent>
                <TextField
                    fullWidth
                    multiline
                    rows={8}
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    disabled={!editable || isSaving}
                    placeholder="Nincsenek változási előzmények..."
                    helperText={isSaving ? 'Mentés folyamatban...' : 'A mező elhagyásakor automatikusan mentésre kerül'}
                    sx={{
                        '& .MuiInputBase-root': {
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                        },
                    }}
                />
            </CardContent>
        </Card>
    );
}
