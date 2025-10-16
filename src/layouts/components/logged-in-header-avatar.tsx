import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import { Box, Avatar, Tooltip } from '@mui/material';

import { paths } from 'src/routes/paths';

import { themeConfig } from 'src/theme';
import { useGetCustomerData } from 'src/actions/customer';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

export default function LoggedInHeaderAvatar() {
    const { user } = useAuthContext();
    const { customerData, customerDataLoading } = useGetCustomerData(user?.id);

    const initialsFallback = <Iconify icon="solar:user-rounded-bold" />;
    const tooltipFallback = 'Profil megtekintése';
    const profileUrl = paths.profile.orders;

    const warningIconSize = 24;
    const warningIcon = <Iconify icon="solar:danger-triangle-bold" color={themeConfig.palette.warning.main} width={warningIconSize} height={warningIconSize} />;
    const [warningText, setWarningText] = useState('');
    const showWarning = useBoolean(false);

    // Construct name from CustomerDatas table
    const customerName = customerData
        ? `${customerData.firstname || ''} ${customerData.lastname || ''}`.trim()
        : '';

    const hasName = !!customerName && customerName.length > 0;

    const tooltipText = hasName ? customerName : tooltipFallback;

    const getInitials = (name: string) => {
        const names = name.split(' ');
        let initialsArray = names.map(n => n.charAt(0).toUpperCase());
        if (initialsArray.length > 2) {
            initialsArray = initialsArray.splice(0, 2);
        }
        return initialsArray.join('');
    }

    const initialsContent = hasName
        ? getInitials(customerName)
        : initialsFallback;


    // Set warning text in useEffect to avoid state updates during render
    useEffect(() => {
        const validationWarnings = [];
        if (showWarning && customerData?.deliveryAddress?.length === 0) {
            validationWarnings.push('Nincs megadva szállítási cím!');
        }
        if (showWarning && customerData?.billingAddress?.length === 0) {
            validationWarnings.push('Nincs megadva számlázási cím!');
        }

        if (validationWarnings.length > 0) {
            showWarning.onTrue();
        } else {
            showWarning.onFalse();
        }
        setWarningText(validationWarnings.join('<br />'));
    }, [customerData]);

    return (
        <Box sx={{ m: 0, p: 0, position: 'relative' }}>
            <Tooltip title={tooltipText}>
                <Link href={profileUrl} style={{ textDecoration: 'none' }}>
                    <Avatar
                        alt={customerName || 'Profil megtekintése'}
                        sx={{
                            bgcolor: '#C4CDD5',
                            fontSize: '16px',
                            '&:hover': {
                                boxShadow: 3,
                                border: '2px solid',
                                borderColor: 'primary.main',
                                cursor: 'pointer',
                            },
                        }}
                    >
                        {initialsContent}
                    </Avatar>

                </Link>
            </Tooltip>
            {showWarning.value && !customerDataLoading && (
                <Tooltip title={<span dangerouslySetInnerHTML={{ __html: warningText }} />}>
                    <span style={{ position: 'absolute', top: warningIconSize / 2 * -1, right: warningIconSize / 2 * -1 }}>
                        {warningIcon}
                    </span>
                </Tooltip>
            )}
        </Box>
    );
}
