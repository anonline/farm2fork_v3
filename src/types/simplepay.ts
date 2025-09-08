/**
 * SimplePay Error Codes
 * Comprehensive error code definitions for SimplePay payment integration
 */

// General Error Codes
export const SIMPLEPAY_ERROR_CODES = {
  // General errors
  999: 'Általános hibakód',
  1529: 'SimplePay belső hiba',
  
  // Authentication & Authorization errors (2000s)
  2003: 'Megadott jelszó érvénytelen',
  2004: 'Általános hibakód',
  2006: 'Megadott kereskedő nem található',
  2008: 'Megadott e-mail nem megfelelő',
  2010: 'Megadott tranzakcióazonosító nem megfelelő',
  2013: 'Nincs elég fedezet a kártyán',
  2014: 'Fizetéshez jelszó szükséges',
  2016: 'A felhasználó megszakította a fizetés',
  2019: 'Időtúllépés az elfogadói kommunikációban',
  2020: 'Elfogadó bank oldali hiba',
  2021: 'Kártyakibocsátó interaktív 3DS ellenőrzést igényel',
  2030: 'Kártya nem törölhető, mert egyenlege pozitív / Megadott összeg helytelen',
  2040: 'Érvénytelen devizanem',
  2063: 'Kártya inaktív',
  2064: 'Hibás bankkártya adatok',
  2066: 'Kártya nem terhelhető / limittúllépés miatt',
  2071: 'Hibás bankkártya adatok / nem létező kártya',
  2072: 'Kártya lejárat nem megfelelő / nem létező kártya',
  2073: 'A megadott CVC nem megfelelő / nem létező kártya',
  2074: 'Kártyabirtokos neve több, mint 32 karakter',
  2078: 'Általános hiba, a kártyakibocsátó bank nem adja meg a hiba okát',
  2079: 'A routingnak megfelelő elfogadó bank',
  2130: 'Helytelen bemeneti kód',
  2131: 'Helytelen cím megadás',
  2132: 'Helytelen születési dátum',
  
  // 3DS errors (3000s)
  3002: '3DS folyamat hiba',
  3003: '3DS folyamat hiba',
  3004: 'Redirect 3DS challenge folyamán (vásárló átirányítása szükséges a kártyakibocsátó ACS szerverére a kapott URL felhasználásával)',
  3012: '3DS folyamat hiba, nem 3DS képes kártya, 3DS valamelyik szereplőnél levő probléma',
  3013: '3DS folyamat hiba',
  
  // Transaction errors (5000s)
  5000: 'Általános hibakód',
  5010: 'A kereskedői fiók nem található',
  5011: 'A tranzakció nem található',
  5012: 'A kereskedői fiók nem egyezik meg',
  5013: 'A tranzakció már létezik (és nincs újraindíthatóként jelölve)',
  5014: 'A tranzakció nem megfelelő típusú',
  5015: 'A tranzakció éppen fizetés alatt',
  5016: 'Tranzakció időtúllépés (elfogadói/acquirer oldal felől érkező kérés során)',
  5017: 'A tranzakció meg lett szakítva (elfogadói/acquirer oldal felől érkező kérés során)',
  5018: 'A tranzakció már kifizetésre került (így újabb művelet nem kezdeményezhető)',
  5020: 'A kérésben megadott érték vagy az eredeti tranzakcióösszeg ("originalTotal") ellenőrzése sikertelen',
  5021: 'A tranzakció már lezárásra került (így újabb Finish művelet nem kezdeményezhető)',
  5022: 'A tranzakció nem a kéréshez elvárt állapotban van',
  5023: 'Ismeretlen / nem megfelelő fiók devizanem',
  5025: 'Érvénytelen név',
  5026: 'Tranzakció letiltva (sikertelen fraud-vizsgálat következtében)',
  5027: 'Tranzakció zárolási probléma',
  5028: 'A tranzakció nem egyeztetett',
  5029: 'A tranzakció még nem került visszatérítésre',
  5030: 'A művelet nem engedélyezett',
  5033: 'Visszatérítési tranzakció törlése nem engedélyezett',
  
  // Stored card errors (5040s)
  5040: 'Tárolt kártya nem található',
  5041: 'Tárolt kártya lejárt',
  5042: 'Tárolt kártya inaktiválva',
  5043: 'Fantom tárolt kártya',
  5044: 'Recurring nincs engedélyezve',
  5045: 'Ismétlődő regisztrációhoz távoli azonosító szükséges',
  5046: 'Ismétlődő regisztrációhoz IDTS szükséges',
  5047: 'Ismétlődő IDTS',
  5048: 'Recurring until szükséges',
  5049: 'Recurring until eltér',
  5071: 'Tárolt kártya érvénytelen hossz',
  5072: 'Tárolt kártya érvénytelen művelet',
  
  // Recurring payment errors (5080s)
  5080: 'Eredeti azonosító eltérés az ismétlődő regisztrációnál',
  5081: 'Recurring token nem található',
  5082: 'Recurring token használatban',
  5083: 'Token times szükséges',
  5084: 'Token times túl nagy',
  5085: 'Token until szükséges',
  5086: 'Token until túl nagy',
  5087: 'Token maxAmount szükséges',
  5088: 'Token maxAmount túl nagy',
  5089: 'Recurring és oneclick regisztráció egyszerre nem indítható egy tranzakcióban',
  5090: 'Recurring token szükséges',
  5091: 'Recurring token inaktív',
  5092: 'Recurring token lejárt',
  5093: 'Recurring account eltérés',
  5094: 'Érvénytelen időtúllépés meghatározás',
  5095: 'Előre kiválasztott fizetési mód szükséges',
  
  // Refund errors (5110s)
  5110: 'Nem megfelelő visszatérítendő összeg',
  5111: 'Az orderRef és a transactionId közül az egyik küldése kötelező',
  5113: 'A hívó kliensprogram megnevezése, verziószáma ("sdkVersion") kötelező',
  
  // Validation errors (5200s)
  5201: 'A kereskedői fiók azonosítója ("merchant") hiányzik',
  5213: 'A kereskedői tranzakcióazonosító ("orderRef") hiányzik',
  5216: 'Érvénytelen szállítási összeg',
  5217: 'Érvénytelen módszer',
  5219: 'Email cím ("customerEmail") hiányzik, vagy nem email formátumú',
  5220: 'A tranzakció nyelve ("language") nem megfelelő',
  5223: 'A tranzakció pénzneme ("currency") nem megfelelő, vagy hiányzik',
  5226: 'Érvénytelen kommunikációs állapot',
  5227: 'Érvénytelen időtúllépés meghatározás',
  5228: 'Visszatérítési limit túllépve',
  5229: 'Visszatérítési határidő lejárt',
  5230: 'Visszatérítés nem engedélyezett',
  
  // Signature & security errors (5300s)
  5302: 'Nem megfelelő aláírás (signature) a beérkező kérésben. (A kereskedői API-ra érkező hívás aláírás-ellenőrzése sikertelen)',
  5303: 'Nem megfelelő aláírás (signature) a beérkező kérésben. (A kereskedői API-ra érkező hívás aláírás-ellenőrzése sikertelen)',
  5304: 'Időtúllépés miatt sikertelen hívás',
  5305: 'Sikertelen tranzakcióküldés a fizetési rendszer (elfogadói/acquirer oldal) felé',
  5306: 'Sikertelen tranzakciólétrehozás',
  5307: 'A kérésben megadott devizanem ("currency") nem egyezik a fiókhoz beállítottal',
  5308: 'A kérésben érkező kétlépcsős tranzakcióindítás nem engedélyezett a kereskedői fiókon',
  
  // Billing address validation errors (5309-5312)
  5309: 'Számlázási adatokban a címzett hiányzik ("name" természetes személy esetén, "company" jogi személy esetén)',
  5310: 'Számlázási adatokban a város kötelező',
  5311: 'Számlázási adatokban az irányítószám kötelező',
  5312: 'Számlázási adatokban a cím első sora kötelező',
  
  // Item validation errors (5313-5315)
  5313: 'A megvásárlandó termékek listájában ("items") a termék neve ("title") kötelező',
  5314: 'A megvásárlandó termékek listájában ("items") a termék egységára ("price") kötelező',
  5315: 'A megvásárlandó termékek listájában ("items") a rendelt mennyiség ("amount") kötelező pozitív egész szám',
  
  // Shipping address validation errors (5316-5319)
  5316: 'Szállítási adatokban a címzett kötelező ("name" természetes személy esetén, "company" jogi személy esetén)',
  5317: 'Szállítási adatokban a város kötelező',
  5318: 'Szállítási adatokban az irányítószám kötelező',
  5319: 'Szállítási adatokban a cím első sora kötelező',
  
  // Other validation errors (5320s+)
  5320: 'A hívó kliensprogram megnevezése, verziószáma ("sdkVersion") kötelező',
  5321: 'Formátumhiba / érvénytelen JSON string',
  5322: 'Érvénytelen ország',
  5323: 'Lezárás összege érvénytelen',
  5324: 'Termékek listája ("items"), vagy tranzakciófőösszeg ("total") szükséges',
  5325: 'Érvénytelen URL',
  5326: 'Hiányzó cardId',
  5327: 'Lekérdezendő kereskedői tranzakcióazonosítók ("orderRefs") maximális számának (50) túllépése',
  5328: 'Lekérdezendő SimplePay tranzakcióazonosítók ("transactionIds") maximális számának (50) túllépése',
  5329: 'Lekérdezendő tranzakcióindítás időszakában "from" az "until" időpontot meg kell előzze',
  5330: 'Lekérdezendő tranzakcióindítás időszakában "from" és "until" együttesen adandó meg',
  5331: 'Érvénytelen tranzakció forrás',
  5332: 'Tranzakció azonosítója és célpontja szükséges',
  5333: 'Hiányzó tranzakció azonosító',
  5334: 'Bankkártya adatok szükségesek',
  5335: 'Bankkártya BIN szükséges',
  5336: 'Csalásellenes hash szükséges',
  5337: 'Hiba összetett adat szöveges formába írásakor',
  5338: 'Acquirer tranzakció azonosítója szükséges',
  5339: 'Lekérdezendő tranzakciókhoz tartozóan vagy az indítás időszaka ("from" és "until") vagy az azonosítólista ("orderRefs" vagy "transactionIds") megadandó',
  5340: 'A tranzakció nem tárcához kötött',
  5341: 'Partner opció szükséges',
  5342: 'Partner számlák szükségesek',
  5343: 'Nem megfelelő tranzakcióstátusz',
  5344: 'Nem megfelelő tranzakcióstátusz',
  5345: 'Áfa összege kisebb, mint 0',
  5346: 'Érvénytelen tranzakciós mód',
  5347: 'Érvénytelen Auchan részletfizetés',
  5348: 'JWT szükséges',
  5349: 'A tranzakció nem engedélyezett az elszámoló fiókon (AMEX, TSP)',
  5350: 'Érvénytelen email',
  5351: 'Érvénytelen nap',
  5352: 'Simple business fiók hiba / nem létező fiók',
  5353: 'Érvénytelen kezdő és záró paraméterek',
  5354: 'Érvénytelen eszközazonosító',
  5355: 'Nem SoftPOS számla',
  5356: 'Érvénytelen sablon',
  5357: 'Érvénytelen rendelési hivatkozás',
  5358: 'Érvénytelen időszak',
  5359: 'SoftPOS nem elérhető',
  5360: 'A tranzakció távoli hozzárendelése sikertelen',
  5361: 'A tranzakció távoli törlése sikertelen',
  5362: 'A tranzakció távoli lejáratának beállítása sikertelen',
  5363: 'Eredeti tranzakció szükséges',
  5364: 'Érvénytelen további információ',
  5370: 'Érvénytelen termékár',
  5371: 'Érvénytelen termékmennyiség',
  5380: 'E-mail paraméterek szükségesek',
  5381: 'E-mail típus szükséges',
  5382: 'Ügyfél e-mail címe szükséges',
  
  // Transaction state errors (5400s)
  5401: 'Érvénytelen salt, nem 32-64 hosszú',
  5402: 'Tranzakció alapja szükséges',
  5403: 'Simple tranzakció a fizetés alatt',
  5404: 'Érvénytelen tranzakció állapot',
  5405: 'A tranzakció nem CDE munkamenetben van',
  5413: 'Létrejött utalási tranzakció',
  
  // Browser validation errors (5500s)
  5501: 'Böngésző accept kötelező',
  5502: 'Böngésző agent kötelező',
  5503: 'Böngésző ip kötelező',
  5504: 'Böngésző java kötelező',
  5505: 'Böngésző nyelv kötelező',
  5506: 'Böngésző szín kötelező',
  5507: 'Böngésző magasság kötelező',
  5508: 'Böngésző szélesség kötelező',
  5509: 'Böngésző tz kötelező',
  5530: 'Érvénytelen type',
  
  // General validation errors (5600s)
  5601: 'Érvénytelen azonosító kód / Tranzakció limit túllépve',
  5602: 'Érvénytelen üzenet',
  5603: 'Érvénytelen tranzakciós helyzet',
  5604: 'Érvénytelen kiskereskedelmi adatok',
  5605: 'Érvénytelen eszköz',
  5606: 'Érvénytelen számlaazonosító',
  5607: 'Érvénytelen ügyfél adatok',
  5608: 'Érvénytelen ellenőrző kód / Túl nagy adatmennyiség',
  
  // Payment method specific errors (5700s)
  5700: 'Hiányzó sikeres hitelesítési kommunikáció',
  5701: 'Ajánlás már elküldve',
  5702: 'Hiányzó részletfizetési adat',
  5703: 'Érvénytelen opció index',
  5704: 'Tartomány választás nem elérhető',
  5705: 'Teljes összegű fizetés nem elérhető',
  5706: 'Hiba az acquiring hívás során',
  5707: 'Részletfizetési adat értelmezési hiba',
  5708: 'Érvénytelen részletfizetési szám',
  5709: 'Hiányzó részletfizetési opció',
  5710: 'Hiányzó sikeres ajánlási kommunikáció',
  5711: 'Elszámolószámla-azonosító szükséges',
  5712: 'Sorozat méret szükséges',
  
  // Card type errors (5800s)
  5812: 'Érvénytelen kártyatípus',
  5813: 'Kártya / tranzakció elutasítva',
  
  // Mobile app errors (5900s)
  5900: 'Érvénytelen alkalmazás platform',
  5901: 'Érvénytelen időbélyeg',
  5902: 'Mobilalkalmazás nem található',
  5903: 'Deeplink adatcsomag nem található',
  5904: 'Platform vagy belső azonosítók szükségesek',
  5905: 'Visszatérő URL-ek szükségesek',
  5906: 'Több visszatérő URL megadva',
  
  // RTP (Real-Time Payment) errors (6100s)
  6100: 'RTP (Real-Time Payment) nem engedélyezett',
  6101: 'Érvénytelen csomag hivatkozás',
  6102: 'Érvénytelen rendelési hivatkozás',
  6103: 'Érvénytelen teljes összeg',
  6104: 'Érvénytelen pénznem',
  6105: 'Ügyfél szükséges',
  6106: 'Szükséges az ügyfél e-mail címe vagy bankszámlaszáma',
  6107: 'Érvénytelen ügyfél e-mail cím',
  6108: 'Érvénytelen ügyfél bankszámlaszám',
  6109: 'Érvénytelen ismétlődő idők',
  6110: 'Szükséges az ismétlődés időtartama',
  6111: 'Az ismétlődés időtartama túllépve',
  6112: 'Érvénytelen ismétlődő nap',
  6113: 'Érvénytelen ismétlődő intervallum',
  6114: 'Üres fizetések',
  6115: 'Érvénytelen fizetési eredmény',
  6116: 'Érvénytelen kereskedő',
  6117: 'Szükséges az SDK verziója',
  6118: 'A tranzakció már létezik',
  6119: 'Érvénytelen nyelv',
  6120: 'Érvénytelen tranzakciós állapot',
  6121: 'Érvénytelen csomag vagy rendelési hivatkozás',
  6122: 'Érvénytelen lekérdezési paraméterek',
  6123: 'Rendelési azonosító méret túllépés',
  6124: 'A kezdő dátum az záró dátum után van',
  6125: 'Kezdő és záró dátum együtt szükséges',
  6126: 'Hiányzó RTP azonosító',
  6127: 'Érvénytelen állapot',
  6128: 'Érvénytelen határidő',
  6129: 'Lekérdezéshez rendelési hivatkozás vagy tranzakció azonosító szükséges',
  6130: 'Giro hiba',
  6131: 'A tranzakció nem létezik',
  6132: 'Ügyfél vagy bankszámla szükséges',
  6133: 'Túl hosszú közlemény',
  6134: 'A bankszámla már be van állítva',
  6135: 'Tranzakciók számának túllépése',
  
  // RTP transaction states (6140s)
  6140: 'Tranzakció inicializálása',
  6141: 'Várakozás a bankszámla adatokra',
  6142: 'A tranzakció elküldésre kész',
  6143: 'A tranzakció elküldve',
  6144: 'A tranzakció fogadva',
  6145: 'A tranzakció elfogadva',
  6146: 'A tranzakció elutasítva',
  6147: 'A tranzakció lejárt',
  6148: 'A tranzakció visszafordítva',
  6149: 'Sikertelen tranzakció',
  6150: 'Változtathatatlan tranzakció',
  6151: 'Fizetett tranzakció',
  6153: 'Tranzakció nem található',
  6154: 'Tranzakció végállapotban',
  6155: 'Érvénytelen partner bankszámla',
  6156: 'Visszafordítás folyamatban',
  6157: 'Tranzakciók szükségesek',
  
  // Final error
  6999: 'Általános hiba',
} as const;

