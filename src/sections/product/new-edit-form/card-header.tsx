import { UseBooleanReturn } from "minimal-shared/hooks";
import CollapseButton from "./collapse-button";
import CardHeader from "node_modules/@mui/material/esm/CardHeader/CardHeader";

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