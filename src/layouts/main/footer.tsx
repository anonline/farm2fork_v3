import type { Breakpoint } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Button, Checkbox, TextField, FormControlLabel } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _socials } from 'src/_mock';
import { CONFIG } from 'src/global-config';

import { Logo } from 'src/components/logo';
import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const LINKS = [
    {
        headline: 'Termékek',
        children: [
            { name: 'Összes termék', href: paths.product.root },
            { name: 'Zöldségek', href: paths.categories.zoldsegek },
            { name: 'Gyümölcsök', href: paths.categories.gyumolcsok },
            { name: 'Gombák', href: paths.categories.gombak },
            { name: 'Feldolgozott termékek', href: paths.categories.feldolgozottTermekek },
            { name: 'Egyéb termékek', href: paths.categories.egyeb },
            { name: 'Pékáru', href: paths.categories.pekaru },
        ],
    },
    {
        headline: 'Tudnivalók',
        children: [
            { name: 'Tárolás', href: paths.tarolas },
            { name: 'Rólunk', href: paths.rolunk },
            { name: 'GYIK', href: paths.faqs },
            { name: 'ÁSZF', href: paths.aszf },
            { name: 'Adatkezelési tájékoztató', href: paths.adatkezelesi },
            { name: 'Kapcsolat', href: '#' },
        ],
    },
];

// ----------------------------------------------------------------------

const FooterRoot = styled('footer')(({ theme }) => ({
    position: 'relative',
    //backgroundColor: theme.vars.palette.background.default,
    backgroundColor: theme.vars.palette.primary.main,
    color: theme.vars.palette.common.white,
}));

export type FooterProps = React.ComponentProps<typeof FooterRoot>;

