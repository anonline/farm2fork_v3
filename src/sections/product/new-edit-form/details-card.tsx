import { UseBooleanReturn } from "minimal-shared/hooks";
import Card from "node_modules/@mui/material/esm/Card/Card";
import EditCardHeader from "./card-header";
import Collapse from "node_modules/@mui/material/esm/Collapse/Collapse";
import Stack from "node_modules/@mui/material/esm/Stack/Stack";
import { Field, RHFTextField } from "src/components/hook-form";
import { Divider } from "@mui/material";

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
                    <Field.Upload multiple thumbnail name="images" />
                </Stack>
            </Collapse>
        </Card>
    );
}