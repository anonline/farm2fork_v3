import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { getRolunkWhat } from 'src/actions/rolunk';

import { Image } from 'src/components/image';

export default async function RolunkWhat() {
    const rolunkWhats = await getRolunkWhat();


    const categoriesTexts = [
        {
            title: 'SZEZONÁLIS',
            description:
                'A kínálatban a szezonális alapanyagoké a főszerep, mivel a zöldségek és gyümölcsök az adott szezonukban rendelkeznek magasabb tápanyagtartalommal és ízben is kiválóak.',
            image: 'https://farm2fork.hu/wp-content/uploads/elementor/thumbs/BOLDI_DSC5371-scaled-r110ehw2ril94xwotr3o7oit08zg20ihwfup65mtqg.jpg',
        },
        {
            title: 'BIO',
            description:
                'Célunk, hogy minél magasabb arányban jelenjenek meg a bio alapanyagok, ezzel is hangsúlyozva a tudatos és egészséges táplálkozást, valamint a környezeti értékek megóvásának fontosságát.',
            image: 'https://farm2fork.hu/wp-content/uploads/elementor/thumbs/feherrepa-uj-csomos_1276_1-r1tuk7wvu6edo4hnj90711vwp4ntpclpb6yvp18qh4.jpg',
        },
        {
            title: 'HAZAI',
            description:
                'Minden nap azon dolgozom, hogy a magyar termelőket összekössem a top éttermekkel és a kiváló minőségű, helyi alapanyagokra nyitott lakossági megrendelőkkel.',
            image: 'https://farm2fork.hu/wp-content/uploads/elementor/thumbs/tolgylevelu-salata-bordo-bio_820_1-qukqhb7pyobux3lfu8bptcigh3iu8rii8b3oaglvyg.jpg',
        },
        {
            title: 'KÖRNYEZETTUDATOS',
            description:
                'A működésünk során nagy hangsúlyt fektetünk a környezetbarát megoldásokra és a csomagolások minimalizálására.',
            image: 'https://farm2fork.hu/wp-content/uploads/elementor/thumbs/cukkini-bebi_881_2-1-r1tujxknr0084ewo7mjarmhu5w2scognlrsjezo2dk.jpg',
        },
        {
            title: 'FAIR TRADE',
            description:
                'Partnereimmel méltányos kereskedelemi formát alakítottam ki, így a rendeléseddel te is közvetlenül támogathatod a magyar bio- és konvencionális termelőket.',
            image: 'https://farm2fork.hu/wp-content/uploads/elementor/thumbs/BOLDI_DSC3935_1_JAV-r1tujo69unncwbabqih12ov881d47pfc8h9om8203s.jpg',
        },
        {
            title: 'FARM TO TABLE',
            description:
                'A farm-to-table elvnek megfelelően célom, hogy a szállított zöldségek és gyümölcsök minél kevesebbet utazzanak a termelés helyétől a felhasználást jelentő konyháig.',
            image: 'https://farm2fork.hu/wp-content/uploads/elementor/thumbs/BOLDI_DSC3863-r1tujhleitecn1jvsxmn38j02c9jptp7vkpa9abrbc.jpg',
        },
    ];
    return (
        <Container
            maxWidth="lg"
            sx={{
                py: 8,
                fontSize: '16px',
                fontWeight: '400',
                lineHeight: '32px',
                textAlign: 'start',
                wordWrap: 'break-word',
            }}
        >
            <Grid container spacing={4}>
                {rolunkWhats.map((categoryText) => (
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 4 }} key={categoryText.title}>
                        <Box maxWidth={420} mx="auto">
                            <Image
                                src={categoryText.image || 'https://placehold.co/420x125/png'}
                                alt={categoryText.title}
                                sx={{ borderRadius: '5px', mb: 2 }}
                            />
                            <Typography
                                component="h3"
                                sx={{ fontWeight: 'bold', fontSize: { xs: '20px', md: '28px' } }}
                                gutterBottom
                            >
                                {categoryText.title}
                            </Typography>
                            <Typography gutterBottom>{categoryText.description}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
