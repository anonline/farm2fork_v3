/**
 * Shared announcement helpers
 * Used by both the cron job and server actions to avoid duplication
 */


// Array of possible announcement messages (Hungarian)
export const ANNOUNCEMENT_MESSAGES = [
  'Friss termékek érkeztek! Tekintse meg új kínálatunkat.',
  'Szezonális különlegességek most elérhető áron!',
  'Házhoz szállítás minden kedden és csütörtökön!',
  'Bio minősítésű termékek széles választéka várja!',
  'Előrendelhető szezonális csomagok 20% kedvezménnyel!',
  'Helyi termelőktől frissen: ma szedett gyümölcsök!',
  'Újdonság: vegán és gluténmentes termékpaletta!',
  'Fenntartható csomagolásban, környezetbarát módon!',
  'Családi gazdaságokból közvetlenül az asztalára!',
  'Minőségi termékek, fair áron, helyi termelőktől!'
];

// Array of possible announcement messages (English)
export const ANNOUNCEMENT_MESSAGES_EN = [
  'Fresh products have arrived! Check out our new selection.',
  'Seasonal specialties now available at great prices!',
  'Home delivery every Tuesday and Thursday!',
  'Wide selection of organic certified products awaits!',
  'Pre-order seasonal packages with 20% discount!',
  'Fresh from local producers: today\'s picked fruits!',
  'New: vegan and gluten-free product range!',
  'Sustainable packaging, environmentally friendly!',
  'From family farms directly to your table!',
  'Quality products, fair prices, from local producers!'
];

/**
 * Get a random announcement message in both languages
 */
export function getRandomAnnouncement() {
  const randomIndex = Math.floor(Math.random() * ANNOUNCEMENT_MESSAGES.length);
  return {
    text: ANNOUNCEMENT_MESSAGES[randomIndex],
    text_en: ANNOUNCEMENT_MESSAGES_EN[randomIndex]
  };
}

/**
 * Get validity dates for announcements
 * Valid from today at 00:00 until tomorrow at 23:59
 */
export function getValidityDates() {
  const now = new Date();
  const validFrom = new Date(now);
  
  // Valid from today at 00:00
  validFrom.setHours(0, 0, 0, 0);
  
  // Valid until tomorrow at 23:59
  const validUntil = new Date(validFrom);
  validUntil.setDate(validUntil.getDate() + 1);
  validUntil.setHours(23, 59, 59, 999);
  
  return {
    validFrom: validFrom.toISOString().slice(0, 19), // Remove 'Z' for timestamp without time zone
    validUntil: validUntil.toISOString().slice(0, 19)
  };
}

/**
 * Get next announcement based on shipping zones and delivery rules
 * Falls back to random announcement if no shipping zone data available
 * Note: This function needs to be imported where Supabase client is available
 */
