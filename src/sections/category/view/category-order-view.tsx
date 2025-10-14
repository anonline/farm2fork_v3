'use client';

import type { UniqueIdentifier } from '@dnd-kit/core';

import { useState, useEffect, useCallback } from 'react';
import {
    useSortable,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
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
    MeasuringStrategy,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';

import { useCategories } from 'src/contexts/category-context';
import { updateCategoryOrder, useGetCategoryOrder } from 'src/actions/category-order';

// ----------------------------------------------------------------------

type SortableItemProps = {
    id: UniqueIdentifier;
    name: string;
    parentPath?: string;
    disabled?: boolean;
    level?: number;
};

function SortableItem({ id, name, parentPath, disabled, level = 0 }: Readonly<SortableItemProps>) {
    const theme = useTheme();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled });

    let cursor = 'grab';
    if (isDragging) {
        cursor = 'grabbing';
    } else if (disabled) {
        cursor = 'not-allowed';
    }

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor,
    };

    // Calculate left margin based on hierarchy level (24px per level)
    const leftMargin = level * 3; // 3 per level (24px)

    return (
        <Box
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            sx={{
                py: 0.75,
                px: 1.5,
                mb: 0.5,
                ml: leftMargin,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 0.75,
                '&:hover': {
                    bgcolor: 'action.hover',
                },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {level > 0 && (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: 'text.disabled',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        mr: -0.5
                    }}>
                        └
                    </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5 }}>
                    <Iconify icon="custom:drag-dots-fill" width={18} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: parentPath ? '36px' : '24px', justifyContent: 'center' }}>
                    {parentPath && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.disabled',
                                fontStyle: 'italic',
                                fontSize: '0.7rem',
                                lineHeight: 1.2,
                                mb: 0.125
                            }}
                        >
                            {parentPath}
                        </Typography>
                    )}
                    <Typography variant="body2" sx={{ lineHeight: 1.3 }}>{name}</Typography>
                </Box>
            </Box>
        </Box>
    );
}

// ----------------------------------------------------------------------

