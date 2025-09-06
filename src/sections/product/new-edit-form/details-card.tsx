import type { UseBooleanReturn } from "minimal-shared/hooks";

import { Card, Stack, Divider, Collapse } from "@mui/material";

import { RHFDragDropImages } from "src/components/upload";
import { Field, RHFTextField } from "src/components/hook-form";

import EditCardHeader from "./card-header";

type DetailsCardProps = {
    isOpen: UseBooleanReturn;
    handleURLGenerate: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function DetailsCard({ isOpen, handleURLGenerate }: Readonly<DetailsCardProps>) {
    return (
        <Card>
            <EditCardHeader title="Alapadatok" isOpen={isOpen} sx={{ mb: 2 }} />
            
            <Divider /> 
            <Collapse in={isOpen.value}>
                <Stack spacing={3} sx={{ p: 3 }}>
                    <RHFTextField name="name" label="Termék név" onBlur={handleURLGenerate} />
                    <RHFTextField name="url" label="Termék URL" disabled variant="filled" />
                    <RHFTextField name="sku" label="SKU (Azonosító)" />

                    <Field.Editor name="shortDescription" />

                    <Divider />
                    
                    <RHFDragDropImages 
                        name="images" 
                        label="Termék képek (0-3 darab)"
                        helperText="Húzza a képeket az átrendezéshez. Maximum 3 kép tölthető fel."
                    />
                </Stack>
            </Collapse>
        </Card>
    );
}