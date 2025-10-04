import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import { Card } from '@mui/material';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { updateOrderNote } from 'src/actions/order-management';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

type Props = {
    orderId?: string;
    initialNote?: string;
    onNoteUpdate?: () => void;
};

export function OrderDetailsAdminNotes({ orderId, initialNote = '', onNoteUpdate }: Props) {
    const [note, setNote] = useState(initialNote);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedNote, setLastSavedNote] = useState(initialNote);

    // Update note when initialNote changes
    useEffect(() => {
        setNote(initialNote);
        setLastSavedNote(initialNote);
    }, [initialNote]);

    // Load note from localStorage when component mounts
    useEffect(() => {
        if (orderId) {
            const storageKey = `order_note_${orderId}`;
            const savedNote = localStorage.getItem(storageKey);
            if (savedNote && savedNote !== initialNote) {
                setNote(savedNote);
            }
        }
    }, [orderId, initialNote]);

    // Save note to localStorage whenever note changes
    useEffect(() => {
        if (orderId && note !== lastSavedNote) {
            const storageKey = `order_note_${orderId}`;
            localStorage.setItem(storageKey, note);
        }
    }, [note, orderId, lastSavedNote]);

    const handleSaveNote = useCallback(async () => {
        if (!orderId) return;
        
        // Don't save if note hasn't changed
        if (note === lastSavedNote) return;

        setIsSaving(true);
        
        try {
            const result = await updateOrderNote(orderId, note);
            
            if (result.success) {
                setLastSavedNote(note);
                // Clear from localStorage since it's now saved
                const storageKey = `order_note_${orderId}`;
                localStorage.removeItem(storageKey);
                toast.success('Megjegyzés mentve');
                onNoteUpdate?.();
            } else {
                toast.error(`Hiba a megjegyzés mentésekor: ${result.error}`);
            }
        } catch (error) {
            console.error('Error saving note:', error);
            toast.error('Hiba történt a megjegyzés mentésekor');
        } finally {
            setIsSaving(false);
        }
    }, [orderId, note, lastSavedNote, onNoteUpdate]);

    const handleNoteChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setNote(event.target.value);
    }, []);

    const handleNoteBlur = useCallback(() => {
        handleSaveNote();
    }, [handleSaveNote]);

    const hasUnsavedChanges = note !== lastSavedNote;

    return (
        <Card sx={{ p: 3 }}>
            <CardHeader
                title="Megjegyzés"
                subheader={hasUnsavedChanges ? "Mentés a mező elhagyásakor..." : ""}
                sx={{ p: 0, mb: 2 }}
            />
            
            <TextField
                fullWidth
                multiline
                rows={4}
                value={note}
                onChange={handleNoteChange}
                onBlur={handleNoteBlur}
                placeholder="Megjegyzés..."
                disabled={isSaving || !orderId}
                sx={{
                    '& .MuiInputBase-root': {
                        backgroundColor: hasUnsavedChanges ? 'rgba(255, 193, 7, 0.08)' : 'inherit',
                    },
                }}
            />
            
            {hasUnsavedChanges && (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="warning.main">
                        Nem mentett módosítások
                    </Typography>
                </Box>
            )}
            
            {isSaving && (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        Mentés folyamatban...
                    </Typography>
                </Box>
            )}
        </Card>
    );
}