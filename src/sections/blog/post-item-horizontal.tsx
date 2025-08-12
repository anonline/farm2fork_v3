"use client";

import type { CardProps } from '@mui/material/Card';
import type { IArticleItem } from 'src/types/article';

import { useState } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { fDate } from 'src/utils/format-time';

import { POST_PUBLISH_OPTIONS_LABELS } from 'src/_mock/_blog';

import { Label } from 'src/components/label';
import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

type Props = CardProps & {
    post: IArticleItem;
    onEdit: () => void;
    onDelete: () => void;
};

export function PostItemHorizontal({ sx, post, onEdit, onDelete, ...other }: Props) {
    const menuActions = usePopover();
    const [openConfirm, setOpenConfirm] = useState(false);

    const handleOpenConfirm = () => {
        menuActions.onClose();
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    const handleDelete = () => {
        onDelete();
        handleCloseConfirm();
    };

    const renderConfirmDialog = () => (
        <Dialog open={openConfirm} onClose={handleCloseConfirm}>
            <DialogTitle>Törlés Megerősítése</DialogTitle>
            <DialogContent>
                <Typography>
                    Biztosan törölni szeretnéd a(z) <strong>{post.title}</strong> című bejegyzést?
                    <br />
                    A művelet nem vonható vissza.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseConfirm} color="inherit">
                    Mégse
                </Button>
                <Button onClick={handleDelete} color="error" variant="contained">
                    Törlés
                </Button>
            </DialogActions>
        </Dialog>
    );

    const renderMenuActions = () => (
        <CustomPopover
            open={menuActions.open}
            anchorEl={menuActions.anchorEl}
            onClose={menuActions.onClose}
            slotProps={{ arrow: { placement: 'bottom-center' } }}
        >
            <MenuList>
                <MenuItem component="a" href={post.link} target="_blank" rel="noopener noreferrer" onClick={() => menuActions.onClose()}>
                    <Iconify icon="solar:eye-bold" />
                    Megnyitás
                </MenuItem>
                <MenuItem onClick={() => { onEdit(); menuActions.onClose(); }}>
                    <Iconify icon="solar:pen-bold" />
                    Szerkesztés
                </MenuItem>
                <MenuItem onClick={handleOpenConfirm} sx={{ color: 'error.main' }}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                    Törlés
                </MenuItem>
            </MenuList>
        </CustomPopover>
    );

    return (
        <>
            <Card sx={[{ display: 'flex' }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
                <Stack spacing={1} sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Label variant="soft" color={(post.publish === 'published' && 'info') || 'default'}>
                            {POST_PUBLISH_OPTIONS_LABELS.find(label => label.value === post.publish)?.label}
                        </Label>
                        <Box component="span" sx={{ typography: 'caption', color: 'text.disabled' }}>
                            {fDate(post.publish_date)}
                        </Box>
                    </Box>
                    <Stack spacing={1} sx={{ flexGrow: 1 }}>
                        <Link color="inherit" variant="subtitle2">
                            {post.title}
                        </Link>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {post.medium}
                        </Typography>
                    </Stack>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            {post.categories.length > 0 ? post.categories.map(cat => (
                                <Label variant="soft" color="default" key={cat.id}>
                                    {cat.title}
                                </Label>
                            )) : 'Nincs kategória'}
                        </Box>
                        <IconButton color={menuActions.open ? 'inherit' : 'default'} onClick={menuActions.onOpen}>
                            <Iconify icon="eva:more-horizontal-fill" />
                        </IconButton>
                    </Box>
                </Stack>
                <Box sx={{ p: 1, width: 240, height: 240, flexShrink: 0, position: 'relative', display: { xs: 'none', sm: 'block' } }}>
                    <Image alt={post.title} src={post.image} sx={{ height: 1, borderRadius: 1.5 }} />
                </Box>
            </Card>
            {renderMenuActions()}
            {renderConfirmDialog()}
        </>
    );
}