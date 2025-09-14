import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { IShipmentsTableFilters } from 'src/types/shipments';

import { usePopover } from 'minimal-shared/hooks';

import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
    filters: UseSetStateReturn<IShipmentsTableFilters>;
    options: {
        // Add filter options here if needed in the future
    };
};

export function ShipmentsTableToolbar({ filters, options }: Props) {
    const menuActions = usePopover();

    const renderMenuActions = () => (
        <CustomPopover
            open={menuActions.open}
            anchorEl={menuActions.anchorEl}
            onClose={menuActions.onClose}
            slotProps={{ arrow: { placement: 'right-top' } }}
        >
            <MenuList>
                <MenuItem
                    onClick={() => {
                        menuActions.onClose();
                    }}
                >
                    <Iconify icon="solar:printer-minimalistic-bold" />
                    Nyomtatás
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        menuActions.onClose();
                    }}
                >
                    <Iconify icon="solar:import-bold" />
                    Importálás
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        menuActions.onClose();
                    }}
                >
                    <Iconify icon="solar:export-bold" />
                    Exportálás
                </MenuItem>
            </MenuList>
        </CustomPopover>
    );

    return (
        <>
            {/* Placeholder for future filters */}
            {renderMenuActions()}
        </>
    );
}