export function CategoryOrderView() {
    const theme = useTheme();
    const { allCategories, loading: categoriesLoading } = useCategories();
    const { categoryOrder, categoryOrderLoading } = useGetCategoryOrder();

    const [items, setItems] = useState<Array<{ id: number; name: string; parentPath?: string; parentId: number | null; level: number }>>([]);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Helper function to build full parent path
    const buildParentPath = useCallback((categoryId: number | null): string => {
        if (!categoryId) return '';

        const path: string[] = [];
        let currentId: number | null = categoryId;

        // Traverse up the hierarchy to build the full path
        while (currentId) {
            const category = allCategories.find((cat) => cat.id === currentId);
            if (!category) break;

            path.unshift(category.name);
            currentId = category.parentId;
        }

        return path.length > 0 ? path.join('/') : '';
    }, [allCategories]);

    // Helper function to calculate the depth level of a category
    const getCategoryLevel = useCallback((categoryId: number | null): number => {
        if (!categoryId) return 0;

        let level = 0;
        let currentId: number | null = categoryId;

        // Traverse up the hierarchy to count levels
        while (currentId) {
            const category = allCategories.find((cat) => cat.id === currentId);
            if (!category?.parentId) break;

            level += 1;
            currentId = category.parentId;
        }

        return level;
    }, [allCategories]);

    // Helper function to get all descendants of a category (children, grandchildren, etc.)
    const getAllDescendants = useCallback((categoryId: number, itemsList: Array<{ id: number; parentId: number | null }>): number[] => {
        const descendants: number[] = [];
        const directChildren = itemsList.filter((item) => item.parentId === categoryId);
        
        directChildren.forEach((child) => {
            descendants.push(child.id);
            // Recursively get descendants of this child
            const childDescendants = getAllDescendants(child.id, itemsList);
            descendants.push(...childDescendants);
        });
        
        return descendants;
    }, []);

    // Initialize items from categories and category order
    useEffect(() => {
        if (!categoriesLoading && !categoryOrderLoading && allCategories.length > 0) {
            // Get all categories and filter to only include level 0 and level 1
            const categoriesWithIds = allCategories
                .filter((cat) => cat.id !== null)
                .filter((cat) => {
                    const level = getCategoryLevel(cat.id);
                    return level === 0 || level === 1;
                });

            if (categoryOrder.length > 0) {
                // Sort by existing order
                const orderMap = new Map<number, number>();
                categoryOrder.forEach((id, index) => {
                    orderMap.set(id, index);
                });

                const sorted = [...categoriesWithIds].sort((a, b) => {
                    const orderA = a.id !== null ? orderMap.get(a.id) : undefined;
                    const orderB = b.id !== null ? orderMap.get(b.id) : undefined;

                    if (orderA !== undefined && orderB !== undefined) {
                        return orderA - orderB;
                    }
                    if (orderA !== undefined) return -1;
                    if (orderB !== undefined) return 1;
                    return a.name.localeCompare(b.name);
                });

                setItems(
                    sorted.map((cat) => ({
                        id: cat.id as number,
                        name: cat.name,
                        parentPath: buildParentPath(cat.parentId),
                        parentId: cat.parentId,
                        level: getCategoryLevel(cat.id),
                    }))
                );
            } else {
                // Default alphabetical order
                const sorted = [...categoriesWithIds].sort((a, b) =>
                    a.name.localeCompare(b.name)
                );
                setItems(
                    sorted.map((cat) => ({
                        id: cat.id as number,
                        name: cat.name,
                        parentPath: buildParentPath(cat.parentId),
                        parentId: cat.parentId,
                        level: getCategoryLevel(cat.id),
                    }))
                );
            }
        }
    }, [allCategories, categoryOrder, categoriesLoading, categoryOrderLoading, buildParentPath, getCategoryLevel]);

    const handleDragStart = useCallback((event: any) => {
        setActiveId(event.active.id);
    }, []);

    const handleDragEnd = useCallback((event: any) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((currentItems) => {
                const draggedId = active.id as number;
                const targetId = over.id as number;
                
                // Find all items that need to move (dragged item + all its descendants)
                const descendantIds = getAllDescendants(draggedId, currentItems);
                const itemsToMove = [draggedId, ...descendantIds];
                
                // Find indices
                const oldIndex = currentItems.findIndex((item) => item.id === draggedId);
                const newIndex = currentItems.findIndex((item) => item.id === targetId);
                
                // Separate items that will move from items that won't
                const movingItems = currentItems.filter((item) => itemsToMove.includes(item.id));
                const staticItems = currentItems.filter((item) => !itemsToMove.includes(item.id));
                
                // Calculate the new position
                let insertIndex: number;
                if (newIndex > oldIndex) {
                    // Moving down - insert after target and its descendants
                    const targetDescendants = getAllDescendants(targetId, currentItems);
                    const allTargetItems = [targetId, ...targetDescendants];
                    
                    // Find the last item in the target group
                    let lastTargetIndex = -1;
                    for (let i = currentItems.length - 1; i >= 0; i -= 1) {
                        if (allTargetItems.includes(currentItems[i].id)) {
                            lastTargetIndex = i;
                            break;
                        }
                    }
                    
                    const lastTargetId = lastTargetIndex >= 0 ? currentItems[lastTargetIndex].id : targetId;
                    insertIndex = staticItems.findIndex((item) => item.id === lastTargetId) + 1;
                } else {
                    // Moving up - insert before target
                    insertIndex = staticItems.findIndex((item) => item.id === targetId);
                }
                
                // Reconstruct the array with items in new positions
                const newItems = [
                    ...staticItems.slice(0, insertIndex),
                    ...movingItems,
                    ...staticItems.slice(insertIndex),
                ];
                
                setHasChanges(true);
                return newItems;
            });
        }

        setActiveId(null);
    }, [getAllDescendants]);

    const handleDragCancel = useCallback(() => {
        setActiveId(null);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const categoryIds = items.map((item) => item.id);
            await updateCategoryOrder(categoryIds);
            toast.success('Kategória sorrend sikeresen mentve!');
            setHasChanges(false);
        } catch (error) {
            console.error('Error saving category order:', error);
            toast.error('Kategória sorrend mentése sikertelen');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        // Reset to alphabetical order
        const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
        setItems(sorted);
        setHasChanges(true);
    };

    if (categoriesLoading || categoryOrderLoading) {
        return (
            <DashboardContent>
                <Box sx={{ p: 3 }}>
                    <Typography>Betöltés...</Typography>
                </Box>
            </DashboardContent>
        );
    }

    const activeItem = items.find((item) => item.id === activeId);

    return (
        <DashboardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
                    {hasChanges && (
                        <Box
                            sx={{
                                py: 0,
                                px: 1.5,
                                bgcolor: 'warning.lighter',
                                border: `1px solid ${theme.palette.warning.main}`,
                                borderRadius: 0.75,
                            }}
                        >
                            <Typography variant="caption" color="warning.darker">
                                Mentetlen módosításaid vannak. Kattints a "Sorrend mentése" gombra a változtatások alkalmazásához.
                            </Typography>
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={handleReset}
                            startIcon={<Iconify icon="solar:restart-bold" width={16} />}
                        >
                            Alaphelyzet (ABC)
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                            startIcon={<Iconify icon="solar:check-circle-bold" width={16} />}
                        >
                            {isSaving ? 'Mentés...' : 'Sorrend mentése'}
                        </Button>
                    </Box>
                </Box>



                <Card>
                    <CardHeader
                        title="Termék kategóriák sorrendja a dokumentumokban"
                        subheader="Húzd és ejtsd a kategóriákat az átrendezéshez. A szülő kategóriák halvány betűvel jelennek meg minden kategória neve felett."
                        sx={{ pb: 1 }}
                    />
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragCancel={handleDragCancel}
                            measuring={{
                                droppable: {
                                    strategy: MeasuringStrategy.Always,
                                },
                            }}
                        >
                            <SortableContext
                                items={items.map((item) => item.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {items.map((item) => (
                                    <SortableItem
                                        key={item.id}
                                        id={item.id}
                                        name={item.name}
                                        parentPath={item.parentPath}
                                        level={item.level}
                                    />
                                ))}
                            </SortableContext>
                            <DragOverlay>
                                {activeItem ? (
                                    <Box
                                        sx={{
                                            py: 0.75,
                                            px: 1.5,
                                            ml: (activeItem.level || 0) * 3,
                                            bgcolor: 'background.paper',
                                            border: `2px solid ${theme.palette.primary.main}`,
                                            borderRadius: 0.75,
                                            boxShadow: theme.shadows[8],
                                            minWidth: 200,
                                        }}
                                    >
                                        {activeItem.parentPath && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'text.disabled',
                                                    fontStyle: 'italic',
                                                    fontSize: '0.7rem',
                                                    lineHeight: 1.2,
                                                    display: 'block',
                                                    mb: 0.125
                                                }}
                                            >
                                                {activeItem.parentPath}
                                            </Typography>
                                        )}
                                        <Typography variant="body2" sx={{ lineHeight: 1.3 }}>{activeItem.name}</Typography>
                                    </Box>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </Box>
                </Card>

            </Box>
        </DashboardContent>
    );
}
