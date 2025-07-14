import type { FadeProps } from '@mui/material/Fade';

import Fade from '@mui/material/Fade';
import { styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

const NavDropdownPaper = styled('div')(({ theme }) => ({
    //...theme.mixins.paperStyles(theme, { dropdown: true }),
    padding: theme.spacing(1, 2, 1, 2),
    backgroundColor: theme.vars.palette.common.white,
    borderRadius: theme.shape.borderRadius * 2,
    ...(theme.direction === 'rtl' && {
        padding: theme.spacing(5, 4, 1, 1),
    }),
    border: `1px solid ${theme.vars.palette.divider}`,
}));

// ----------------------------------------------------------------------

type NavDropdownProps = React.ComponentProps<'div'> & {
    open: FadeProps['in'];
};

export const NavDropdown = styled(({ open, children, ...other }: NavDropdownProps) => (
    <Fade in={open}>
        <div {...other}>
            <NavDropdownPaper>{children}</NavDropdownPaper>
        </div>
    </Fade>
))(({ theme }) => ({
    left: 0,
    //right: 0,
    marginTop: 12,
    width: '100%',
    position: 'absolute',
    marginLeft: 'auto',
    marginRight: 'auto',
    minWidth: 'max-content',
    padding: theme.spacing(1.5),
    zIndex: theme.zIndex.drawer * 2,
    maxWidth: theme.breakpoints.values.lg,
    top: 'calc(var(--layout-header-desktop-height) / 2)',
}));
