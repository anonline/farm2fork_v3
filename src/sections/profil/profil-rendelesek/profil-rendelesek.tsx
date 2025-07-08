'use client'

import { Box, Typography, Stack, Button, Grid } from "@mui/material";
import { useState } from "react";
import ProfilRendelesekKartya from "./profil-rendelesek-kartya";
import { usePathname, useRouter } from "next/navigation";
import F2FIcons from "src/components/f2ficons/f2ficons";
interface IOrderProduct {
    id: number;
    imageUrl: string;
    name: string;
}

interface IOrder {
    id: number;
    orderNumber: string;
    orderDate: string;
    deliveryDate: string;
    status: 'Visszamondva' | 'Teljesítve' | 'Feldolgozás alatt';
    totalPrice: number;
    products: IOrderProduct[];
}

export default function ProfilRendelesek() {
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;
    const allOrders: IOrder[] = Array.from(
        { length: 25 },
        (_, i) => ({
            id: i + 1,
            orderNumber: `#349${72 + i}`,
            orderDate: `2025.03.${Math.floor(i / 2) + 1} 10:00`,
            deliveryDate: `2025.03.${Math.floor(i / 2) + 6}`,
            status: i % 3 === 0 ? 'Teljesítve' : (i % 3 === 1 ? 'Visszamondva' : 'Feldolgozás alatt'),
            totalPrice: 10000 + i * 350,
            products: Array.from(
                { length: Math.floor(Math.random() * 5) + 1 },
                (_, p) => ({
                    id: 100 + i * 10 + p,
                    imageUrl: `https://picsum.photos/100/100?random=${i * 10 + p}`,
                    name: `Termék ${p + 1}`
                })
            )
        })
    );
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentOrders = allOrders.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allOrders.length / itemsPerPage);

    return (
        <Box sx={{ p: 2, maxWidth: '1200px', mx: 'auto' }}>
            <Grid container spacing={{ xs: 3, md: 4 }}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <ProfilNavigation />
                </Grid>
                <Grid size={{ xs: 12, md: 9 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom>Rendelések</Typography>
                        {currentOrders.length > 0 ? (
                            <Stack spacing={2}>
                                {currentOrders.map((order) => <ProfilRendelesekKartya key={order.id} order={order} />)}
                            </Stack>
                        ) : (
                            <Typography>Nincsenek korábbi rendeléseid.</Typography>
                        )}

                        {totalPages > 1 && (
                            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mt: 4 }}>
                                <Button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 0}>Előző</Button>
                                <Typography>Oldal {currentPage + 1} / {totalPages}</Typography>
                                <Button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage >= totalPages - 1}>Következő</Button>
                            </Stack>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

export function ProfilNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const navItems = [
        { text: 'Rendelések', path: '/profil/rendelesek', icon: <F2FIcons name="Bag" width={22} height={22} style={{paddingBottom:3}}/> },
        { text: 'Címek', path: '/profil/cimek', icon: <F2FIcons name="Map" width={22} height={22} style={{paddingBottom:3}}/> },
        { text: 'Fiókadatok', path: '/profil/fiokadatok', icon: <img src="public/assets/images/profil/Guy.png" alt="Guy" style={{height:"22px", width:"22px", paddingBottom:3}}/> }, //ennek az ikonnak valamiért nincs link-je se leírása 
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
