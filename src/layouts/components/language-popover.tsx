'use client';

import type { LanguageValue } from 'src/locales';
import type { IconButtonProps } from '@mui/material/IconButton';

import { useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';

import { useTranslate } from 'src/locales';

import { FlagIcon } from 'src/components/flag-icon';
import { CustomPopover } from 'src/components/custom-popover';
import { Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type LanguagePopoverProps = IconButtonProps & {
    data?: {
        value: string;
        label: string;
        countryCode: string;
    }[];
};

export function LanguagePopover({ data = [], sx, ...other }: LanguagePopoverProps) {
    const { open, anchorEl, onClose, onOpen } = usePopover();

    const { onChangeLang, currentLang } = useTranslate();

    const handleChangeLang = useCallback(
        (newLang: LanguageValue) => {
            onChangeLang(newLang);
            onClose();
        },
        [onChangeLang, onClose]
    );

    const renderMenuList = () => (
        <CustomPopover open={open} anchorEl={anchorEl} onClose={onClose}>
            <MenuList sx={{ width: 160, minHeight: 72 }}>
                {data?.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={option.value === currentLang.value}
                        onClick={() => handleChangeLang(option.value)}
                    >
                        <FlagIcon code={option.countryCode} />
                        {option.label}
                    </MenuItem>
                ))}
            </MenuList>
        </CustomPopover>
    );

    return (
        <>
            <Typography
                onMouseEnter={onOpen}
                sx={[
                    (theme) => ({
                        p: 1,
                        fontWeight: 600,
                        borderRadius: '8px',
                        fontSize: 14,
                        display: 'inline-flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textTransform: 'uppercase',
                        color: theme.palette.text.primary,
                        ...(open &&
                        {
                            cursor: 'pointer',
                            backgroundColor: '#7e7e7e1a',

                        }),
                    }),
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
                {...other}
            >
                {currentLang.value} <Iconify icon="eva:arrow-ios-downward-fill" width={16} sx={{ ml: 0.5 }} />
            </Typography>

            {renderMenuList()}
        </>
    );
}
