import type { Theme, Components, ComponentsVariants } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

import { avatarGroupClasses } from '@mui/material/AvatarGroup';

// ----------------------------------------------------------------------

/**
 * TypeScript (type definition and extension)
 * @to {@link file://./../../extend-theme-types.d.ts}
 */

export type AvatarGroupExtendVariant = {
    compact: true;
};

// ----------------------------------------------------------------------

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

type PaletteColor = (typeof COLORS)[number] | 'default';

const colorByName = (name?: string): PaletteColor => {
    const charAt = name?.charAt(0).toLowerCase();

    if (['a', 'c', 'f'].includes(charAt!)) return 'primary';
    if (['e', 'd', 'h'].includes(charAt!)) return 'secondary';
    if (['i', 'k', 'l'].includes(charAt!)) return 'info';
    if (['m', 'n', 'p'].includes(charAt!)) return 'success';
    if (['q', 's', 't'].includes(charAt!)) return 'warning';
    if (['v', 'x', 'y'].includes(charAt!)) return 'error';

    return 'default';
};

// ----------------------------------------------------------------------

const avatarColors: Record<string, ComponentsVariants<Theme>['MuiAvatar']> = {
    colors: COLORS.map((color) => ({
        props: ({ ownerState }) => ownerState.color === color,
        style: ({ theme }) => ({
            color: theme.vars.palette[color].contrastText,
            backgroundColor: theme.vars.palette[color].main,
        }),
    })),
    defaultColor: [
        {
            props: ({ ownerState }) => ownerState.color === 'default',
            style: ({ theme }) => ({
                color: theme.vars.palette.text.secondary,
                backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.24),
            }),
        },
    ],
};

const MuiAvatar: Components<Theme>['MuiAvatar'] = {
    /** **************************************
     * STYLE
     *************************************** */
    styleOverrides: {
        root: { variants: [avatarColors.defaultColor, avatarColors.colors].flat() },
        rounded: ({ theme }) => ({ borderRadius: theme.shape.borderRadius * 1.5 }),
        colorDefault: ({ ownerState, theme }) => {
            const color = colorByName(ownerState.alt);

            return {
                ...(!!ownerState.alt && {
                    ...(color !== 'default'
                        ? {
                              color: theme.vars.palette[color].contrastText,
                              backgroundColor: theme.vars.palette[color].main,
                          }
                        : {
                              color: theme.vars.palette.text.secondary,
                              backgroundColor: varAlpha(
                                  theme.vars.palette.grey['500Channel'],
                                  0.24
                              ),
                          }),
                }),
            };
        },
    },
};

// ----------------------------------------------------------------------

const MuiAvatarGroup: Components<Theme>['MuiAvatarGroup'] = {
    /** **************************************
     * DEFAULT PROPS
     *************************************** */
    defaultProps: { max: 4 },

    /** **************************************
     * STYLE
     *************************************** */
    styleOverrides: {
        root: ({ ownerState }) => ({
            justifyContent: 'flex-end',
            ...(ownerState.variant === 'compact' && {
                width: 40,
                height: 40,
                position: 'relative',
                [`& .${avatarGroupClasses.avatar}`]: {
                    margin: 0,
                    width: 28,
                    height: 28,
                    position: 'absolute',
                    '&:first-of-type': { left: 0, bottom: 0, zIndex: 9 },
                    '&:last-of-type': { top: 0, right: 0 },
                },
            }),
        }),
        avatar: ({ theme }) => ({
            fontSize: 16,
            fontWeight: theme.typography.fontWeightSemiBold,
            '&:first-of-type': {
                fontSize: 12,
                color: theme.vars.palette.primary.dark,
                backgroundColor: theme.vars.palette.primary.lighter,
            },
        }),
    },
};

// ----------------------------------------------------------------------

export const avatar = { MuiAvatar, MuiAvatarGroup };
