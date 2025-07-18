import type { IUserProfileGallery } from 'src/types/user';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { fDate } from 'src/utils/format-time';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { Lightbox, useLightBox } from 'src/components/lightbox';

// ----------------------------------------------------------------------

type Props = {
    gallery: IUserProfileGallery[];
};

export function ProfileGallery({ gallery }: Props) {
    const slides = gallery.map((slide) => ({ src: slide.imageUrl }));
    const lightbox = useLightBox(slides);

    return (
        <>
            <Typography variant="h4" sx={{ my: 5 }}>
                Gallery
            </Typography>

            <Box
                sx={{
                    gap: 3,
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                    },
                }}
            >
                {gallery.map((image) => (
                    <Card key={image.id} sx={{ cursor: 'pointer', color: 'common.white' }}>
                        <IconButton
                            color="inherit"
                            sx={{
                                top: 8,
                                right: 8,
                                zIndex: 9,
                                position: 'absolute',
                            }}
                        >
                            <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>

                        <ListItemText
                            sx={{
                                p: 3,
                                left: 0,
                                width: 1,
                                bottom: 0,
                                zIndex: 9,
                                position: 'absolute',
                            }}
                            primary={image.title}
                            secondary={fDate(image.postedAt)}
                            slotProps={{
                                primary: {
                                    noWrap: true,
                                    sx: { typography: 'subtitle1' },
                                },
                                secondary: {
                                    sx: { mt: 0.5, opacity: 0.48, color: 'inherit' },
                                },
                            }}
                        />

                        <Image
                            alt="Gallery"
                            ratio="1/1"
                            src={image.imageUrl}
                            onClick={() => lightbox.onOpen(image.imageUrl)}
                            slotProps={{
                                overlay: {
                                    sx: (theme) => ({
                                        backgroundImage: `linear-gradient(to bottom, transparent 0%, ${theme.vars.palette.common.black} 75%)`,
                                    }),
                                },
                            }}
                        />
                    </Card>
                ))}
            </Box>

            <Lightbox
                index={lightbox.selected}
                slides={slides}
                open={lightbox.open}
                close={lightbox.onClose}
            />
        </>
    );
}
