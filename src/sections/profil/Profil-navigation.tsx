import { Box, Stack, Button } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import F2FIcons from "src/components/f2ficons/f2ficons";

export function ProfilNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const navItems = [
        { text: 'Rendelések', path: '/profil/rendelesek', icon: <F2FIcons name="Bag" width={22} height={22} style={{paddingBottom:3}}/> },
        { text: 'Címek', path: '/profil/edit-address', icon: <F2FIcons name="Map" width={22} height={22} style={{paddingBottom:3}}/> },
        { text: 'Fiókadatok', path: '/profil/edit-account', icon: <F2FIcons name="Profil" height={22} width={22} style={{ paddingBottom:3}}/> }, //ennek az ikonnak valamiért nincs link-je se leírása 
    ];
    return (
        <Box sx={{ p: 2, borderRadius: '4px' }}>
            <Stack spacing={1}>
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.path);
                    return (
                        <Button key={item.text} startIcon={item.icon} onClick={() => router.push(item.path)} sx={{ justifyContent: 'flex-start', p: 1.5, fontWeight: isActive ? 800 : 600, backgroundColor: isActive ? 'action.selected' : 'transparent', color: 'text.primary' }}>
                            {item.text}
                        </Button>
                    );
                })}
                <Button variant="outlined" sx={{ mt: 4 }}>
                    Kijelentkezés
                </Button>
            </Stack>
        </Box>
    );
}