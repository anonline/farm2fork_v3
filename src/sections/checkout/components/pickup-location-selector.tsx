import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';

import { useGetPickupLocations } from 'src/actions/pickup-location';

import { PickupLocationCard } from './pickup-location-card';

// ----------------------------------------------------------------------

type PickupLocationSelectorProps = {
    selectedPickupLocation: number | null;
    onLocationChange: (locationId: number) => void;
};

export function PickupLocationSelector({
    selectedPickupLocation,
    onLocationChange,
}: PickupLocationSelectorProps) {
    const [showAllPickupLocations, setShowAllPickupLocations] = useState<boolean>(false);

    const { locations: pickupLocations, locationsLoading } = useGetPickupLocations();

    const handleLocationChange = (locationId: number) => {
        onLocationChange(locationId);
        setShowAllPickupLocations(false); // Hide other locations after selection
    };

    const handleLoadAllPickupLocations = () => {
        setShowAllPickupLocations(true);
    };

    const handleCloseSelection = () => {
        setShowAllPickupLocations(false);
    };

    // Get the currently selected location or default to Farm2Fork
    const getDisplayedLocation = () => {
        if (selectedPickupLocation) {
            return pickupLocations.find((loc) => loc.id === selectedPickupLocation);
        }
        return pickupLocations.find((loc) => loc.enabled && loc.name.includes('Farm2Fork'));
    };

    const displayedLocation = getDisplayedLocation();

    if (locationsLoading) {
        return <Typography>Átvételi pontok betöltése...</Typography>;
    }

    return (
        <Box sx={{ mt: 3 }}>
            <RadioGroup
                value={selectedPickupLocation || ''}
                onChange={(e) => handleLocationChange(Number(e.target.value))}
            >
                {/* Show selected pickup location or default */}
                {displayedLocation && (
                    <PickupLocationCard
                        location={displayedLocation}
                        isSelected
                        value={displayedLocation.id}
                    />
                )}

                {/* Show all locations button or change selection button */}
                {!showAllPickupLocations ? (
                    <Button
                        variant="outlined"
                        onClick={handleLoadAllPickupLocations}
                        sx={{ mb: 2 }}
                        fullWidth
                    >
                        {selectedPickupLocation
                            ? 'Átvételi pont módosítása'
                            : 'Összes átvételi pont betöltése'}
                    </Button>
                ) : (
                    <Button variant="text" onClick={handleCloseSelection} sx={{ mb: 2 }} fullWidth>
                        Kiválasztás bezárása
                    </Button>
                )}

                {/* All pickup locations */}
                <Collapse in={showAllPickupLocations}>
                    {pickupLocations
                        .filter(
                            (location) => location.enabled && location.id !== selectedPickupLocation
                        )
                        .map((location) => (
                            <PickupLocationCard
                                key={location.id}
                                location={location}
                                isSelected={selectedPickupLocation === location.id}
                                value={location.id}
                                onChange={handleLocationChange}
                            />
                        ))}
                </Collapse>
            </RadioGroup>
        </Box>
    );
}
