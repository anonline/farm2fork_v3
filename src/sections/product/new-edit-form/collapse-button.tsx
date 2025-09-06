import { IconButton } from "@mui/material";
import { Iconify } from "src/components/iconify";

type CollapseButtonProps = {
    value: boolean;
    onToggle: () => void;
};

export default function CollapseButton({value, onToggle}: Readonly<CollapseButtonProps>) {
    return (
        <IconButton onClick={onToggle}>
            <Iconify icon={value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'} />
        </IconButton>
    );
}