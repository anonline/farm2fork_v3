import type { IFaqItem } from 'src/types/faq';
import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { _faqs } from 'src/_mock';

import { Iconify } from 'src/components/iconify';

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

}
export function F2FFaqsList({ data, sx, ...other } : F2FFaqsListProps & BoxProps) {
    return (
        <Box sx={sx} {...other}>
            {(data?.length ?? 0) ? data?.map((accordion) => (
                <Accordion key={accordion.id}>
                    <AccordionSummary 
                        sx={{ mt: 2, display: 'flex', alignItems: 'center' }} 
                        expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                    >
                        <F2FFaqIcon />
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                            {accordion.question}
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Typography>{accordion.answer}</Typography>
                    </AccordionDetails>
                </Accordion>
            )) : null
        }
        </Box>
    );
}

function F2FFaqIcon(){
    return (
        <Iconify
            icon="eva:star-outline"
            sx={{
                width: 40,
                height: 40,
                color: 'text',
                mr: 2,
                backgroundColor: '#eae3d7',
                p: "8px",
                borderRadius: 1,
            }}
        />
    );
}