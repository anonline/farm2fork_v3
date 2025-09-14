import Link from 'next/link';

import { Avatar, Tooltip } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useGetCustomerData } from 'src/actions/customer';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

export default function LoggedInHeaderAvatar() {
    const { user } = useAuthContext();
    const { customerData, customerDataLoading } = useGetCustomerData(user?.id);
    
    const initialsFallback = <Iconify icon="solar:user-rounded-bold" />;
    const tooltipFallback = 'Profil megtekintése';
    const profileUrl = paths.profile.orders; //TODO: Use paths.profil.rendelesek when available
    
    // Construct name from CustomerDatas table
    const customerName = customerData 
        ? `${customerData.firstname || ''} ${customerData.lastname || ''}`.trim()
        : '';
    
    const hasName = !!customerName && customerName.length > 0;

    const tooltipText = hasName ? customerName : tooltipFallback;

    const getInitials = (name: string) => {
        const names = name.split(' ');
        let initialsArray = names.map(n => n.charAt(0).toUpperCase());
        if(initialsArray.length > 2) {
            initialsArray = initialsArray.splice(0, 2);
        }
        return initialsArray.join('');
    }

    const initialsContent = hasName
        ? getInitials(customerName)
        : initialsFallback;

    return (
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
    );
}
