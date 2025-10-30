import type { IFaqItem, IFaqCategoryItem } from 'src/types/faq';

import { useState, useEffect } from 'react';
import { useTabs } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import { Tab, Alert, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

import { CustomTabs } from 'src/components/custom-tabs';

import { F2FFaqsList } from './faqs-list';

// ----------------------------------------------------------------------
type FaqsCategoryViewProps = {
    faqs: IFaqItem[];
    faqCategories: IFaqCategoryItem[];
};

export function FaqsCategory({ faqs, faqCategories }: Readonly<FaqsCategoryViewProps>) {
    const customTabs = useTabs('-1');

    const [filteredFaqs, setFilteredFaqs] = useState(faqs ?? []);

    useEffect(() => {
        const filteredFaqsByCategoryId = faqs.filter(
            (faq) => faq.faqCategoryId.toString() == customTabs.value || customTabs.value == '-1'
        );
        setFilteredFaqs(filteredFaqsByCategoryId);
    }, [faqs, customTabs.value]);

    const renderMobile = () => (
        <Box
            sx={{
                display: { xs: 'block', md: 'none' },
                width: '100%',
            }}
        >
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="faq-category-select-label">Kategória</InputLabel>
                <Select
                    labelId="faq-category-select-label"
                    id="faq-category-select"
                    value={customTabs.value}
                    label="Kategória"
                    onChange={(event) => customTabs.setValue(event.target.value)}
                >
                    {faqCategories?.map((category) => (
                        <MenuItem key={category.id} value={category.id.toString()}>
                            {category.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {filteredFaqs.length > 0 ? (
                <F2FFaqsList data={filteredFaqs} />
            ) : (
                <Alert severity='warning' sx={{}}>
                    Sajnos nincs elérhető kérdés a kategóriában. Kérjük vegye fel a kapcsolatot
                    velünk elérhetőségeink bármelyikén.
                </Alert>
            )}
        </Box>
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
                    value={Number.parseInt(customTabs.value)}
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
                <Alert severity='warning' sx={{}}>
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
