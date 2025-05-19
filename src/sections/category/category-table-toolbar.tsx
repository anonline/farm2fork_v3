import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { ICategoryTableFilter } from 'src/types/category';

import { usePopover } from 'minimal-shared/hooks';

import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
    filters: UseSetStateReturn<ICategoryTableFilter>;
    options: {};
};

export function CategoryTableToolbar({ filters, options }: Props) {
    const menuActions = usePopover();

    const renderMenuActions = () => (
        <CustomPopover
            open={menuActions.open}
            anchorEl={menuActions.anchorEl}
            onClose={menuActions.onClose}
            slotProps={{ arrow: { placement: 'right-top' } }}
        >
            <MenuList>
                <MenuItem onClick={() => menuActions.onClose()}>
                    <Iconify icon="solar:printer-minimalistic-bold" />
                    Print
                </MenuItem>

                <MenuItem onClick={() => menuActions.onClose()}>
                    <Iconify icon="solar:import-bold" />
                    Import
                </MenuItem>

                <MenuItem onClick={() => menuActions.onClose()}>
                    <Iconify icon="solar:export-bold" />
                    Export
                </MenuItem>
            </MenuList>
        </CustomPopover>
    );

    return <>{renderMenuActions()}</>;
}
