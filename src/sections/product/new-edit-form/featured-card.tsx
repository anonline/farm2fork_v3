import type { UseBooleanReturn } from "minimal-shared/hooks";

import { Card, Stack, Divider, Collapse } from "@mui/material";

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

                    <Divider />

                    <RHFSwitch name="isPublic" label="Publikus termék" />
                    <RHFSwitch name="isVip" label="VIP vásárlók számára elérhető" />
                    <RHFSwitch name="isCorp" label="Céges vásárlók számára elérhető" />
                </Stack>
            </Collapse>
        </Card>
    );
}