import type { CSSObject } from '@mui/material/styles';

import { mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';

import { themeConfig } from 'src/theme';

import { Iconify } from 'src/components/iconify';
import { createNavItem, navItemStyles, navSectionClasses } from 'src/components/nav-section';

import type { NavItemProps } from '../types';

// ----------------------------------------------------------------------

export function NavItem({
    title,
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
            {...other}
        >
            <ItemTitle {...ownerState} sx={{ textTransform: 'uppercase', fontFamily: themeConfig.fontFamily.primary, fontWeight: 600, fontSize: '14px', lineHeight: '20px' }}> {title}</ItemTitle>

            {hasChild && <ItemArrow {...ownerState} icon="eva:arrow-ios-downward-fill" />}
        </ItemRoot>
    );
}

// ----------------------------------------------------------------------

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
        padding: '8px',
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