export async function getNextAnnouncementText(supabaseClient: any, formatDate: (date: string, format: string) => string) {
  const DEFAULT_POSTCODE = '1011';
  const randomIndex = Math.floor(Math.random() * ANNOUNCEMENT_MESSAGES.length);

  try {
    // Fetch ALL shipping zones for default postcode (there can be multiple rules)
    const { data: zoneData, error: zoneError } = await supabaseClient
      .from('ShippingZones')
      .select('*')
      .eq('Iranyitoszam', DEFAULT_POSTCODE);

    if (zoneError || !zoneData || zoneData.length === 0) {
      return {
        text: ANNOUNCEMENT_MESSAGES[randomIndex],
        text_en: ANNOUNCEMENT_MESSAGES_EN[randomIndex],
      };
    }

    const now = new Date();
    
    // Get current day of week (0 = Sunday, 1 = Monday, 2 = Tuesday, etc.)
    const currentDay = now.getDay();
    
    // Get current time in HH:MM:SS format
    const currentTime = now.toTimeString().slice(0, 8);
    
    // Fetch all denied shipping dates
    const { data: deniedDates, error: deniedError } = await supabaseClient
      .from('DeniedShippingDates')
      .select('date');
    
    const deniedDatesSet = new Set(
      deniedDates?.map((d: any) => d.date) || []
    );
    
    const MAX_ATTEMPTS = 52; // Try up to 52 weeks ahead
    
    // Helper function to calculate next delivery date for a specific zone rule
    const calculateNextDeliveryForZone = (zone: any): Date | null => {
      const cutoffTime = zone.CutoffIdo;
      
      // Helper function to calculate delivery date from a given order day
      const calculateDeliveryFromOrderDay = (orderDate: Date): Date => {
        const deliveryDate = new Date(orderDate);
        const orderDayOfWeek = orderDate.getDay();
        let daysToAdd = zone.SzallitasiNap - orderDayOfWeek;
        
        if (daysToAdd <= 0) {
          daysToAdd += 7; // Next week
        }
        
        deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
        return deliveryDate;
      };
      
      // Start checking from today
      let checkDate = new Date(now);
      
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        let orderDate: Date;
        
        // Find the next order day (RendelesiNap)
        const checkDayOfWeek = checkDate.getDay();
        const checkTime = checkDate.toTimeString().slice(0, 8);
        
        // If it's currently the order day and before cutoff, we can order today
        if (checkDayOfWeek === zone.RendelesiNap && checkTime < cutoffTime && attempt === 0) {
          orderDate = new Date(checkDate);
        } else {
          // Find next occurrence of order day
          let daysUntilOrderDay = zone.RendelesiNap - checkDayOfWeek;
          
          // If order day already passed this week or it's today but after cutoff
          if (daysUntilOrderDay <= 0) {
            daysUntilOrderDay += 7;
          }
          
          orderDate = new Date(checkDate);
          orderDate.setDate(orderDate.getDate() + daysUntilOrderDay);
        }
        
        // Calculate delivery date from order date
        const potentialDeliveryDate = calculateDeliveryFromOrderDay(orderDate);
        const deliveryDateString = potentialDeliveryDate.toISOString().slice(0, 10);
        
        // Check if this date is denied
        if (!deniedDatesSet.has(deliveryDateString)) {
          return potentialDeliveryDate;
        }
        
        // If denied, move to next order cycle (next week from order date)
        checkDate = new Date(orderDate);
        checkDate.setDate(checkDate.getDate() + 7);
      }
      
      return null;
    };
    
    // Calculate next delivery date for each zone rule
    const possibleDeliveryDates: Date[] = [];
    
    for (const zone of zoneData) {
      const deliveryDate = calculateNextDeliveryForZone(zone);
      if (deliveryDate) {
        possibleDeliveryDates.push(deliveryDate);
      }
    }
    
    // If no valid delivery dates found, fall back
    if (possibleDeliveryDates.length === 0) {
      return {
        text: ANNOUNCEMENT_MESSAGES[randomIndex],
        text_en: ANNOUNCEMENT_MESSAGES_EN[randomIndex],
      };
    }
    
    // Choose the closest (earliest) delivery date
    const nextDeliveryDate = possibleDeliveryDates.reduce((earliest, current) => 
      current < earliest ? current : earliest
    );

    // If no valid delivery date found, fall back to random announcement
    if (!nextDeliveryDate) {
      return {
        text: ANNOUNCEMENT_MESSAGES[randomIndex],
        text_en: ANNOUNCEMENT_MESSAGES_EN[randomIndex],
      };
    }

    const formattedDate = formatDate(nextDeliveryDate.toISOString(), 'MM.DD');
    const dayName = formatDate(nextDeliveryDate.toISOString(), 'dddd');

    const dayHunSuffix = (day:number) => {
      const anArray = [2,3,6,8,13,16,18,20,23,26,28,30];
      const enArray = [1,4,5,7,9,10,11,12,14,15,17,19,21,22,24,25,27,29,31];
      if (anArray.includes(day)) return 'án';
      if (enArray.includes(day)) return 'én';
      return 'án';
    }

    const dayNameSuffix = (dayOfWeek: string) => {
      const suffixes: { [key: string]: string } = {
        'hétfő': 'n',
        'kedd': 'en',
        'szerda': 'án',
        'csütörtök': 'ön',
        'péntek': 'en',
        'szombat': 'on',
        'vasárnap': '',
      };
      return suffixes[dayOfWeek] || 'n';
    }

    return {
      text: `A ma leadott rendeléseket leghamarabb ${dayName + dayNameSuffix(dayName)} ${formattedDate}-${dayHunSuffix(nextDeliveryDate.getDate())} szállítjuk ki.`,
      text_en: `Orders placed today will be delivered earliest on ${formattedDate}.`,
    };
  } catch (error) {
    console.error('Error fetching next announcement:', error);
    return {
      text: ANNOUNCEMENT_MESSAGES[randomIndex],
      text_en: ANNOUNCEMENT_MESSAGES_EN[randomIndex],
    };
  }
}
