import { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller, useFormContext } from 'react-hook-form';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { varAlpha } from 'minimal-shared/utils';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface SortableImageItemProps {
    id: string;
    file: File | string;
    onRemove: () => void;
}

function SortableImageItem({ id, file, onRemove }: SortableImageItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getImageUrl = (imageFile: File | string) => {
        if (typeof imageFile === 'string') {
            return imageFile;
        }
        return URL.createObjectURL(imageFile);
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            sx={{
                p: 1,
                width: 120,
                height: 120,
                position: 'relative',
                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                borderRadius: 1,
                cursor: isDragging ? 'grabbing' : 'grab',
                '&:hover': {
                    '& .remove-button': {
                        opacity: 1,
                    },
                },
            }}
            {...attributes}
            {...listeners}
        >
            <Box
                component="img"
                src={getImageUrl(file)}
                alt="Product image"
                sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 0.5,
                }}
            />
            <IconButton
                className="remove-button"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 24,
                    height: 24,
                    bgcolor: 'error.main',
                    color: 'white',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                        bgcolor: 'error.dark',
                    },
                }}
            >
                <Iconify icon="mingcute:close-line" width={14} />
            </IconButton>
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Iconify icon="mingcute:dot-grid-fill" width={12} color="white" />
            </Box>
        </Paper>
    );
}

// ----------------------------------------------------------------------

interface RHFDragDropImagesProps {
    name: string;
    label?: string;
    helperText?: string;
}

export function RHFDragDropImages({ name, label = "Termék képek", helperText }: RHFDragDropImagesProps) {
    const { control, setValue, watch } = useFormContext();
    const watchedImages = watch(name) || [];

    const images = useMemo(() => watchedImages || [], [watchedImages]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const currentImages = images;
            const newImages = [...currentImages, ...acceptedFiles].slice(0, 3); // Limit to 3 images
            setValue(name, newImages, { shouldValidate: true });
        },
        [images, name, setValue]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
        },
        multiple: true,
        disabled: images.length >= 3,
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = images.findIndex((item: any, index: number) => 
                `image-${index}` === active.id
            );
            const newIndex = images.findIndex((item: any, index: number) => 
                `image-${index}` === over?.id
            );

            if (oldIndex !== -1 && newIndex !== -1) {
                const newImages = arrayMove(images, oldIndex, newIndex);
                setValue(name, newImages, { shouldValidate: true });
            }
        }
    };

    const removeImage = (indexToRemove: number) => {
        const newImages = images.filter((_: any, index: number) => index !== indexToRemove);
        setValue(name, newImages, { shouldValidate: true });
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ fieldState: { error } }) => (
                <Stack spacing={2}>
                    <Typography variant="subtitle2">{label}</Typography>
                    
                    {/* Upload Area */}
                    {images.length < 3 && (
                        <Box
                            {...getRootProps()}
                            sx={(theme) => ({
                                p: 3,
                                border: `2px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.3)}`,
                                borderRadius: 1,
                                bgcolor: isDragActive 
                                    ? varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
                                    : varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'center',
                                '&:hover': {
                                    bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                                },
                                ...(error && {
                                    borderColor: 'error.main',
                                    bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.08),
                                }),
                            })}
                        >
                            <input {...getInputProps()} />
                            <Stack spacing={1} alignItems="center">
                                <Iconify icon="eva:cloud-upload-fill" width={40} />
                                <Typography variant="body2">
                                    {isDragActive
                                        ? 'Húzza ide a képeket...'
                                        : 'Húzza ide a képeket vagy kattintson a tallózáshoz'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Maximum 3 kép, PNG, JPG, GIF, WEBP
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {3 - images.length} kép maradt
                                </Typography>
                            </Stack>
                        </Box>
                    )}

                    {/* Images Grid with Drag & Drop */}
                    {images.length > 0 && (
                        <Box>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={images.map((_: any, index: number) => `image-${index}`)}
                                    strategy={rectSortingStrategy}
                                >
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, 120px)',
                                            gap: 2,
                                            justifyContent: 'flex-start',
                                        }}
                                    >
                                        {images.map((file: File | string, index: number) => (
                                            <SortableImageItem
                                                key={`image-${index}`}
                                                id={`image-${index}`}
                                                file={file}
                                                onRemove={() => removeImage(index)}
                                            />
                                        ))}
                                    </Box>
                                </SortableContext>
                            </DndContext>
                            
                            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => setValue(name, [], { shouldValidate: true })}
                                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                                >
                                    Összes törlése
                                </Button>
                                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                                    Húzza a képeket az átrendezéshez
                                </Typography>
                            </Stack>
                        </Box>
                    )}

                    {/* Error Message */}
                    {(error?.message || helperText) && (
                        <FormHelperText error={!!error}>
                            {error?.message || helperText}
                        </FormHelperText>
                    )}
                </Stack>
            )}
        />
    );
}
