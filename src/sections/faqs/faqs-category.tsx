import type { IFaqItem, IFaqCategoryItem } from 'src/types/faq';

import { useState, useEffect } from 'react';
import { useTabs, useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { Tab, Alert } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';

import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';

import { F2FFaqsList } from './faqs-list';

// ----------------------------------------------------------------------

const CATEGORIES = [
    {
        label: 'Managing your account',
        icon: `${CONFIG.assetsDir}/assets/icons/faqs/ic-account.svg`,
        href: '#',
    },
    { label: 'Payment', icon: `${CONFIG.assetsDir}/assets/icons/faqs/ic-payment.svg`, href: '#' },
    { label: 'Delivery', icon: `${CONFIG.assetsDir}/assets/icons/faqs/ic-delivery.svg`, href: '#' },
    {
        label: 'Problem with the product',
        icon: `${CONFIG.assetsDir}/assets/icons/faqs/ic-package.svg`,
        href: '#',
    },
    {
        label: 'Return & refund',
        icon: `${CONFIG.assetsDir}/assets/icons/faqs/ic-refund.svg`,
        href: '#',
    },
    {
        label: 'Guarantees and assurances',
        icon: `${CONFIG.assetsDir}/assets/icons/faqs/ic-assurances.svg`,
        href: '#',
    },
];

// ----------------------------------------------------------------------
type FaqsCategoryViewProps = {
    faqs: IFaqItem[];
    faqCategories: IFaqCategoryItem[];
};

export function FaqsCategory({ faqs, faqCategories }: Readonly<FaqsCategoryViewProps>) {
    const navOpen = useBoolean();
    const customTabs = useTabs('-1');

    const [filteredFaqs, setFilteredFaqs] = useState(faqs ?? []);

    useEffect(() => {
        const filteredFaqsByCategoryId = faqs.filter(
            (faq) => faq.faqCategoryId.toString() == customTabs.value || customTabs.value == '-1'
        );
        setFilteredFaqs(filteredFaqsByCategoryId);
    }, [faqs, customTabs.value]);

    const renderMobile = () => (
        <>
            <Box
                sx={[
                    (theme) => ({
                        p: 2,
                        top: 0,
                        left: 0,
                        width: 1,
                        position: 'absolute',
                        display: { xs: 'block', md: 'none' },
                        borderBottom: `solid 1px ${theme.vars.palette.divider}`,
                    }),
                ]}
            >
                <Button startIcon={<Iconify icon="solar:list-bold" />} onClick={navOpen.onTrue}>
                    Categories
                </Button>
            </Box>

            <Drawer open={navOpen.value} onClose={navOpen.onFalse}>
                <Box
                    sx={{
                        p: 1,
                        gap: 1,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                    }}
                >
                    {CATEGORIES.map((category) => (
                        <ItemMobile key={category.label} category={category} />
                    ))}
                </Box>
            </Drawer>
        </>
    );

    const renderDesktop = () => (
        <Box
            sx={{
                display: { xs: 'none', md: 'block' },
                width: '100%',
            }}
        >
            <Box
                sx={{
                    width: '80%',
                    placeSelf: 'center',
                }}
            >
                <CustomTabs
                    value={parseInt(customTabs.value)}
                    onChange={customTabs.onChange}
                    variant="fullWidth"
                    sx={{ width: 1, borderRadius: 1, mb: 5, mt: 0 }}
                    slotProps={{
                        indicatorContent: {
                            sx: { borderRadius: 1 },
                        },
                    }}
                >
                    {faqCategories?.map((category) => (
                        <Tab key={category.id} value={category.id} label={category.name} />
                    ))}
                </CustomTabs>
            </Box>

            {filteredFaqs.length > 0 ? (
                <F2FFaqsList data={filteredFaqs} />
            ) : (
                <Alert severity="info" sx={{}}>
                    Sajnos nincs elérhető kérdés a kategóriában. Kérjük vegye fel a kapcsolatot
                    velünk elérhetőségeink bármelyikén.
                </Alert>
            )}
        </Box>
    );

    return (
        <>
            {renderMobile()}
            {renderDesktop()}
        </>
    );
}

// ----------------------------------------------------------------------

type ItemProps = {
    category: (typeof CATEGORIES)[number];
};



// ----------------------------------------------------------------------

function ItemMobile({ category }: Readonly<ItemProps>) {
    return (
        <ListItemButton
            key={category.label}
            sx={{
                py: 2,
                maxWidth: 140,
                borderRadius: 1,
                textAlign: 'center',
                alignItems: 'center',
                typography: 'subtitle2',
                flexDirection: 'column',
                justifyContent: 'center',
                bgcolor: 'background.neutral',
            }}
        >
            <Avatar alt={category.icon} src={category.icon} sx={{ width: 48, height: 48, mb: 1 }} />

            {category.label}
        </ListItemButton>
    );
}
