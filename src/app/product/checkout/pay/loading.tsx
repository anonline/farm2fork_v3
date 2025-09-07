import { Container, Box, Typography, CircularProgress } from '@mui/material';

export default function PayLoading() {
    return (
        <Container sx={{ py: 10, textAlign: 'center' }}>
            <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Fizetés előkészítése...
                </Typography>
                
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Kérjük várjon, átirányítjuk a fizetési oldalra.
                </Typography>
            </Box>
        </Container>
    );
}
