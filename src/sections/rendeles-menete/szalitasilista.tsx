import { ListItem, Typography } from "@mui/material";

interface SzalitasListaProps {
    data: string[];
};

export default function SzalitasiLista({ data }: Readonly<SzalitasListaProps>) {
    const listItemStyle = {
        display: 'list-item', 
        listStyleType: 'disc',
        fontWeight:400,
        lineHeight:"28px",
        fontSize:"16px"
    };
    return (
        <>
            {data.map((paragraph) => (
                <ListItem key={paragraph} sx={listItemStyle}>
                    <Typography >{paragraph}</Typography>
                </ListItem>
            ))}
        </>
    );
};