export function Footer({
    sx,
    layoutQuery = 'md',
    ...other
}: FooterProps & { layoutQuery?: Breakpoint }) {
    return (
        <FooterRoot sx={sx} {...other}>
            <Container
                sx={{
                    mt: 3,
                    mb: 6,
                    display: 'flex',
                    gap: { xs: 3, md: 1 },
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'start',
                }}
            >
                <Box sx={{ width: '60%' }}>
                    <Typography variant="h3" sx={{ textTransform: 'uppercase', mb: 1 }}>
                        Iratkozz fel a hírlevelünkre!
                    </Typography>
                    <Typography variant="body2">
                        Minden héten értesítünk az újdonságokról
                    </Typography>
                </Box>
                <Box>
                    <Box
                        sx={{
                            gap: { xs: 3, md: 0 },
                            display: 'flex',
                            alignItems: 'flex-start',
                            flexDirection: { xs: 'column', md: 'row' },
                        }}
                    >
                        <TextField
                            type="email"
                            variant="filled"
                            label="E-mail cím"
                            placeholder="E-mail cím"
                            sx={{
                                mr: 2,
                                mb: 2,
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                Height: '25px',
                                width: '300px',
                            }}
                        />
                        <Button
                            variant="outlined"
                            sx={{ border: 1, color: 'white', padding: '8px 24px' }}
                        >
                            Feliratkozom
                        </Button>
                    </Box>
                    <FormControlLabel
                        value="mailchimp"
                        label="Elfogadom az adatkezelési tájékoztatót"
                        labelPlacement="end"
                        control={
                            <Checkbox
                                size="medium"
                                color="success"
                                slotProps={{
                                    input: {
                                        id: `mailchimp_agree-checkbox`,
                                    },
                                }}
                            />
                        }
                        sx={{ zIndex: 1 }}
                    />
                </Box>
            </Container>

            <Container
                sx={(theme) => ({
                    pb: 2,
                    pt: 2,
                    textAlign: 'center',
                    [theme.breakpoints.up(layoutQuery)]: { textAlign: 'unset' },
                })}
            >
                <Divider
                    variant="middle"
                    sx={{
                        mx: 'auto',
                        width: '100%',
                        borderBottomWidth: '1px',
                        borderColor: '#F7F5EF80',
                    }}
                />

                <Grid
                    container
                    sx={[
                        (theme) => ({
                            my: 5,
                            justifyContent: 'center',
                            [theme.breakpoints.up(layoutQuery)]: {
                                justifyContent: 'space-between',
                            },
                        }),
                    ]}
                >
                    <Grid
                        size={{ xs: 12, [layoutQuery]: 3 }}
                        sx={{ placeItems: { sx: 'self-start', md: 'flex-start' } }}
                    >
                        <Logo
                            isSingle
                            isLight
                            sx={{
                                width: { sx: '100%', md: '185px' },
                                height: '50px',
                                textAlign: 'left',
                                pl:1
                            }}
                        />

                        <Typography
                            variant="body2"
                            sx={(theme) => ({
                                mx: { sx: 'left', md: 'auto' },
                                mt: 3,
                                maxWidth: 280,
                                ml:0,
                                pl:1,
                                [theme.breakpoints.up(layoutQuery)]: { mx: 'unset' },
                            })}
                        >
                            Szezonális termékek hazai termelőktől
                        </Typography>

                        <Box
                            sx={(theme) => ({
                                mt: 3,
                                mb: 5,
                                color: theme.vars.palette.common.white,
                                display: 'flex',
                                gap: 1,
                                width: '100%',
                                justifyContent: 'flex-start',
                                flexDirection: 'column',
                                [theme.breakpoints.up(layoutQuery)]: {
                                    mb: 0,
                                    justifyContent: 'flex-start',
                                },
                            })}
                        >
                            {_socials.map((social) => (
                                <IconButton
                                    key={social.label}
                                    href={social.path}
                                    sx={(theme) => ({
                                        color: theme.vars.palette.common.white,
                                        fontSize: theme.typography.fontSize,
                                        justifyContent: 'flex-start',
                                    })}
                                >
                                    {social.value === 'email' && (
                                        <>
                                            <Iconify icon="solar:letter-bold" sx={{ mr: 2 }} />{' '}
                                            {social.label}{' '}
                                        </>
                                    )}
                                    {social.value === 'phone' && (
                                        <>
                                            <Iconify icon="solar:phone-bold" sx={{ mr: 2 }} />{' '}
                                            {social.label}{' '}
                                        </>
                                    )}
                                </IconButton>
                            ))}
                        </Box>

                        <Box
                            sx={{
                                p: 1,
                                ml: 1,
                                background: 'white',
                                borderRadius: 4,
                                width: '80%',
                                mt: 3,
                                maxWidth: '250px',
                            }}
                        >
                            <Image
                                src={`${CONFIG.assetsDir}/assets/images/footer/simplepay-logos.webp`}
                            />
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, [layoutQuery]: 6 }} sx={{ mt: { xs: 4, md: 0 } }}>
                        <Box
                            sx={(theme) => ({
                                gap: 5,
                                display: 'flex',
                                flexDirection: 'column',
                                [theme.breakpoints.up(layoutQuery)]: { flexDirection: 'row' },
                            })}
                        >
                            {LINKS.map((list) => (
                                <Box
                                    key={list.headline}
                                    sx={(theme) => ({
                                        gap: 2,
                                        width: 1,
                                        display: 'flex',
                                        alignItems: { xs: 'flex-start', md: 'center' },
                                        flexDirection: 'column',
                                        [theme.breakpoints.up(layoutQuery)]: {
                                            alignItems: 'flex-start',
                                        },
                                    })}
                                >
                                    <Typography component="div" variant="overline">
                                        {list.headline}
                                    </Typography>

                                    {list.children.map((link) => (
                                        <Link
                                            key={link.name}
                                            component={RouterLink}
                                            href={link.href}
                                            color="inherit"
                                            variant="body2"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                </Grid>

                <Divider
                    variant="middle"
                    sx={{
                        mx: 'auto',
                        width: '100%',
                        borderBottomWidth: '1px',
                        borderColor: '#F7F5EF80',
                    }}
                />

                <Container
                    sx={{
                        mt: 3,
                        mx: 0,
                        padding: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        justifyItems: 'center',
                        flexDirection: { xs: 'column', md: 'row' },
                    }}
                >
                    <Typography variant="body2">2025 | Farm2Fork - All rights reserved.</Typography>
                    <Box>
                        <IconButton
                            href="#"
                            sx={(theme) => ({
                                color: theme.vars.palette.common.white,
                                fontSize: theme.typography.fontSize,
                                justifyContent: 'flex-start',
                            })}
                        >
                            <Iconify icon="socials:instagram" sx={{ mr: 2 }} />
                        </IconButton>
                        <IconButton
                            href="#"
                            sx={(theme) => ({
                                color: theme.vars.palette.common.white,
                                fontSize: theme.typography.fontSize,
                                justifyContent: 'flex-start',
                            })}
                        >
                            <Iconify icon="socials:facebook" sx={{ mr: 2 }} />
                        </IconButton>
                    </Box>
                </Container>
            </Container>
        </FooterRoot>
    );
}

// ----------------------------------------------------------------------

export function HomeFooter({ sx, ...other }: FooterProps) {
    return (
        <FooterRoot
            sx={[
                {
                    py: 5,
                    textAlign: 'center',
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            <Container>
                <Logo />
                <Box sx={{ mt: 1, typography: 'caption' }}>
                    © All rights reserved.
                    <br /> made by
                    <Link href="https://minimals.cc/"> minimals.cc </Link>
                </Box>
            </Container>
        </FooterRoot>
    );
}
