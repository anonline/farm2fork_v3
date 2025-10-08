import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { getRolunkWhat } from 'src/actions/rolunk';

import { Image } from 'src/components/image';

export default async function RolunkWhat() {
    const rolunkWhats = await getRolunkWhat();
    
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
