'use client';

import type { IRolunkWhat } from 'src/types/rolunk/irolunkwhat';
import type { DropAnimation, UniqueIdentifier } from '@dnd-kit/core';

import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import {
    arrayMove,
    useSortable,
    SortableContext,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
    useSensor,
    DndContext,
    useSensors,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    closestCenter,
    KeyboardSensor,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';

import { LoadingButton } from '@mui/lab';
import {
    Box,
    Card,
    Stack,
    Alert,
    Paper,
    Button,
    Dialog,
    Portal,
    TextField,
    CardMedia,
    Typography,
    IconButton,
    DialogTitle,
    DialogActions,
    DialogContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { uploadFile } from 'src/lib/blob/blobClient';
import { DashboardContent } from 'src/layouts/dashboard';
import {
    getRolunkWhat,
    createRolunkWhat,
    updateRolunkWhat,
    deleteRolunkWhat,
    reorderRolunkWhat,
} from 'src/actions/rolunk';

import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const AboutUsSchema = zod.object({
    title: zod.string().min(1, { message: 'A cím megadása kötelező!' }),
    description: zod.string().min(1, { message: 'A leírás megadása kötelező!' }),
    image: zod.union([zod.string(), zod.instanceof(File)]).refine((val) => val !== '', {
        message: 'A kép megadása kötelező!',
    }).nullable(),
    link: zod
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val || val === '') return true;
                return val.startsWith('/');
            },
            { message: 'A link csak relatív út lehet (pl. /termekek)' }
        ),
});

const dropAnimationConfig: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: { active: { opacity: '0.5' } },
    }),
};

