import { Avatar, Tooltip } from "@mui/material";
import { Iconify } from "src/components/iconify";
import Link from "next/link";

export default function LoggedInHeaderAvatar({name}: { name?: string }) {

    const initialsFallback = <Iconify icon="solar:user-rounded-bold" />;
    const tooltipFallback = "Profil megtekintése";
    const profileUrl = '/profil/rendelesek'; //TODO: Use paths.profil.rendelesek when available

    const hasName = !!name && name.trim().length > 0;

    const tooltipText = hasName ? name : tooltipFallback;
    const initialsContent = hasName
        ? name
                .split(' ')
                .map((n) => n[0]?.toUpperCase())
                .join('')
        : initialsFallback;

    return (
        <Tooltip title={tooltipText}>
            <Link href={profileUrl} style={{ textDecoration: 'none' }}>
                <Avatar
                    sx={{
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