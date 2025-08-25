import type { IDeliveryAddress } from 'src/types/customer';

import { Card, CardActionArea, Radio, Typography, Box, IconButton, Tooltip } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type DeliveryAddressSelectorProps = {
  deliveryAddresses: IDeliveryAddress[];
  selectedAddressIndex: number | null;
  onAddressChange: (index: number) => void;
  onEditAddress?: (index: number) => void;
};

export function DeliveryAddressSelector({
  deliveryAddresses,
  selectedAddressIndex,
  onAddressChange,
  onEditAddress,
}: DeliveryAddressSelectorProps) {
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
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Válassz szállítási címet:
      </Typography>
      
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
    </Box>
  );
}
