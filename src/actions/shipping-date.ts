import type { IPickupLocation } from 'src/types/pickup-location';
import type {
    IShippingZone,
    IAvailablePickupTime,
    IAvailableDeliveryDate,
} from 'src/types/shipping-date';

import useSWR from 'swr';

import { supabase } from 'src/lib/supabase';

// Helper function to get day name in Hungarian
const getDayName = (dayIndex: number): string => {
    const days = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'];
    return days[dayIndex];
};

// Helper function to format date for display
const formatDateDisplay = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayName = getDayName(date.getDay());

    return `${year}.${month}.${day}. ${dayName}`;
};

// Helper function to format date for storage (YYYY-MM-DD)
const formatDateStorage = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// Helper function to check if we can order for a specific week and zone
const canOrderForWeek = (
    weekStartDate: Date,
    zone: IShippingZone
): { canOrder: boolean; reason?: string } => {
    const now = new Date();
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6); // End of week

    // If this is a future week, we can always order
    if (weekStartDate.getTime() > now.getTime()) {
        return { canOrder: true };
    }

    // If this is the current week, check ordering constraints
    if (weekStartDate.getTime() <= now.getTime() && now.getTime() <= weekEndDate.getTime()) {
        const today = now.getDay(); // 0=Sunday, 1=Monday, etc.

        // Check if today is past the ordering deadline for this zone
        if (today > zone.RendelesiNap) {
            return { canOrder: false, reason: 'Past ordering deadline for this week' };
        }

        // If today is the deadline day, check cutoff time
        if (today === zone.RendelesiNap) {
            const [hours, minutes] = zone.CutoffIdo.split(':').map(Number);
            const cutoffTime = new Date();
            cutoffTime.setHours(hours, minutes, 0, 0);

            if (now > cutoffTime) {
                return { canOrder: false, reason: 'Past cutoff time for today' };
            }
        }

        return { canOrder: true };
    }

    // Past week - cannot order
    return { canOrder: false, reason: 'Past week' };
};

// Get available delivery dates for home delivery based on shipping zone
export const getAvailableDeliveryDates = async (
    zipCode: string
): Promise<IAvailableDeliveryDate[]> => {
    console.log('Getting delivery dates for zip code:', zipCode);

    // Get shipping zones for the zip code
    const { data: shippingZones, error: shippingError } = await supabase
        .from('ShippingZones')
        .select('*')
        .eq('Iranyitoszam', zipCode);

    if (shippingError) {
        console.error('Error fetching shipping zones:', shippingError);
        throw new Error(`Error fetching shipping zones: ${shippingError.message}`);
    }

    if (!shippingZones || shippingZones.length === 0) {
        throw new Error(`No shipping zone found for zip code: ${zipCode}`);
    }

    console.log('Found shipping zones:', shippingZones);

    // Get all denied dates
    const { data: deniedDates, error: deniedError } = await supabase
        .from('DeniedShippingDates')
        .select('date');

    if (deniedError) {
        console.error('Error fetching denied dates:', deniedError);
    }

    const deniedDatesSet = new Set(deniedDates?.map((d) => d.date) || []);
    const allPossibleDeliveries: {
        date: string;
        displayDate: string;
        isDenied: boolean;
        zone: IShippingZone;
    }[] = [];
    const today = new Date();

    console.log('Today:', formatDateDisplay(today), 'Day index:', today.getDay());

    // Process each shipping zone
    for (const zone of shippingZones) {
        console.log(
            `Processing zone ${zone.ID}: Order until day ${zone.RendelesiNap} (${getDayName(zone.RendelesiNap)}), deliver on day ${zone.SzallitasiNap} (${getDayName(zone.SzallitasiNap)}), cutoff: ${zone.CutoffIdo}`
        );

        // Look for delivery opportunities over the next 4 weeks
        const weekStartDate = new Date(today);
        weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay()); // Start of current week (Sunday)

        for (let week = 0; week < 4; week++) {
            const weekStart = new Date(weekStartDate);
            weekStart.setDate(weekStart.getDate() + week * 7);

            const canOrder = canOrderForWeek(weekStart, zone);
            console.log(`Week ${week + 1} (${formatDateDisplay(weekStart)}):`, canOrder);

            if (canOrder.canOrder) {
                // Calculate delivery date for this week
                const deliveryDate = new Date(weekStart);
                deliveryDate.setDate(deliveryDate.getDate() + zone.SzallitasiNap); // Move to delivery day of this week

                // Skip if delivery date is in the past
                const todayStart = new Date(today);
                todayStart.setHours(0, 0, 0, 0);
                if (deliveryDate < todayStart) {
                    continue;
                }

                const dateStorage = formatDateStorage(deliveryDate);
                const isDenied = deniedDatesSet.has(dateStorage);

                console.log(
                    `-> Delivery date: ${formatDateDisplay(deliveryDate)} (${dateStorage}), denied: ${isDenied}`
                );

                allPossibleDeliveries.push({
                    date: dateStorage,
                    displayDate: formatDateDisplay(deliveryDate),
                    isDenied,
                    zone,
                });
            }
        }
    }

    // Sort all delivery dates chronologically
    allPossibleDeliveries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Remove duplicates and return final list
    const finalDates: IAvailableDeliveryDate[] = [];
    const seenDates = new Set<string>();
    let availableCount = 0;

    for (const delivery of allPossibleDeliveries) {
        if (seenDates.has(delivery.date)) {
            continue;
        }

        seenDates.add(delivery.date);

        finalDates.push({
            date: delivery.date,
            displayDate: delivery.displayDate,
            isAvailable: !delivery.isDenied,
            isDenied: delivery.isDenied,
        });

        if (!delivery.isDenied) {
            availableCount++;
        }

        // Stop when we have 3 available dates
        if (availableCount >= 3) {
            break;
        }
    }

    console.log('Final delivery dates:', finalDates);
    return finalDates;
};

