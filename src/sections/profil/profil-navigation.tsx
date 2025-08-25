import { useRouter, usePathname } from "next/navigation";

import { Box, Stack, Button } from "@mui/material";

import { paths } from "src/routes/paths";

import { SignOutButton } from "src/layouts/components/sign-out-button";

import F2FIcons from "src/components/f2ficons/f2ficons";

export default function ProfilNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const navData = [
        {
            text: 'Rendelések',
            path: paths.profile.orders,
            icon: <F2FIcons name="Bag" width={22} height={22} style={{paddingBottom:3}}/>
        },
        {
            text: 'Címek',
            path: paths.profile.editAddress,
            icon: <F2FIcons name="Map" width={22} height={22} style={{paddingBottom:3}}/>
        },
        {
            text: 'Profil',
            path: paths.profile.editProfile,
            icon: <F2FIcons name="Profil" width={22} height={22} style={{paddingBottom:3}}/>
        }
    ]

    return (
        <Box sx={{ p: 2, borderRadius: '4px' }}>
            <Stack spacing={1}>
                {navData.map((navItem) => {
                    const isActive = pathname.startsWith(navItem.path);
                    return (
                        <Button
                        key={navItem.text}
                        startIcon={navItem.icon}
                        onClick={() => router.push(navItem.path)}
                        sx={{ 
                                justifyContent: 'flex-start',
                                p: 1.5,
                                fontWeight: isActive ? 800 : 600,
                                backgroundColor: isActive ? 'action.selected' : 'transparent',
                                color: 'text.primary' 
                            }}>
                            {navItem.text}
                        </Button>
                    );
                })}
                <SignOutButton sx={{ mt: 4 }} />
            </Stack>
        </Box>
    );
}
