import { Paper, Box, TextField, InputAdornment } from '@mui/material';
import F2FIcons from "src/components/f2ficons/f2ficons";

export default function DeliveryAreaMap() {

  const mapEmbedUrl = "https://www.google.com/maps/d/u/0/viewer?mid=1Wpj3OxUVcJZ5Ohw-6iZ894PP-rrcyHB-&femb=1&ll=47.5632748294086%2C18.72380555000002&z=10"

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper elevation={4} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            id="postcode-search"
            label="Irányítószám"
            variant="outlined"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <F2FIcons name='Search2' height={22} width={22} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box
          sx={{
            position: 'relative',
            aspectRatio: '16/9',
            width: '100%',
            height: 'auto'
          }}
        >
          <Box
            component="iframe"
            src={mapEmbedUrl}
            title="Farm2Fork szállítási terület"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Box>
      </Paper>
    </Box>
  );
}