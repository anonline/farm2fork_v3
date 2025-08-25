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

// Helper function to check if we can order for a specific week and zone
const canOrderForWeek = (weekStartDate: Date, zone: IShippingZone): { canOrder: boolean; reason?: string } => {
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
export const getAvailableDeliveryDates = async (zipCode: string): Promise<IAvailableDeliveryDate[]> => {
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

  const deniedDatesSet = new Set(deniedDates?.map(d => d.date) || []);
  const allPossibleDeliveries: { date: string; displayDate: string; isDenied: boolean; zone: IShippingZone }[] = [];
  const today = new Date();
  
  console.log('Today:', formatDateDisplay(today), 'Day index:', today.getDay());
  
  // Process each shipping zone
  for (const zone of shippingZones) {
    console.log(`Processing zone ${zone.ID}: Order until day ${zone.RendelesiNap} (${getDayName(zone.RendelesiNap)}), deliver on day ${zone.SzallitasiNap} (${getDayName(zone.SzallitasiNap)}), cutoff: ${zone.CutoffIdo}`);
    
    // Look for delivery opportunities over the next 4 weeks
    let weekStartDate = new Date(today);
    weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay()); // Start of current week (Sunday)
    
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(weekStartDate);
      weekStart.setDate(weekStart.getDate() + (week * 7));
      
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
        
        console.log(`-> Delivery date: ${formatDateDisplay(deliveryDate)} (${dateStorage}), denied: ${isDenied}`);
        
        allPossibleDeliveries.push({
          date: dateStorage,
          displayDate: formatDateDisplay(deliveryDate),
          isDenied,
          zone
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

  console.log('Final delivery dates:', finalDates);
  return finalDates;
};

// Get available pickup times for personal pickup
export const getAvailablePickupTimes = async (pickupLocationId: number): Promise<IAvailablePickupTime[]> => {
  // Mock data for now - you can implement real Supabase query later
  const mockPickupTimes: IAvailablePickupTime[] = [
    {
      date: '2025-08-26',
      displayDate: '2025.08.26. kedd',
      timeRange: '10:00-12:00',
      isAvailable: true,
      isDenied: false
    },
    {
      date: '2025-08-27',
      displayDate: '2025.08.27. szerda',
      timeRange: '14:00-16:00',
      isAvailable: true,
      isDenied: false
    },
    {
      date: '2025-08-28',
      displayDate: '2025.08.28. csütörtök',
      timeRange: '09:00-11:00',
      isAvailable: false,
      isDenied: true
    }
  ];
  
  return mockPickupTimes;
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
