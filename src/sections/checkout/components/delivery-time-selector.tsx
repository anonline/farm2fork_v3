import type { IAvailableDeliveryDate, IAvailablePickupTime } from 'src/types/shipping-date';

import { 
  Box, 
  Card, 
  CardActionArea, 
  Radio, 
  Typography, 
  Alert,
  CircularProgress,
  Stack 
} from '@mui/material';

import { useGetDeliveryDates, useGetPickupTimes } from 'src/actions/shipping-date';

// ----------------------------------------------------------------------

interface DeliveryTimeSelectorProps {
  isHomeDelivery: boolean;
  zipCode?: string;
  pickupLocationId?: number;
  selectedDateTime: string | null;
  onDateTimeChange: (dateTime: string) => void;
}

export function DeliveryTimeSelector({
  isHomeDelivery,
  zipCode,
  pickupLocationId,
  selectedDateTime,
  onDateTimeChange,
}: DeliveryTimeSelectorProps) {
  const { deliveryDates, loading: deliveryLoading, error: deliveryError } = useGetDeliveryDates(
    isHomeDelivery ? zipCode || null : null
  );
  
  const { pickupTimes, loading: pickupLoading, error: pickupError } = useGetPickupTimes(
    !isHomeDelivery ? pickupLocationId || null : null
  );

  const loading = isHomeDelivery ? deliveryLoading : pickupLoading;
  const error = isHomeDelivery ? deliveryError : pickupError;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {errorMessage}
      </Alert>
    );
  }

  if (isHomeDelivery) {
    return (
      <Box>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Válaszd ki a szállítási dátumot:
        </Typography>
        
        <Stack spacing={2}>
          {deliveryDates.map((date) => (
            <Card
              key={date.date}
              variant="outlined"
              sx={{
                cursor: date.isAvailable ? 'pointer' : 'not-allowed',
                opacity: date.isAvailable ? 1 : 0.6,
                transition: 'all 0.2s',
                '&:hover': date.isAvailable ? {
                  borderColor: 'primary.main',
                  bgcolor: 'background.paper',
                } : {},
                ...(selectedDateTime === date.date && {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.lighter',
                }),
              }}
            >
              <CardActionArea 
                onClick={() => date.isAvailable && onDateTimeChange(date.date)}
                disabled={!date.isAvailable}
                sx={{ p: 2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Radio
                    checked={selectedDateTime === date.date}
                    disabled={!date.isAvailable}
                    color="primary"
                  />
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        color: date.isAvailable ? 'text.primary' : 'text.disabled'
                      }}
                    >
                      {date.displayDate}
                    </Typography>
                    
                    {date.isDenied && (
                      <Typography variant="caption" color="error">
                        Nem elérhető szállítási nap
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      </Box>
    );
  }

  // Personal pickup times
  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Válaszd ki az átvételi időpontot:
      </Typography>
      
      <Stack spacing={2}>
        {pickupTimes.map((time) => (
          <Card
            key={time.date}
            variant="outlined"
            sx={{
              cursor: time.isAvailable ? 'pointer' : 'not-allowed',
              opacity: time.isAvailable ? 1 : 0.6,
              transition: 'all 0.2s',
              '&:hover': time.isAvailable ? {
                borderColor: 'primary.main',
                bgcolor: 'background.paper',
              } : {},
              ...(selectedDateTime === time.date && {
                borderColor: 'primary.main',
                bgcolor: 'primary.lighter',
              }),
            }}
          >
            <CardActionArea 
              onClick={() => time.isAvailable && onDateTimeChange(time.date)}
              disabled={!time.isAvailable}
              sx={{ p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Radio
                  checked={selectedDateTime === time.date}
                  disabled={!time.isAvailable}
                  color="primary"
                />
                
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      color: time.isAvailable ? 'text.primary' : 'text.disabled'
                    }}
                  >
                    {time.displayDate} {time.timeRange}
                  </Typography>
                  
                  {time.isDenied && (
                    <Typography variant="caption" color="error">
                      Nem elérhető átvételi nap
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
