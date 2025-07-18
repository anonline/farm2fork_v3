import { Nav, NavUl } from '../components';
import { NavList } from './nav-desktop-list';

import type { NavMainProps } from '../types';

// ----------------------------------------------------------------------

export function NavDesktop({ data, sx, ...other }: Readonly<NavMainProps>) {
    return (
        <Nav
            sx={[
                () => ({
                    /* Put styles */
                }),
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            <NavUl
                sx={{
                    gap: 2,
                    height: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                }}
            >
                {data.map((list) => (
                    <NavList key={list.title} data={list} sx={{position:'relative'}} />
                ))}
            </NavUl>
        </Nav>
    );
}
