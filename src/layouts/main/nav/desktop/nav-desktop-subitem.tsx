import type { CSSObject } from '@mui/material/styles';

import { mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';

import { themeConfig } from 'src/theme';

import { Iconify } from 'src/components/iconify';
import { createNavItem, navItemStyles, navSectionClasses } from 'src/components/nav-section';

import type { NavItemProps } from '../types';
import { Image } from 'src/components/image';
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

export function NavSubItem({
    title,
    subtitle,
    icon,
    path,
    /********/
    open,
    active,
    /********/
    subItem,
    hasChild,
    className,
    externalLink,
    ...other
}: NavItemProps) {
    const navItem = createNavItem({ path, hasChild, externalLink });

    const ownerState: StyledState = { open, active, variant: !subItem ? 'rootItem' : 'subItem' };

    return (
        <ItemRoot
            disableRipple
            aria-label={title}
            {...ownerState}
            {...navItem.baseProps}
            className={mergeClasses([navSectionClasses.item.root, className], {
                [navSectionClasses.state.open]: open,
                [navSectionClasses.state.active]: active,
            })}
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}
            {...other}
        >
            <ItemIcon {...ownerState} sx={{ marginRight: '8px' }}>
                {typeof icon === 'string' ? (
                    <Image src={icon} alt={title}></Image>
                ) : (
                    icon
                )}
            </ItemIcon>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <ItemTitle {...ownerState} sx={{ textTransform: 'uppercase', fontFamily: themeConfig.fontFamily.primary, fontWeight: 600, fontSize: '14px', lineHeight: '20px' }}>
                    {title}
                </ItemTitle>
                {ownerState.variant === 'subItem' && subtitle && (
                    <ItemSubtitle {...ownerState} sx={{ fontSize: '12px', color: (themeConfig.palette.grey[500], 0.6) }}>
                        {subtitle}
                    </ItemSubtitle>
                )}
                {hasChild && <ItemArrow {...ownerState} icon="eva:arrow-ios-downward-fill" />}
            </Box>
        </ItemRoot>
    );
}

// ----------------------------------------------------------------------

const ItemIcon = styled('span', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'active' })<StyledState>(({ theme }) => ({
    ...navItemStyles.captionIcon,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    variants: [
        { props: { variant: 'subItem' }, style: { marginRight: theme.spacing(1) } },
        { props: { active: true }, style: { color: theme.vars.palette.primary.main } },
    ],
}));

const ItemSubtitle = styled('span', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'active' })<StyledState>(({ theme }) => ({
    ...navItemStyles.captionText(theme),
    ...theme.typography.body2,
    fontWeight: theme.typography.fontWeightRegular,
    variants: [
        { props: { variant: 'subItem' }, style: { fontSize: theme.typography.pxToRem(12) } },
        { props: { active: true }, style: { fontWeight: theme.typography.fontWeightMedium } },
    ],
}));


type StyledState = Pick<NavItemProps, 'open' | 'active'> & {
    variant: 'rootItem' | 'subItem';
};

const shouldForwardProp = (prop: string) => !['open', 'active', 'variant', 'sx'].includes(prop);

/**
 * @slot root
 */
const ItemRoot = styled(ButtonBase, { shouldForwardProp })<StyledState>(({
    active,
    open,
    theme,
}) => {
    const rootItemStyles: CSSObject = {
        //...(open && { '&::before': { ...dotTransitions.out } }),
        ...(active && { color: theme.vars.palette.primary.main }),

    };

    const subItemStyles: CSSObject = {
        color: theme.vars.palette.text.secondary,
        '&:hover': { color: theme.vars.palette.text.primary },
        ...(active && { color: theme.vars.palette.text.primary }),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    };

    return {
        transition: theme.transitions.create(['color'], {
            duration: theme.transitions.duration.shorter,
        }),
        //'&::before': dotStyles,
        //'&:hover::before': { ...dotTransitions.out {,
        '&:hover': {
            backgroundColor: theme.vars.palette.grey.A200,
            borderRadius: '8px',
        },
        '&:hover svg': {
            transform: 'rotate(180deg)'
        },
        padding: '15px',
        variants: [
            { props: { variant: 'rootItem' }, style: rootItemStyles },
            { props: { variant: 'subItem' }, style: subItemStyles },
        ],
    };
});

/**
 * @slot title
 */
const ItemTitle = styled('span', { shouldForwardProp })<StyledState>(({ theme }) => ({
    ...navItemStyles.title(theme),
    ...theme.typography.body2,
    fontWeight: theme.typography.fontWeightMedium,
    variants: [
        { props: { variant: 'subItem' }, style: { fontSize: theme.typography.pxToRem(13) } },
        { props: { active: true }, style: { fontWeight: theme.typography.fontWeightSemiBold } },
    ],
}));

/**
 * @slot arrow
 */
const ItemArrow = styled(Iconify, { shouldForwardProp })<StyledState>(({ theme }) => ({
    ...navItemStyles.arrow(theme),
    transition: theme.transitions.create(['transform'], {
        duration: theme.transitions.duration.shorter,
    }),
}));