// Helper function to check if we can order for a specific pickup date
const canOrderForPickupDate = (pickupDate: Date): { canOrder: boolean; reason?: string } => {
    const now = new Date();
    const pickupDayIndex = pickupDate.getDay(); // 0=Sunday, 1=Monday, etc.

    // Pickup cutoff rules (hardcoded):
    // - For Monday, Tuesday, Wednesday pickup: order until Sunday 12:15
    // - For Thursday, Friday, Saturday, Sunday pickup: order until Wednesday 12:15

    let orderDeadlineDay: number; // 0=Sunday, 3=Wednesday
    const orderDeadlineTime = { hours: 12, minutes: 15 };

    // Determine which deadline applies based on pickup day
    if (pickupDayIndex >= 1 && pickupDayIndex <= 3) {
        // Monday(1), Tuesday(2), Wednesday(3) pickup -> deadline is Sunday(0)
        orderDeadlineDay = 0;
    } else {
        // Thursday(4), Friday(5), Saturday(6), Sunday(0) pickup -> deadline is Wednesday(3)
        orderDeadlineDay = 3;
    }

    // Calculate the deadline date for this pickup date
    // We need to find the most recent occurrence of orderDeadlineDay before pickupDate
    const deadlineDate = new Date(pickupDate);
    const daysToSubtract = (pickupDate.getDay() - orderDeadlineDay + 7) % 7;
    
    if (daysToSubtract === 0) {
        // If pickup day is the same as deadline day, deadline was last week
        deadlineDate.setDate(deadlineDate.getDate() - 7);
    } else {
        deadlineDate.setDate(deadlineDate.getDate() - daysToSubtract);
    }
    
    deadlineDate.setHours(orderDeadlineTime.hours, orderDeadlineTime.minutes, 0, 0);

    console.log(
        `Pickup date: ${formatDateDisplay(pickupDate)} (${getDayName(pickupDayIndex)}), ` +
        `Deadline: ${formatDateDisplay(deadlineDate)} ${orderDeadlineTime.hours}:${String(orderDeadlineTime.minutes).padStart(2, '0')}, ` +
        `Now: ${formatDateDisplay(now)} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
    );

    // Check if we're past the deadline
    if (now > deadlineDate) {
        return {
            canOrder: false,
            reason: `Past ordering deadline (${getDayName(orderDeadlineDay)} ${orderDeadlineTime.hours}:${String(orderDeadlineTime.minutes).padStart(2, '0')})`,
        };
    }

    return { canOrder: true };
};

// Get available pickup times for personal pickup
export const getAvailablePickupTimes = async (
    pickupLocationId: number
): Promise<IAvailablePickupTime[]> => {
    console.log('Getting pickup times for location ID:', pickupLocationId);

    // Get pickup location details
    const { data: pickupLocation, error: locationError } = await supabase
        .from('PickupLocations')
        .select('*')
        .eq('id', pickupLocationId)
        .single();

    if (locationError) {
        console.error('Error fetching pickup location:', locationError);
        throw new Error(`Error fetching pickup location: ${locationError.message}`);
    }

    if (!pickupLocation) {
        throw new Error(`No pickup location found with ID: ${pickupLocationId}`);
    }

    console.log('Found pickup location:', pickupLocation);

    // Get all denied dates
    const { data: deniedDates, error: deniedError } = await supabase
        .from('DeniedShippingDates')
        .select('date');

    if (deniedError) {
        console.error('Error fetching denied dates:', deniedError);
    }

    const deniedDatesSet = new Set(deniedDates?.map((d) => d.date) || []);
    const pickupTimes: IAvailablePickupTime[] = [];
    const today = new Date();

    console.log('Today:', formatDateDisplay(today), 'Day index:', today.getDay());

    // Generate pickup times for the next few days until we have 3 available days
    let dayOffset = 0;
    let availableDaysFound = 0;
    const maxDaysToCheck = 21; // Don't check more than 3 weeks ahead

    while (availableDaysFound < 3 && dayOffset < maxDaysToCheck) {
        const currentDate = new Date(today);
        currentDate.setDate(currentDate.getDate() + dayOffset);

        // Skip past dates (though this shouldn't happen with dayOffset starting from 0)
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        if (currentDate < todayStart) {
            dayOffset++;
            continue;
        }

        const dayIndex = currentDate.getDay(); // 0=Sunday, 1=Monday, etc.
        const dayNames = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
        ];
        const dayName = dayNames[dayIndex];

        // Check if pickup location is open on this day
        const timeRange = pickupLocation[dayName as keyof IPickupLocation];

        console.log(
            `Checking ${formatDateDisplay(currentDate)} (${dayName}): timeRange = "${timeRange}"`
        );

        // Only include days when location is actually open
        // Closed days have: null, undefined, empty string, 'zárva', '-', or 'closed'
        const isOpen =
            timeRange &&
            typeof timeRange === 'string' &&
            timeRange.trim() !== '' &&
            timeRange.trim() !== '-' &&
            timeRange.trim().toLowerCase() !== 'closed' &&
            timeRange.trim().toLowerCase() !== 'zárva';

        if (isOpen) {
            // Check if we can order for this pickup date based on cutoff rules
            const canOrder = canOrderForPickupDate(currentDate);
            console.log(`Can order for ${formatDateDisplay(currentDate)}:`, canOrder);

            if (canOrder.canOrder) {
                // Location is open on this day and we can still order
                const dateStorage = formatDateStorage(currentDate);
                const isDenied = deniedDatesSet.has(dateStorage);

                console.log(
                    `✓ Adding ${formatDateDisplay(currentDate)} (${dayName}): ${timeRange}, denied: ${isDenied}`
                );

                pickupTimes.push({
                    date: dateStorage,
                    displayDate: formatDateDisplay(currentDate),
                    timeRange: timeRange.trim(),
                    isAvailable: !isDenied,
                    isDenied,
                });

                // Only count this as an available day if it's not denied
                if (!isDenied) {
                    availableDaysFound++;
                }
            } else {
                console.log(
                    `✗ Skipping ${formatDateDisplay(currentDate)} (${dayName}): ${canOrder.reason}`
                );
            }
        } else {
            console.log(
                `✗ Skipping ${formatDateDisplay(currentDate)} (${dayName}): location closed (timeRange: "${timeRange}")`
            );
        }

        dayOffset++;
    }

    // Sort chronologically (should already be in order, but just to be safe)
    pickupTimes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log('Final pickup times:', pickupTimes);
    return pickupTimes;
};

// Hook for getting delivery dates
export const useGetDeliveryDates = (zipCode: string | null) => {
    const SWR_KEY = zipCode ? `delivery-dates-${zipCode}` : null;
    
    const { data, isLoading, error, mutate } = useSWR(SWR_KEY, async () => {
        if (!zipCode) return [];
        return getAvailableDeliveryDates(zipCode);
    });

    return {
        deliveryDates: data || [],
        loading: isLoading,
        error,
        refetch: mutate,
    };
};

// Hook for getting pickup times
export const useGetPickupTimes = (pickupLocationId: number | null) => {
    const SWR_KEY = pickupLocationId ? `pickup-times-${pickupLocationId}` : null;

    const { data, isLoading, error, mutate } = useSWR(SWR_KEY, async () => {
        if (!pickupLocationId) return [];
        return getAvailablePickupTimes(pickupLocationId);
    });

    return {
        pickupTimes: data || [],
        loading: isLoading,
        error,
        refetch: mutate,
    };
};