// Type definitions
export type SimplePayErrorCode = keyof typeof SIMPLEPAY_ERROR_CODES;

export interface SimplePayError {
  code: SimplePayErrorCode;
  message: string;
  timestamp?: string;
  transactionId?: string;
  orderRef?: string;
}

// Helper functions
export const getSimplePayErrorMessage = (code: SimplePayErrorCode): string => SIMPLEPAY_ERROR_CODES[code] || 'Ismeretlen hiba';

export const isSimplePayErrorCode = (code: number): code is SimplePayErrorCode => code in SIMPLEPAY_ERROR_CODES;

export const createSimplePayError = (
  code: SimplePayErrorCode,
  options?: {
    transactionId?: string;
    orderRef?: string;
    timestamp?: string;
  }
): SimplePayError => ({
    code,
    message: getSimplePayErrorMessage(code),
    timestamp: options?.timestamp || new Date().toISOString(),
    transactionId: options?.transactionId,
    orderRef: options?.orderRef,
  });

// Error categories for easier handling
export const SIMPLEPAY_ERROR_CATEGORIES = {
  GENERAL: [999, 1529, 2004, 5000] as const,
  AUTHENTICATION: [2003, 2006, 2008, 2014] as const,
  CARD_RELATED: [2013, 2063, 2064, 2066, 2071, 2072, 2073, 2074, 2078] as const,
  TRANSACTION_STATE: [5011, 5013, 5014, 5015, 5016, 5017, 5018, 5021, 5022] as const,
  VALIDATION: [5201, 5213, 5216, 5217, 5219, 5220, 5223, 5321, 5322] as const,
  BILLING_ADDRESS: [5309, 5310, 5311, 5312] as const,
  SHIPPING_ADDRESS: [5316, 5317, 5318, 5319] as const,
  ITEMS: [5313, 5314, 5315] as const,
  SIGNATURE: [5302, 5303] as const,
  STORED_CARD: [5040, 5041, 5042, 5043] as const,
  RECURRING: [5044, 5045, 5046, 5047, 5048, 5049, 5080, 5081, 5082, 5083, 5084, 5085, 5086, 5087, 5088, 5089, 5090, 5091, 5092, 5093] as const,
  THREEDS: [3002, 3003, 3004, 3012, 3013] as const,
  RTP: [6100, 6101, 6102, 6103, 6104, 6105, 6106, 6107, 6108, 6109, 6110, 6111, 6112, 6113, 6114, 6115, 6116, 6117, 6118, 6119, 6120, 6121, 6122, 6123, 6124, 6125, 6126, 6127, 6128, 6129, 6130, 6131, 6132, 6133, 6134, 6135, 6999] as const,
} as const;

export type SimplePayErrorCategory = keyof typeof SIMPLEPAY_ERROR_CATEGORIES;

export const getErrorCategory = (code: SimplePayErrorCode): SimplePayErrorCategory | 'UNKNOWN' => {
  for (const [category, codes] of Object.entries(SIMPLEPAY_ERROR_CATEGORIES) as Array<[SimplePayErrorCategory, readonly number[]]>) {
    if (codes.includes(Number(code))) {
      return category;
    }
  }
  return 'UNKNOWN';
};