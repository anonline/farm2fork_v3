import { useState, useEffect } from 'react';

import {
    Box,
    Card,
    Radio,
    Alert,
    Stack,
    Button,
    Typography,
    CardActionArea,
    CircularProgress,
} from '@mui/material';

import { useGetPickupTimes, useGetDeliveryDates } from 'src/actions/shipping-date';

// ----------------------------------------------------------------------

interface DeliveryTimeSelectorProps {
    isHomeDelivery: boolean;
    zipCode?: string;
    pickupLocationId?: number;
    selectedDateTime: string | null;
    onDateTimeChange: (dateTime: string | null) => void;
}

export function DeliveryTimeSelector({
    isHomeDelivery,
    zipCode,
    pickupLocationId,
    selectedDateTime,
    onDateTimeChange,
}: DeliveryTimeSelectorProps) {
    const [showAll, setShowAll] = useState(false);
    
    const {
        deliveryDates,
        loading: deliveryLoading,
        error: deliveryError,
    } = useGetDeliveryDates(isHomeDelivery ? zipCode || null : null);

    const {
        pickupTimes,
        loading: pickupLoading,
        error: pickupError,
    } = useGetPickupTimes(!isHomeDelivery ? pickupLocationId || null : null);

    const loading = isHomeDelivery ? deliveryLoading : pickupLoading;
    const error = isHomeDelivery ? deliveryError : pickupError;
    
    // Auto-select first available option when data loads or changes
    useEffect(() => {
        if (!loading && !error) {
            if (isHomeDelivery && deliveryDates.length > 0) {
                // For home delivery: auto-select first available if none selected or current selection not available
                const firstAvailable = deliveryDates.find((date) => date.isAvailable);
                const currentSelectionValid =
                    selectedDateTime &&
                    deliveryDates.find(
                        (date) => date.date === selectedDateTime && date.isAvailable
                    );

                if (firstAvailable && !currentSelectionValid) {
                    onDateTimeChange(firstAvailable.date);
                }
            } else if (!isHomeDelivery && pickupTimes.length > 0) {
                // For pickup: auto-select first available if none selected or current selection not available
                const firstAvailable = pickupTimes.find((time) => time.isAvailable);
                const currentSelectionValid =
                    selectedDateTime &&
                    pickupTimes.find((time) => time.date === selectedDateTime && time.isAvailable);

                if (firstAvailable && !currentSelectionValid) {
                    onDateTimeChange(firstAvailable.date);
                }
            }
        }
    }, [
        loading,
        error,
        isHomeDelivery,
        deliveryDates,
        pickupTimes,
        selectedDateTime,
        onDateTimeChange,
        zipCode,
        pickupLocationId,
    ]);

    // Handler for date/time selection
    const handleDateTimeChange = (dateTime: string) => {
        onDateTimeChange(dateTime);
        setShowAll(false); // Hide other options after selection
    };

    // Reset showAll when data changes
    useEffect(() => {
        setShowAll(false);
    }, [isHomeDelivery, zipCode, pickupLocationId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if(!deliveryDates.length && isHomeDelivery){
        const errorMessage = "Biztosan megfelelő irányítószámot adtál meg? Ha igen kérlek vedd fel velünk a kapcsolatot.";
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage}
            </Alert>
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
        // Determine which dates to show
        const datesToShow = showAll
            ? deliveryDates
            : selectedDateTime
              ? deliveryDates.filter((date) => date.date === selectedDateTime)
              : [];
        const availableDatesCount = deliveryDates.filter((date) => date.isAvailable).length;

        return (
            <Box>
                <Stack spacing={1}>
                    {datesToShow.map((date) => (
                        <Card
                            key={date.date}
                            variant="outlined"
                            sx={{
                                cursor: date.isAvailable ? 'pointer' : 'not-allowed',
                                opacity: date.isAvailable ? 1 : 0.6,
                                transition: 'all 0.2s',
                                '&:hover': date.isAvailable
                                    ? {
                                          borderColor: 'primary.main',
                                          bgcolor: 'background.paper',
                                      }
                                    : {},
                                ...(selectedDateTime === date.date && {
                                    borderColor: 'primary.main',
                                    //bgcolor: 'primary.lighter',
                                }),
                                borderRadius: 1,
                            }}
                        >
                            <CardActionArea
                                onClick={() => date.isAvailable && handleDateTimeChange(date.date)}
                                disabled={!date.isAvailable}
                                sx={{ p: 1 }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Radio
                                        name="delivery-date"
                                        value={date.date}
                                        checked={selectedDateTime === date.date}
                                        disabled={!date.isAvailable}
                                        color="primary"
                                        onChange={() => {}} // Prevent default radio behavior
                                    />

                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: '16px',
                                                color: date.isAvailable
                                                    ? 'text.primary'
                                                    : 'text.disabled',
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

                    {/* Show/Hide button */}
                    {selectedDateTime && availableDatesCount > 1 && (
                        <Button
                            variant="outlined"
                            onClick={() => setShowAll(!showAll)}
                            sx={{ mt: 1 }}
                        >
                            {showAll ? 'Kevesebb mutatása' : `Összes időpont mutatása`}
                        </Button>
                    )}
                </Stack>
            </Box>
        );
    }

    // Personal pickup times
    const timesToShow = showAll
        ? pickupTimes
        : selectedDateTime
          ? pickupTimes.filter((time) => time.date === selectedDateTime)
          : [];
    const availableTimesCount = pickupTimes.filter((time) => time.isAvailable).length;

    return (
        <Box>
            <Stack spacing={1}>
                {timesToShow.map((time) => (
                    <Card
                        key={time.date}
                        variant="outlined"
                        sx={{
                            cursor: time.isAvailable ? 'pointer' : 'not-allowed',
                            opacity: time.isAvailable ? 1 : 0.6,
                            transition: 'all 0.2s',
                            '&:hover': time.isAvailable
                                ? {
                                      borderColor: 'primary.main',
                                      bgcolor: 'background.paper',
                                  }
                                : {},
                            ...(selectedDateTime === time.date && {
                                borderColor: 'primary.main',
                                //bgcolor: 'primary.lighter',
                            }),
                            borderRadius: 1,
                        }}
                    >
                        <CardActionArea
                            onClick={() => time.isAvailable && handleDateTimeChange(time.date)}
                            disabled={!time.isAvailable}
                            sx={{ p: 1 }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Radio
                                    name="pickup-time"
                                    value={time.date}
                                    checked={selectedDateTime === time.date}
                                    disabled={!time.isAvailable}
                                    color="primary"
                                    onChange={() => {}} // Prevent default radio behavior
                                />

                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 500,
                                            fontSize: '16px',
                                            color: time.isAvailable
                                                ? 'text.primary'
                                                : 'text.disabled',
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

                {/* Show/Hide button */}
                {selectedDateTime && availableTimesCount > 1 && (
                    <Button variant="outlined" onClick={() => setShowAll(!showAll)} sx={{ mt: 1 }}>
                        {showAll ? 'Kevesebb mutatása' : `Összes időpont mutatása`}
                    </Button>
                )}
            </Stack>
        </Box>
    );
}