export function AboutUsListView() {
    const [items, setItems] = useState<IRolunkWhat[]>([]);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [loading, setLoading] = useState(true);

    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<IRolunkWhat | null>(null);
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        image: string | File | null;
        link: string;
    }>({ title: '', description: '', image: null, link: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await getRolunkWhat();
            console.log('Loaded items from database:', data);
            setItems(data);
        } catch (error) {
            console.error('Error loading items:', error);
            toast.error('Hiba az adatok betöltése során.');
        } finally {
            setLoading(false);
        }
    };

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
                    await reorderRolunkWhat(newItems);
                    toast.success('Sorrend sikeresen frissítve!');
                } catch (error: any) {
                    toast.error(error.message || 'Hiba a sorrend frissítése során.');
                    await loadItems(); // Reload on error
                }
            }
        }
    };

    const handleOpenNewDialog = () => {
        setEditingItem(null);
        setFormData({ title: '', description: '', image: null, link: '' });
        setOpenFormDialog(true);
    };

    const handleOpenEditDialog = (item: IRolunkWhat) => {
        console.log('Opening edit dialog for item:', item);
        setEditingItem(item);
        setFormData({
            title: item.title || '',
            description: item.description || '',
            image: item.image || null,
            link: item.link || '',
        });
        setOpenFormDialog(true);
    };

    const handleCloseFormDialog = () => {
        setOpenFormDialog(false);
        setEditingItem(null);
    };

    const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        let imageUrl = formData.image;

        // Upload image if it's a File
        if (imageUrl instanceof File) {
            try {
                const response = await uploadFile(imageUrl, 'aboutus', 0);
                imageUrl = response.url;
                toast.success('Kép sikeresen feltöltve!');
            } catch (error: any) {
                console.error('Image upload error:', error);
                toast.error('Hiba a kép feltöltése során.');
                setIsSubmitting(false);
                return;
            }
        }

        const validationResult = AboutUsSchema.safeParse({
            ...formData,
            image: imageUrl,
        });

        if (!validationResult.success) {
            console.error(validationResult.error);
            const firstError = validationResult.error.errors[0];
            toast.error(firstError.message);
            setIsSubmitting(false);
            return;
        }

        try {
            if (editingItem) {
                if (!editingItem.id) {
                    toast.error('Hiba: az elem azonosítója hiányzik.');
                    setIsSubmitting(false);
                    return;
                }
                
                await updateRolunkWhat(editingItem.id, {
                    id: editingItem.id,
                    title: validationResult.data.title,
                    description: validationResult.data.description,
                    image: typeof validationResult.data.image === 'string' ? validationResult.data.image : '',
                    link: validationResult.data.link || '',
                });
                toast.success('Sikeres mentés!');
            } else {
                const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.order)) : -1;
                await createRolunkWhat({
                    title: validationResult.data.title,
                    description: validationResult.data.description,
                    image: typeof validationResult.data.image === 'string' ? validationResult.data.image : '',
                    link: validationResult.data.link || '',
                    order: maxOrder + 1,
                });
                toast.success('Elem sikeresen létrehozva!');
            }
            await loadItems();
            handleCloseFormDialog();
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error('Hiba a mentés során.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!editingItem || !editingItem.id) return;
        try {
            await deleteRolunkWhat(editingItem.id);
            toast.success('Elem sikeresen törölve!');
            await loadItems();
            setOpenDeleteConfirm(false);
            handleCloseFormDialog();
        } catch (error: any) {
            toast.error(error.message || 'Hiba a törlés során.');
        }
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, image: null }));
    };

    if (loading) {
        return (
            <DashboardContent>
                <CustomBreadcrumbs
                    heading="Rólunk - Mit csinálunk?"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Beállítások' },
                        { name: 'Rólunk' },
                    ]}
                />
                <Typography>Betöltés...</Typography>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Rólunk - Mit csinálunk?"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Beállítások' },
                    { name: 'Rólunk' },
                ]}
                action={
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={handleOpenNewDialog}
                    >
                        Új Elem
                    </Button>
                }
                sx={{ mb: 3 }}
            />

            <Alert severity="info" sx={{ mb: 3 }}>
                A kártyák sorrendjét húzással (drag & drop) változtathatod meg. A linkek relatív útvonalak legyenek (pl. /termekek).
            </Alert>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={({ active }) => setActiveId(active.id)}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={items.map((i) => i.id!)} strategy={verticalListSortingStrategy}>
                    <Stack spacing={2}>
                        {items.map((item) => (
                            <SortableAboutUsItem
                                key={item.id}
                                item={item}
                                onEdit={() => handleOpenEditDialog(item)}
                            />
                        ))}
                    </Stack>
                </SortableContext>
                <Portal>
                    <DragOverlay dropAnimation={dropAnimationConfig}>
                        {activeItem ? <AboutUsItemBase item={activeItem} isOverlay /> : null}
                    </DragOverlay>
                </Portal>
            </DndContext>

            {/* Form Dialog */}
            <Dialog 
                open={openFormDialog} 
                onClose={handleCloseFormDialog} 
                fullWidth 
                maxWidth="md"
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 600 },
                        maxWidth: '100%',
                    }
                }}
            >
                <DialogTitle>{editingItem ? 'Elem szerkesztése' : 'Új Elem'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        <TextField
                            name="title"
                            label="Cím"
                            value={formData.title}
                            onChange={handleFormChange}
                            required
                            fullWidth
                        />
                        <TextField
                            name="description"
                            label="Leírás"
                            value={formData.description}
                            onChange={handleFormChange}
                            required
                            multiline
                            rows={4}
                            fullWidth
                        />
                        <TextField
                            name="link"
                            label="Link (opcionális, pl. /termekek)"
                            value={formData.link}
                            onChange={handleFormChange}
                            placeholder="/termekek"
                            fullWidth
                            helperText="Relatív útvonal, domain nélkül"
                        />

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Kép (kötelező)
                            </Typography>
                            <Upload
                                thumbnail
                                maxSize={10 * 1024 * 1024}
                                value={formData.image}
                                onRemove={handleRemoveImage}
                                onDropAccepted={(files) =>
                                    setFormData((prev) => ({ ...prev, image: files[0] }))
                                }
                            />
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    {editingItem && (
                        <Button onClick={() => setOpenDeleteConfirm(true)} color="error">
                            Törlés
                        </Button>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Button onClick={handleCloseFormDialog} color="inherit">
                        Mégse
                    </Button>
                    <LoadingButton onClick={handleSubmit} variant="contained" loading={isSubmitting}>
                        {editingItem ? 'Mentés' : 'Létrehozás'}
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
                <DialogTitle>Törlés Megerősítése</DialogTitle>
                <DialogContent>
                    <Typography>
                        Biztosan törölni szeretnéd a(z) <strong>{editingItem?.title}</strong> nevű elemet?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteConfirm(false)} color="inherit">
                        Mégse
                    </Button>
                    <Button onClick={handleDelete} color="error">
                        Törlés
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}

function SortableAboutUsItem({
    item,
    onEdit,
}: Readonly<{ item: IRolunkWhat; onEdit: () => void }>) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id!,
    });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
    };
    return (
        <AboutUsItemBase
            ref={setNodeRef}
            style={style}
            item={item}
            onEdit={onEdit}
            isDragging={isDragging}
            attributes={attributes}
            listeners={listeners}
        />
    );
}

function AboutUsItemBase({
    item,
    onEdit,
    isDragging,
    isOverlay,
    ...props
}: Readonly<{
    item: IRolunkWhat;
    onEdit?: () => void;
    isDragging?: boolean;
    isOverlay?: boolean;
    [key: string]: any;
}>) {
    return (
        <Paper
            elevation={isOverlay ? 8 : 1}
            sx={{
                opacity: isDragging ? 0.48 : 1,
                '&:hover .actions': { opacity: 1 },
            }}
            {...props}
        >
            <Card>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                    <CardMedia
                        component="img"
                        sx={{
                            width: { xs: '100%', sm: 200 },
                            height: { xs: 200, sm: 'auto' },
                            objectFit: 'cover',
                        }}
                        image={item.image || 'https://placehold.co/200x125/png'}
                        alt={item.title}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h6" component="div">
                                {item.title}
                            </Typography>
                            <Stack
                                direction="row"
                                className="actions"
                                spacing={1}
                                sx={{
                                    opacity: { xs: 1, sm: 0 },
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                {onEdit && (
                                    <IconButton size="small" onClick={onEdit}>
                                        <Iconify icon="solar:pen-bold" />
                                    </IconButton>
                                )}
                                <IconButton size="small" {...props.listeners} sx={{ cursor: 'grab' }}>
                                    <Iconify icon="custom:drag-dots-fill" />
                                </IconButton>
                            </Stack>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {item.description}
                        </Typography>
                        {item.link && (
                            <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                                Link: {item.link}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Card>
        </Paper>
    );
}
