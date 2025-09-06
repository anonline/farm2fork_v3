import { Card, Collapse, Divider, Stack } from "@mui/material";
import { UseBooleanReturn } from "minimal-shared/hooks";
import { Field, RHFSwitch } from "src/components/hook-form";
import EditCardHeader from "./card-header";

type FeaturedCardProps = {
    isOpen: UseBooleanReturn;
}

export default function FeaturedCard({ isOpen }: Readonly<FeaturedCardProps>) {
    return (
        <Card>
            <EditCardHeader title="Kiemelt termék" isOpen={isOpen} sx={{ mb: 2 }} />
            <Divider />
            <Collapse in={isOpen.value}>
                <Stack spacing={3} sx={{ p: 3 }}>
                    <Stack spacing={1.5}>
                        <Field.Upload name="featuredImage" thumbnail placeholder="Kiemelt termék kép" />
                    </Stack>

                    <Divider />

                    <RHFSwitch name="featured" label="Főoldalon kiemelt termék" />
                    <RHFSwitch name="star" label="Szezonális sztár termék" />
                    <RHFSwitch name="bio" label="Bio termék" />
                </Stack>
            </Collapse>
        </Card>
    );
}