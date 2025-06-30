import { ListItem, Typography } from "@mui/material";

interface SzalitasListaProps {
    readonly adat: readonly { text: string }[];
};

export default function SzalitasLista({ adat }: SzalitasListaProps) {
    const listItemStyle = {
        display: 'list-item', 
        listStyleType: 'disc',
        fontWeight:400,
        lineHeight:"28px",
        fontSize:"16px"
    };
    return (
        <>
            {adat.map((pont) => (
                <ListItem key={pont.text} sx={listItemStyle}>
                    <Typography >{pont.text}</Typography>
                </ListItem>
            ))}
        </>
    );
};
