import type { UseBooleanReturn } from "minimal-shared/hooks";

import CardHeader from "@mui/material/CardHeader";

import CollapseButton from "./collapse-button";

type EditCardHeaderProps = {
    title: string;
    isOpen: UseBooleanReturn;
    sx?: object;
}
export default function EditCardHeader({ title, isOpen, sx }: Readonly<EditCardHeaderProps>) {
    return (
        <CardHeader
            title={title}
            action={<CollapseButton value={isOpen.value} onToggle={isOpen.onToggle} />}
            sx={sx}
        />
    );
}