import type { SelectChangeEvent } from '@mui/material/Select';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import { useState, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { usePopover } from 'minimal-shared/hooks';
import Select from '@mui/material/Select';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { IProducerTableFilters } from 'src/types/producer';

// ----------------------------------------------------------------------

type Props = {
  filters: UseSetStateReturn<IProducerTableFilters>;
  options: {
    bios: { value: string; label: string }[];
  };
};

export function ProducerTableToolbar({ filters, options }: Props) {
  const menuActions = usePopover();

  const { state: currentFilters, setState: updateFilters } = filters;

  const [bio, setBio] = useState(currentFilters.bio);

  const handleChangeBio = useCallback((event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;

    setBio(typeof value === 'string' ? value.split(',') : value);
  }, []);

  const handleFilterBio = useCallback(() => {
    updateFilters({ bio: bio });
  }, [bio, updateFilters]);

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
          Nyomtatás
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

  return (
    <>
      <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
        <InputLabel htmlFor="filter-bio-select">Bio</InputLabel>
        <Select
          multiple
          value={bio}
          onChange={handleChangeBio}
          onClose={handleFilterBio}
          input={<OutlinedInput label="Bio" />}
          renderValue={(selected) => selected.map((value) => value).join(', ')}
          inputProps={{ id: 'filter-bio-select' }}
          sx={{ textTransform: 'capitalize' }}
        >
          {options.bios.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox
                disableRipple
                size="small"
                checked={bio.includes(option.value)}
                slotProps={{
                  input: {
                    id: `${option.value}-checkbox`,
                    'aria-label': `${option.label} checkbox`,
                  },
                }}
              />
              {option.label}
            </MenuItem>
          ))}

          <MenuItem
            disableGutters
            disableTouchRipple
            onClick={handleFilterBio}
            sx={[
              (theme) => ({
                justifyContent: 'center',
                fontWeight: theme.typography.button,
                bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
              }),
            ]}
          >
            Alkalmaz
          </MenuItem>
        </Select>
      </FormControl>

      {renderMenuActions()}
    </>
  );
}
