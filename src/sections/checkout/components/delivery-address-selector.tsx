import type { IDeliveryAddress } from 'src/types/customer';

import { useState, useEffect } from 'react';
import { Card, CardActionArea, Radio, Typography, Box, IconButton, Tooltip, Alert } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { checkShippingZoneAvailable } from 'src/actions/shipping-zone';

// ----------------------------------------------------------------------

type DeliveryAddressSelectorProps = {
  deliveryAddresses: IDeliveryAddress[];
  selectedAddressIndex: number | null;
  onAddressChange: (index: number) => void;
  onEditAddress?: (index: number) => void;
  isHomeDelivery?: boolean;
};

export function DeliveryAddressSelector({
  deliveryAddresses,
  selectedAddressIndex,
  onAddressChange,
  onEditAddress,
  isHomeDelivery = false,
}: DeliveryAddressSelectorProps) {
  const [shippingZoneError, setShippingZoneError] = useState<string | null>(null);
  const [checkingZone, setCheckingZone] = useState(false);

  // Check shipping zone when address is selected and it's home delivery
  useEffect(() => {
    if (!isHomeDelivery || selectedAddressIndex === null || !deliveryAddresses[selectedAddressIndex]) {
      setShippingZoneError(null);
      return;
    }

    const checkShippingZone = async () => {
      setCheckingZone(true);
      setShippingZoneError(null);
      
      try {
        const selectedAddress = deliveryAddresses[selectedAddressIndex];
        const isAvailable = await checkShippingZoneAvailable(selectedAddress.zipCode);
        
        if (!isAvailable) {
          setShippingZoneError(
            'Sajnos a kiválasztott címre még nem elérhető a házhozszállításunk. Kérlek válassz a személyes átvételi pontjaink közül. További információ a rendelés menetéről.'
          );
        }
      } catch (error) {
        console.error('Error checking shipping zone:', error);
        setShippingZoneError(
          'Hiba történt a szállítási zóna ellenőrzése során. Kérlek próbáld újra.'
        );
      } finally {
        setCheckingZone(false);
      }
    };

    checkShippingZone();
  }, [selectedAddressIndex, deliveryAddresses, isHomeDelivery]);
  if (!deliveryAddresses || deliveryAddresses.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Nincsenek mentett szállítási címek
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {deliveryAddresses.map((address, index) => (
        <Card
          key={index}
          variant="outlined"
          sx={{
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'background.paper',
            },
            ...(selectedAddressIndex === index && {
              borderColor: 'primary.main',
              //bgcolor: 'primary.lighter',
            }),
          }}
        >
          {/* Edit button positioned absolutely outside the clickable area */}
          {onEditAddress && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEditAddress(index);
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'background.paper',
                zIndex: 1,
                '&:hover': {
                  //bgcolor: 'grey.100',
                },
              }}
            >
              <Iconify icon="solar:pen-bold" width={16} />
            </IconButton>
          )}
          
          <CardActionArea onClick={() => onAddressChange(index)} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Radio
                checked={selectedAddressIndex === index}
                sx={{ mt: -0.5 }}
                color="primary"
              />
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {address.fullName}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, flexWrap: 'wrap', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                   {address.comment && <Tooltip title={address.comment}><Iconify icon={'eva:info-outline'} height={16} /></Tooltip>}
                   {address.zipCode} {address.city} {address.streetAddress}
                  {address.floorDoor && `, ${address.floorDoor}`}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {address.phone}
                </Typography>
              </Box>
            </Box>
          </CardActionArea>
        </Card>
      ))}

      {/* Shipping zone error alert */}
      {shippingZoneError && (
        <Alert 
          severity="error" 
          sx={{ mt: 1 }}
        >
          <Typography variant="body2">
            {shippingZoneError.includes('További információ') ? (
              <>
                Sajnos a kiválasztott címre még nem elérhető a házhozszállításunk. Kérlek válassz a személyes átvételi pontjaink közül. További információ a{' '}
                <Box 
                  component="a" 
                  href="/rolunk" 
                  sx={{ 
                    color: 'primary.main', 
                    textDecoration: 'underline',
                    '&:hover': {
                      textDecoration: 'none'
                    }
                  }}
                >
                  rendelés menetéről
                </Box>.
              </>
            ) : (
              shippingZoneError
            )}
          </Typography>
        </Alert>
      )}

      {/* Loading state */}
      {checkingZone && selectedAddressIndex !== null && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Szállítási zóna ellenőrzése...
          </Typography>
        </Box>
      )}
    </Box>
  );
}
