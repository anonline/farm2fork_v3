import type { IFaqItem } from 'src/types/faq';
import type { BoxProps } from '@mui/material/Box';
import type { IconifyName } from 'src/components/iconify';

import React, { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { _faqs } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { themeConfig } from 'src/theme';
import { useBoolean } from 'minimal-shared/hooks';

// ----------------------------------------------------------------------

export function FaqsList({ sx, ...other }: BoxProps) {
    return (
        <Box sx={sx} {...other}>
            {_faqs.map((accordion) => (
                <Accordion key={accordion.id}>
                    <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                        <Typography variant="subtitle1">{accordion.heading}</Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Typography>{accordion.detail}</Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
}

type F2FFaqsListProps = {
    data: IFaqItem[] | null;
};
export function F2FFaqsList({ data, sx, ...other }: F2FFaqsListProps & BoxProps) {
    // Create an object mapping each FAQ id to a bool instance
    const openStates = !data ? {} : Object.fromEntries(
            data.map(item => [item.id, false])
        );
    
    const [isOpens, setIsOpens] = useState(openStates);

    const iconSx = {
        width: 40,
        height: 40,
        color: 'text',
        mr: 2,
        // Example: use openStates[accordion.id]?.value for expanded state
        backgroundColor: '#eae3d7',
        p: '8px',
        borderRadius: 1,
    };
    return (
        <Box sx={sx} {...other}>
            {(data?.length ?? 0)
                ? data?.map((accordion) => (
                    <Accordion
                        elevation={0}
                        key={accordion.id}
                        sx={{ mb: 1, borderRadius: 4, border: 0,
                            '&.Mui-expanded': {
                                border: 0,
                                boxShadow: 'none',
                            }
                         }}
                         expanded={isOpens[accordion.id]}
                         onChange={() => setIsOpens(prev => ({ ...prev, [accordion.id]: !prev[accordion.id] }))
                         }
                    >
                        <AccordionSummary
                            sx={{ mt: 2, display: 'flex', alignItems: 'center', borderRadius: 8 }}
                            expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                        >
                            <Iconify
                                icon={
                                    (accordion.faqCategory?.icon ??
                                        'solar:dollar-minimalistic-linear') as IconifyName
                                }
                                sx={{...iconSx, 
                                    backgroundColor: (theme) => isOpens[accordion.id] ? theme.palette.primary.main : '#eae3d7',
                                    color: (theme) => isOpens[accordion.id] ? theme.palette.common.white : theme.palette.text.primary,
                                }}
                            />

                            <Typography
                                variant="subtitle1"
                                sx={{ display: 'flex', alignItems: 'center', fontFamily: themeConfig.fontFamily.bricolage, fontWeight: '600', fontSize: { xs: '18px', md: '20px' } }}
                            >
                                {accordion.question}
                            </Typography>
                        </AccordionSummary>

                        <AccordionDetails sx={{ ml: 7 }}>
                            <Typography>{accordion.answer}</Typography>
                        </AccordionDetails>
                    </Accordion>
                ))
                : null}
        </Box>
    );
}
