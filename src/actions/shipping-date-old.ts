import type { IShippingZone, IDeniedShippingDate, IAvailableDeliveryDate, IAvailablePickupTime, IPickupLocationSchedule } from 'src/types/shipping-date';

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

// Helper function to check if we can still order today for a given zone
const canOrderTodayForZone = (zone: IShippingZone): boolean => {
  const now = new Date();
  const today = now.getDay(); // JS: Sunday=0, Monday=1, Tuesday=2, etc.
  // No conversion needed - DB uses same numbering as JS getDay()
  
  // Check if today is within the ordering period (can order until RendelesiNap)
  if (today > zone.RendelesiNap) {
    return false; // Today is past the last ordering day for this zone
  }
  
  // If today is the last ordering day, check if we're still within the cutoff time
  if (today === zone.RendelesiNap) {
    // Parse cutoff time (HH:MM:SS format)
    const [hours, minutes] = zone.CutoffIdo.split(':').map(Number);
    const cutoffTime = new Date();
    cutoffTime.setHours(hours, minutes, 0, 0);
    
    return now <= cutoffTime;
  }
  
  // If today is before the last ordering day, we can still order
  return true;
};

// Helper function to find next ordering opportunity for a zone
const getNextOrderingDate = (zone: IShippingZone, fromDate: Date): Date => {
  const nextOrderDate = new Date(fromDate);
  const currentDay = nextOrderDate.getDay(); // JS: Sunday=0, Monday=1, Tuesday=2, etc.
  // No conversion needed - DB uses same numbering as JS getDay()
  
  // If we're past the ordering period for this week, move to next week
  if (currentDay > zone.RendelesiNap) {
    // Calculate days until next ordering period starts (next week)
    const daysUntilNextWeek = 7 - currentDay;
    nextOrderDate.setDate(nextOrderDate.getDate() + daysUntilNextWeek);
  }
  // If we're before or on the ordering day, we can use today (handled by caller)
  
  return nextOrderDate;
};

// Helper function to calculate delivery date from order date
const getDeliveryDateFromOrderDate = (orderDate: Date, zone: IShippingZone): Date => {
  const deliveryDate = new Date(orderDate);
  const orderDay = orderDate.getDay(); // JS: Sunday=0, Monday=1, Tuesday=2, etc.
  // No conversion needed - DB uses same numbering as JS getDay()
  
  // Calculate days until delivery day
  const daysUntilDelivery = zone.SzallitasiNap - orderDay;
  const daysToAdd = daysUntilDelivery <= 0 ? daysUntilDelivery + 7 : daysUntilDelivery;
  
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
  return deliveryDate;
};

// Helper function to find next ordering opportunity for a zone
const getNextOrderingDate = (zone: IShippingZone, fromDate: Date): Date => {
  const nextOrderDate = new Date(fromDate);
  const currentDay = nextOrderDate.getDay(); // JS: Sunday=0, Monday=1, Tuesday=2, etc.
  // DB uses same numbering: Sunday=0, Monday=1, Tuesday=2, etc.
  
  // If we're past the ordering period for this week, move to next week
  if (currentDay > zone.RendelesiNap) {
    // Calculate days until next Monday (start of next ordering period)
    const daysUntilNextMonday = (7 - currentDay) + 1;
    nextOrderDate.setDate(nextOrderDate.getDate() + daysUntilNextMonday);
  }
  // If we're before or on the ordering day, we can use today (handled by caller)
  
  return nextOrderDate;
};

// Helper function to calculate delivery date from order date
const getDeliveryDateFromOrderDate = (orderDate: Date, zone: IShippingZone): Date => {
  const deliveryDate = new Date(orderDate);
  const orderDay = orderDate.getDay(); // JS: Sunday=0, Monday=1, Tuesday=2, etc.
  
  // Calculate days until delivery day in the NEXT week
  // This assumes delivery always happens the week after ordering
  let daysUntilDelivery = zone.SzallitasiNap - orderDay;
  
  // Always move to next week for delivery
  if (daysUntilDelivery <= 0) {
    daysUntilDelivery += 7;
  } else {
    // Even if delivery day is later this week, move to next week
    daysUntilDelivery += 7;
  }
  
  deliveryDate.setDate(deliveryDate.getDate() + daysUntilDelivery);
  return deliveryDate;
};

// Hook for getting delivery dates
export const useGetDeliveryDates = (zipCode: string | null) => {
  const SWR_KEY = zipCode ? `delivery-dates-${zipCode}` : null;
  
  const { data, isLoading, error, mutate } = useSWR(
    SWR_KEY,
    async () => {
      if (!zipCode) return [];
      return getAvailableDeliveryDates(zipCode);
    }
  );

  return {
    deliveryDates: data || [],
    loading: isLoading,
    error,
    refetch: mutate
  };
};

// Hook for getting pickup times  
export const useGetPickupTimes = (pickupLocationId: number | null) => {
  const SWR_KEY = pickupLocationId ? `pickup-times-${pickupLocationId}` : null;
  
  const { data, isLoading, error, mutate } = useSWR(
    SWR_KEY,
    async () => {
      if (!pickupLocationId) return [];
      return getAvailablePickupTimes(pickupLocationId);
    }
  );

  return {
    pickupTimes: data || [],
    loading: isLoading,
    error,
    refetch: mutate
  };
};

