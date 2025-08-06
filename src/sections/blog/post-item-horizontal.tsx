import type { CardProps } from '@mui/material/Card';
import type { IArticleItem } from 'src/types/article';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------


type Props = CardProps & {
    post: IArticleItem;
    onEdit: () => void;
    detailsHref: string;
};

export function PostItemHorizontal({ sx, post, onEdit, detailsHref, ...other }: Props) {
    const menuActions = usePopover();

    const renderMenuActions = () => (
        <CustomPopover
            open={menuActions.open}
            anchorEl={menuActions.anchorEl}
            onClose={menuActions.onClose}
            slotProps={{ arrow: { placement: 'bottom-center' } }}
        >
            {/* --- JAVÍTÁS ITT: A felesleges <li> tagek eltávolítva --- */}
            <MenuList>
                <MenuItem
                    component="a"
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => menuActions.onClose()}
                >
                    <Iconify icon="solar:eye-bold" />
                    View
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        onEdit();
                        menuActions.onClose();
                    }}
                >
                    <Iconify icon="solar:pen-bold" />
                    Edit
                </MenuItem>
                
                <MenuItem onClick={() => menuActions.onClose()} sx={{ color: 'error.main' }}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                    Delete
                </MenuItem>
            </MenuList>
        </CustomPopover>
    );
    
    return (
        <>
            <Card sx={[{ display: 'flex' }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
                <Stack
                    spacing={1}
                    sx={[
                        (theme) => ({
                            flexGrow: 1,
                            p: theme.spacing(3, 3, 2, 3),
                        }),
                    ]}
                >
                    <Box
                        sx={{
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Label
                            variant="soft"
                            color={(post.publish === 'published' && 'info') || 'default'}
                        >
                            {post.publish}
                        </Label>

                        <Box
                            component="span"
                            sx={{ typography: 'caption', color: 'text.disabled' }}
                        >
                            {fDate(post.publish_date)}
                        </Box>
                    </Box>

                    <Stack spacing={1} sx={{ flexGrow: 1 }}>
                        <Link
                            component={RouterLink}
                            href={detailsHref}
                            color="inherit"
                            variant="subtitle2"
                            sx={[
                                (theme) => ({
                                    ...theme.mixins.maxLine({ line: 2 }),
                                }),
                            ]}
                        >
                            {post.title}
                        </Link>

                        <Typography
                            variant="body2"
                            sx={[
                                (theme) => ({
                                    ...theme.mixins.maxLine({ line: 2 }),
                                    color: 'text.secondary',
                                }),
                            ]}
                        >
                            {post.medium}
                        </Typography>
                    </Stack>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color={menuActions.open ? 'inherit' : 'default'}
                            onClick={menuActions.onOpen}
                        >
                            <Iconify icon="eva:more-horizontal-fill" />
                        </IconButton>
                    </Box>
                </Stack>

                <Box
                    sx={{
                        p: 1,
                        width: 180,
                        height: 240,
                        flexShrink: 0,
                        position: 'relative',
                        display: { xs: 'none', sm: 'block' },
                    }}
                >
                    <Image
                        alt={post.title}
                        src={post.image}
                        sx={{ height: 1, borderRadius: 1.5 }}
                    />
                </Box>
            </Card>

            {renderMenuActions()}
        </>
    );
}