'use client';

import type { IPartner } from 'src/types/partner';
import type { DropAnimation, UniqueIdentifier } from '@dnd-kit/core';

import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import {
    arrayMove, useSortable, SortableContext, rectSortingStrategy, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
    useSensor, DndContext, useSensors, DragOverlay, MouseSensor,
    TouchSensor, closestCenter, KeyboardSensor,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';

import { LoadingButton } from '@mui/lab';
import {
    Box, Card, Stack, Button, Dialog, Portal, Tooltip, TextField, IconButton, Typography, DialogTitle, DialogActions, DialogContent
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { createPartner, updatePartner, deletePartner, useGetPartners, updatePartnerOrder } from 'src/actions/partner';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';


// ----------------------------------------------------------------------


const PartnerSchema = zod.object({
    name: zod.string().min(1, { message: 'A név megadása kötelező!' }),
    imageUrl: zod.string().url({ message: 'Érvénytelen kép URL formátum!' }),
    link: zod.string().url({ message: 'Érvénytelen weboldal link formátum!' }),
});

const dropAnimationConfig: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: { active: { opacity: '0.5' } },
    }),
};

export default function PartnerListView() {
    const { partners, partnersMutate } = useGetPartners();
    const [items, setItems] = useState<IPartner[]>([]);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [editingPartner, setEditingPartner] = useState<IPartner | null>(null);
    const [formData, setFormData] = useState({ name: '', imageUrl: '', link: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

    useEffect(() => {
        if (partners.length) setItems(partners);
    }, [partners]);

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const activeItem = activeId ? items.find((item) => item.id === activeId) : null;

    const handleDragEnd = async ({ over }: { over: any }) => {
        setActiveId(null);
        if (over) {
            const activeIndex = items.findIndex((item) => item.id === activeId);
            const overIndex = items.findIndex((item) => item.id === over.id);
            if (activeIndex !== overIndex) {
                const newItems = arrayMove(items, activeIndex, overIndex);
                setItems(newItems);
                try {
                    await updatePartnerOrder(newItems);
                    toast.success('Sorrend sikeresen frissítve!');
                    partnersMutate(newItems, false);
                } catch (error: any) {
                    toast.error(error.message);
                    setItems(partners);
                }
            }
        }
    };

    const handleOpenNewDialog = () => {
        setEditingPartner(null);
        setFormData({ name: '', imageUrl: '', link: '' });
        setOpenFormDialog(true);
    };

    const handleOpenEditDialog = (partner: IPartner) => {
        setEditingPartner(partner);
        setFormData({
            name: partner.name || '',
            imageUrl: partner.imageUrl || '',
            link: partner.link || '',
        });
        setOpenFormDialog(true);
    };

    const handleCloseFormDialog = () => {
        setOpenFormDialog(false);
        setEditingPartner(null);
    };

    const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async () => {
        const validationResult = PartnerSchema.safeParse(formData);

        if (!validationResult.success) {
            toast.error(validationResult.error.errors[0].message);
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingPartner) {
                await updatePartner(editingPartner.id, validationResult.data);
                toast.success('Sikeres mentés!');
            } else {
                await createPartner(validationResult.data);
                toast.success('Partner sikeresen létrehozva!');
            }
            partnersMutate();
            handleCloseFormDialog();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!editingPartner) return;
        try {
            await deletePartner(editingPartner.id);
            toast.success('Partner sikeresen törölve!');
            partnersMutate();
            setOpenDeleteConfirm(false);
            handleCloseFormDialog();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Partnerek"
                links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Partnerek' }]}
                action={
                    <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleOpenNewDialog}>
                        Új Partner
                    </Button>
                }
            />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(active.id)} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                    <Box component="ul" sx={{ p: 3, gap: 3, display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' } }}>
                        {items.map(item => (
                            <SortablePartnerItem key={item.id} item={item} onEdit={() => handleOpenEditDialog(item)} />
                        ))}
                    </Box>
                </SortableContext>
                <Portal>
                    <DragOverlay dropAnimation={dropAnimationConfig}>
                        {activeItem ? <PartnerItemBase item={activeItem} isOverlay /> : null}
                    </DragOverlay>
                </Portal>
            </DndContext>

            <Dialog open={openFormDialog} onClose={handleCloseFormDialog} fullWidth maxWidth="sm">
                <DialogTitle>{editingPartner ? 'Partner szerkesztése' : 'Új Partner'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField name="name" label="Név" value={formData.name} onChange={handleFormChange} required />
                        <TextField name="imageUrl" label="Kép URL" value={formData.imageUrl} onChange={handleFormChange} required />
                        <TextField name="link" label="Weboldal Link" value={formData.link} onChange={handleFormChange} required />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    {editingPartner && (
                        <Button onClick={() => setOpenDeleteConfirm(true)} color="error">Törlés</Button>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Button onClick={handleCloseFormDialog} color="inherit">Mégse</Button>
                    <LoadingButton onClick={handleSubmit} variant="contained" loading={isSubmitting}>
                        {editingPartner ? 'Mentés' : 'Létrehozás'}
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
                <DialogTitle>Törlés Megerősítése</DialogTitle>
                <DialogContent>
                    <Typography>Biztosan törölni szeretnéd a(z) <strong>{editingPartner?.name}</strong> nevű partnert?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteConfirm(false)} color="inherit">Mégse</Button>
                    <Button onClick={handleDelete} color="error">Törlés</Button>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}


function SortablePartnerItem({ item, onEdit }: Readonly<{ item: IPartner, onEdit: () => void }>) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
    };
    return (
        <PartnerItemBase ref={setNodeRef} style={style} item={item} onEdit={onEdit} isDragging={isDragging} attributes={attributes} listeners={listeners} />
    );
}

function PartnerItemBase({ item, onEdit, isDragging, isOverlay, ...props }: Readonly<{ item: IPartner, onEdit?: () => void, isDragging?: boolean, isOverlay?: boolean, [key: string]: any }>) {
    return (
        <Box component="li" sx={{ listStyle: 'none' }} {...props}>
            <Tooltip title={item.name} arrow>
                <Card sx={{
                    p: 2,
                    aspectRatio: '1 / 1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxShadow: isOverlay ? '0px 8px 16px 0px rgba(0,0,0,0.24)' : undefined,
                    opacity: isDragging ? 0.48 : 1, '&:hover .actions': { opacity: 1 }
                }}
                >
                    <Box
                        component="img"
                        src={item.imageUrl}
                        alt={item.name}
                        sx={{
                            width: '80%',
                            height: '80%',
                            objectFit: 'contain'
                        }}
                    />

                    <Stack
                        direction="row"
                        className="actions"
                        sx={{
                            top: 8,
                            right: 8,
                            position: 'absolute',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            bgcolor: 'background.paper',
                            borderRadius: '50%'
                        }}
                    >
                        {onEdit && <IconButton size="small" onClick={onEdit}><Iconify icon="solar:pen-bold" /></IconButton>}
                        <IconButton size="small" {...props.listeners}><Iconify icon="custom:drag-dots-fill" /></IconButton>
                    </Stack>
                </Card>
            </Tooltip>
        </Box>
    );
}