// Get available delivery dates for home delivery based on shipping zone
export const getAvailableDeliveryDates = async (zipCode: string): Promise<IAvailableDeliveryDate[]> => {
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

  // Get all denied dates
  const { data: deniedDates, error: deniedError } = await supabase
    .from('DeniedShippingDates')
    .select('date');
  
  if (deniedError) {
    console.error('Error fetching denied dates:', deniedError);
  }

  const deniedDatesSet = new Set(deniedDates?.map(d => d.date) || []);

  // Calculate delivery dates for each shipping zone rule
  const allPossibleDeliveries: { date: string; displayDate: string; isDenied: boolean; zone: IShippingZone }[] = [];
  const today = new Date();
  
  // For each shipping zone, calculate the next few delivery opportunities
  for (const zone of shippingZones) {
    let currentSearchDate = new Date(today);
    let foundDeliveries = 0;
    
    // Generate up to 10 delivery dates per zone to have enough to choose from
    while (foundDeliveries < 10) {
      let orderDate: Date;
      
      // Check if we can still order this week for this zone
      if (canOrderTodayForZone(zone)) {
        // We can order now for this week's delivery
        orderDate = new Date(today);
      } else {
        // We need to wait for next week's ordering period
        orderDate = getNextOrderingDate(zone, currentSearchDate);
      }
      
      // Calculate delivery date from order date
      const deliveryDate = getDeliveryDateFromOrderDate(orderDate, zone);
      
      const dateStorage = formatDateStorage(deliveryDate);
      const isDenied = deniedDatesSet.has(dateStorage);
      
      allPossibleDeliveries.push({
        date: dateStorage,
        displayDate: formatDateDisplay(deliveryDate),
        isDenied,
        zone
      });
      
      foundDeliveries++;
      
      // Move search date to next week to find next opportunity
      currentSearchDate = new Date(orderDate);
      currentSearchDate.setDate(currentSearchDate.getDate() + 7);
      
      // Safety check to prevent infinite loop
      if (currentSearchDate.getTime() - today.getTime() > 60 * 24 * 60 * 60 * 1000) { // 60 days
        break;
      }
    }
  }

  // Sort all delivery dates chronologically
  allPossibleDeliveries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Merge and alternate between zones, removing exact duplicates
  const finalDates: IAvailableDeliveryDate[] = [];
  const seenDates = new Set<string>();
  let availableCount = 0;

  for (const delivery of allPossibleDeliveries) {
    // Skip if we've already seen this exact date
    if (seenDates.has(delivery.date)) {
      continue;
    }
    
    seenDates.add(delivery.date);
    
    finalDates.push({
      date: delivery.date,
      displayDate: delivery.displayDate,
      isAvailable: !delivery.isDenied,
      isDenied: delivery.isDenied
    });
    
    if (!delivery.isDenied) {
      availableCount++;
    }
    
    // Stop when we have 3 available dates
    if (availableCount >= 3) {
      break;
    }
  }

  return finalDates;
};

// Get available pickup times for personal pickup based on pickup location
export const getAvailablePickupTimes = async (pickupLocationId: number): Promise<IAvailablePickupTime[]> => {
  // Get pickup location schedule
  const { data: pickupLocation, error: pickupError } = await supabase
    .from('PickupLocations')
    .select('id, name, monday, tuesday, wednesday, thursday, friday, saturday, sunday')
    .eq('id', pickupLocationId)
    .eq('enabled', true)
    .single();
  
  if (pickupError) {
    console.error('Error fetching pickup location:', pickupError);
    throw new Error(`Error fetching pickup location: ${pickupError.message}`);
  }

  if (!pickupLocation) {
    throw new Error(`No pickup location found for ID: ${pickupLocationId}`);
  }

  // Get all denied dates
  const { data: deniedDates, error: deniedError } = await supabase
    .from('DeniedShippingDates')
    .select('date');
  
  if (deniedError) {
    console.error('Error fetching denied dates:', deniedError);
  }

  const deniedDatesSet = new Set(deniedDates?.map(d => d.date) || []);

  const availableTimes: IAvailablePickupTime[] = [];
  const today = new Date();
  let currentDate = new Date(today);
  let availableCount = 0;

  // Generate dates until we have 3 available dates
  while (availableCount < 3) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    let timeRange: string | null = null;

    // Get time range for current day
    switch (dayOfWeek) {
      case 0: timeRange = pickupLocation.sunday || null; break;
      case 1: timeRange = pickupLocation.monday || null; break;
      case 2: timeRange = pickupLocation.tuesday || null; break;
      case 3: timeRange = pickupLocation.wednesday || null; break;
      case 4: timeRange = pickupLocation.thursday || null; break;
      case 5: timeRange = pickupLocation.friday || null; break;
      case 6: timeRange = pickupLocation.saturday || null; break;
    }

    if (timeRange) {
      const dateStorage = formatDateStorage(currentDate);
      const isDenied = deniedDatesSet.has(dateStorage);
      
      availableTimes.push({
        date: dateStorage,
        displayDate: formatDateDisplay(currentDate).split('.').slice(0, 3).join('.') + '.', // Remove day name for pickup
        timeRange,
        isAvailable: !isDenied,
        isDenied
      });
      
      if (!isDenied) {
        availableCount++;
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Safety check to prevent infinite loop
    if (availableTimes.length > 50) {
      break;
    }
  }

  return availableTimes;
};
