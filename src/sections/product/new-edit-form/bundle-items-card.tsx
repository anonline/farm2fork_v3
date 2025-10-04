'use client';

import type { IBundleItem } from 'src/types/product';

import { useState } from 'react';

import {
    Box,
    Card,
    Stack,
    Table,
    Button,
    Avatar,
    TableRow,
    Collapse,
    TableBody,
    TableCell,
    TableHead,
    IconButton,
    Typography,
    CardHeader,
    TableContainer,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { AddBundleItemModal } from './add-bundle-item-modal';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
    isOpen: any;
    bundleItems: IBundleItem[];
    onAddItem: (item: { productId: string; qty: number; product?: any }) => void;
    onUpdateItem: (productId: string, qty: number) => void;
    onDeleteItem: (productId: string) => void;
};

export function BundleItemsCard({ isOpen, bundleItems, onAddItem, onUpdateItem, onDeleteItem }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<IBundleItem | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        productId: string | null;
    }>({
        open: false,
        productId: null,
    });

    const handleOpenModal = () => {
        setEditingItem(null);
        setModalOpen(true);
    };

    const handleEditItem = (item: IBundleItem) => {
        setEditingItem(item);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingItem(null);
    };

    const handleAddOrUpdate = (item: { productId: string; qty: number }) => {
        if (editingItem) {
            // When editing, use the original productId from editingItem
            onUpdateItem(editingItem.productId, item.qty);
        } else {
            onAddItem(item);
        }
        handleCloseModal();
    };

    const handleDeleteClick = (productId: string) => {
        setConfirmDialog({ open: true, productId });
    };

    const handleConfirmDelete = () => {
        if (confirmDialog.productId) {
            onDeleteItem(confirmDialog.productId);
        }
        setConfirmDialog({ open: false, productId: null });
    };

    const handleCancelDelete = () => {
        setConfirmDialog({ open: false, productId: null });
    };

    const existingProductIds = bundleItems.map((item) => item.productId);

    return (
        <>
            <Card>
                <CardHeader
                    title="Csomag tartalma"
                    action={
                        <IconButton onClick={isOpen.onToggle}>
                            <Iconify
                                icon={isOpen.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                            />
                        </IconButton>
                    }
                />

                <Collapse in={isOpen.value} unmountOnExit>
                    <Stack spacing={2} sx={{ p: 3, pt: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<Iconify icon="mingcute:add-line" />}
                                onClick={handleOpenModal}
                            >
                                Hozzáadás
                            </Button>
                        </Box>

                        {bundleItems.length === 0 ? (
                            <Box
                                sx={{
                                    py: 6,
                                    textAlign: 'center',
                                    color: 'text.secondary',
                                }}
                            >
                                <Typography variant="body2">
                                    Még nem adtál hozzá terméket a csomaghoz
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Termék</TableCell>
                                            <TableCell align="center">Mennyiség</TableCell>
                                            <TableCell align="center">Mértékegység</TableCell>
                                            <TableCell align="right">Ár (bruttó)</TableCell>
                                            <TableCell align="right">Műveletek</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bundleItems.map((item) => (
                                            <TableRow key={item.productId}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar
                                                            src={item.product?.featuredImage || ''}
                                                            alt={item.product?.name}
                                                            variant="rounded"
                                                            sx={{ width: 48, height: 48 }}
                                                        />
                                                        <Box>
                                                            <Typography variant="subtitle2">
                                                                {item.product?.name || 'Ismeretlen termék'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                SKU: {item.product?.sku || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2">{item.qty}</Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2">
                                                        {item.product?.unit || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2">
                                                        {item.product?.grossPrice
                                                            ? `${fCurrency(item.product.grossPrice)}`
                                                            : 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditItem(item)}
                                                            color="default"
                                                        >
                                                            <Iconify icon="solar:pen-bold" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteClick(item.productId)}
                                                            color="error"
                                                        >
                                                            <Iconify icon="solar:trash-bin-trash-bold" />
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Stack>
                </Collapse>
            </Card>

            <AddBundleItemModal
                open={modalOpen}
                onClose={handleCloseModal}
                onAdd={handleAddOrUpdate}
                existingProductIds={existingProductIds}
                editItem={editingItem}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onClose={handleCancelDelete}
                title="Törlés megerősítése"
                content="Biztosan törölni szeretnéd ezt a terméket a csomagból?"
                action={
                    <Button variant="contained" color="error" onClick={handleConfirmDelete}>
                        Törlés
                    </Button>
                }
            />
        </>
    );
}
