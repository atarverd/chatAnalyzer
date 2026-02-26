export type Country = {
  code: string;
  flag: string;
  /** Length of national phone number (digits without country code). */
  phoneLength?: number;
  iso2:
    | 'AL'
    | 'AD'
    | 'BY'
    | 'BE'
    | 'BR'
    | 'US'
    | 'RU'
    | 'FR'
    | 'ES'
    | 'IT'
    | 'GB'
    | 'DE'
    | 'MX'
    | 'AU'
    | 'JP'
    | 'KR'
    | 'CN'
    | 'IN'
    | 'UA'
    | 'KZ'
    | 'UZ'
    | 'KG'
    | 'TJ'
    | 'TM'
    | 'AM'
    | 'GE'
    | 'AZ'
    | 'TR'
    | 'AE'
    | 'SA'
    | 'EG'
    | 'ZA'
    | 'NG'
    | 'KE'
    | 'MA'
    | 'DZ'
    | 'TN'
    | 'LY'
    | 'SD'
    | 'ET'
    | 'TZ'
    | 'UG'
    | 'ZM'
    | 'ZW'
    | 'MW'
    | 'BW'
    | 'SZ'
    | 'KM'
    | 'SH'
    | 'ER'
    | 'AW'
    | 'FO'
    | 'GL'
    | 'GI'
    | 'PT'
    | 'LU'
    | 'IE'
    | 'IS'
    | 'MT'
    | 'CY'
    | 'FI'
    | 'BG'
    | 'LT'
    | 'LV'
    | 'EE'
    | 'MD'
    | 'RS'
    | 'ME'
    | 'XK'
    | 'HR'
    | 'SI'
    | 'BA'
    | 'MK'
    | 'CZ'
    | 'SK'
    | 'LI'
    | 'PL'
    | 'GR'
    | 'NL'
    | 'CH'
    | 'AT'
    | 'DK'
    | 'SE'
    | 'NO'
    | 'NZ'
    | 'SG'
    | 'TH'
    | 'VN'
    | 'MY'
    | 'ID'
    | 'PH'
    | 'PK'
    | 'BD'
    | 'LK'
    | 'MM'
    | 'IR'
    | 'LB'
    | 'JO'
    | 'SY'
    | 'IQ'
    | 'KW'
    | 'OM'
    | 'PS'
    | 'IL'
    | 'BH'
    | 'QA'
    | 'MN'
    | 'NP';
  nameEn: string;
  nameRu: string;
};

/** National phone number length (digits) per country. Used when not on Country.phoneLength. */
const DEFAULT_PHONE_LENGTH = 10;
const PHONE_LENGTH_BY_ISO2: Partial<Record<string, number>> = {
  AL: 9,
  AD: 6,
  BY: 9,
  BE: 9,
  BR: 11,
  US: 10,
  RU: 10,
  FR: 9,
  ES: 9,
  IT: 10,
  GB: 10,
  DE: 10,
  MX: 10,
  AU: 9,
  JP: 10,
  KR: 9,
  CN: 11,
  IN: 10,
  UA: 9,
  KZ: 10,
  UZ: 9,
  KG: 9,
  TJ: 9,
  TM: 8,
  AM: 8,
  GE: 9,
  AZ: 9,
  TR: 10,
  AE: 9,
  SA: 9,
  EG: 10,
  ZA: 9,
  NG: 10,
  KE: 9,
  MA: 9,
  DZ: 9,
  TN: 8,
  LY: 10,
  SD: 9,
  ET: 9,
  TZ: 9,
  UG: 9,
  ZM: 9,
  ZW: 9,
  MW: 9,
  BW: 7,
  SZ: 8,
  KM: 7,
  PT: 9,
  LU: 9,
  IE: 9,
  IS: 7,
  MT: 8,
  CY: 8,
  FI: 9,
  BG: 9,
  LT: 8,
  LV: 8,
  EE: 8,
  MD: 8,
  RS: 9,
  ME: 8,
  XK: 8,
  HR: 8,
  SI: 8,
  BA: 8,
  MK: 8,
  CZ: 9,
  SK: 9,
  LI: 7,
  PL: 9,
  GR: 10,
  NL: 9,
  CH: 9,
  AT: 10,
  DK: 8,
  SE: 9,
  NO: 8,
  NZ: 9,
  SG: 8,
  TH: 9,
  VN: 9,
  MY: 9,
  ID: 10,
  PH: 10,
  PK: 10,
  BD: 10,
  LK: 9,
  MM: 9,
  IR: 10,
  LB: 8,
  JO: 9,
  SY: 9,
  IQ: 10,
  KW: 8,
  OM: 8,
  PS: 9,
  IL: 9,
  BH: 8,
  QA: 8,
  MN: 8,
  NP: 10,
  GI: 8,
  FO: 6,
  GL: 6,
  ER: 7,
  AW: 7,
  SH: 4,
};

export function getCountryPhoneLength(country: Country): number {
  return (
    country.phoneLength ??
    PHONE_LENGTH_BY_ISO2[country.iso2] ??
    DEFAULT_PHONE_LENGTH
  );
}

/** Digit group lengths for display (e.g. RU [3,3,2,2] → 912 345 67 89). */
const PHONE_FORMAT_BY_ISO2: Record<string, number[]> = {
  // 🇷🇺 🇰🇿 — fixed-line & mobile identical length
  RU: [3, 3, 2, 2], // 999 999 99 99
  KZ: [3, 3, 2, 2], // 777 777 77 77

  // 🇺🇸 🇨🇦
  US: [3, 3, 4], // 415 555 2671
  CA: [3, 3, 4],

  // 🇬🇧 — mobile only (07xxx)
  GB: [5, 6], // 07400 123456

  // 🇩🇪 — mobile average (varies heavily)
  DE: [3, 3, 4], // 151 234 5678

  // 🇫🇷
  FR: [1, 2, 2, 2, 2], // 6 12 34 56 78

  // 🇪🇸 🇵🇱 🇳🇱 🇵🇹 🇨🇿 🇸🇰
  ES: [3, 3, 3],
  PL: [3, 3, 3],
  NL: [3, 3, 3],
  PT: [3, 3, 3],
  CZ: [3, 3, 3],
  SK: [3, 3, 3],

  // 🇮🇹 — mobile (leading 3xx)
  IT: [3, 3, 4], // 333 123 4567

  // 🇺🇦 🇧🇾 🇦🇿 🇺🇿
  UA: [2, 3, 2, 2], // 50 123 45 67
  BY: [2, 3, 2, 2],
  AZ: [2, 3, 2, 2],
  UZ: [2, 3, 2, 2],

  // 🇹🇷
  TR: [3, 3, 2, 2], // 532 123 45 67

  // 🇮🇳
  IN: [5, 5], // 98765 43210

  // 🇨🇳
  CN: [3, 4, 4], // 138 0013 8000

  // 🇯🇵 — mobile
  JP: [3, 4, 4], // 090 1234 5678

  // 🇰🇷
  KR: [3, 4, 4], // 010 1234 5678

  // 🇦🇺
  AU: [3, 3, 3], // 412 345 678

  // 🇧🇷 — mobile (11 digits)
  BR: [2, 5, 4], // 11 91234 5678

  // 🇲🇽
  MX: [3, 3, 4],

  // 🇪🇬 🇿🇦
  EG: [3, 3, 4],
  ZA: [3, 3, 4],

  // 🇦🇪 🇸🇦 🇮🇱
  AE: [3, 3, 3],
  SA: [3, 3, 3],
  IL: [3, 3, 3],

  // 🇵🇰 🇧🇩
  PK: [3, 4, 3], // 300 123 4567
  BD: [4, 3, 3], // 0171 234 567

  // 🇰🇬 🇹🇯 🇦🇲 🇬🇪
  KG: [3, 3, 3], // 700 123 456
  TJ: [3, 3, 3],
  AM: [2, 3, 3], // 91 123 456
  GE: [3, 3, 3],

  // 🇦🇹 🇨🇭 🇸🇪 🇫🇮 🇬🇷 🇷🇴 🇭🇺
  AT: [3, 3, 4],
  CH: [2, 3, 2, 2],
  SE: [2, 3, 2, 2],
  FI: [2, 3, 2, 2],
  GR: [3, 3, 4],
  RO: [3, 3, 3],
  HU: [2, 3, 4],

  // 🇦🇱 🇦🇩 🇧🇪
  AL: [3, 3, 3],
  AD: [2, 2, 2],
  BE: [3, 2, 2, 2],

  // 🇹🇲
  TM: [2, 2, 2, 2],

  // 🇳🇬 🇰🇪 🇲🇦 🇩🇿 🇹🇳 🇱🇾 🇸🇩
  NG: [3, 3, 4],
  KE: [3, 3, 3],
  MA: [2, 2, 2, 3],
  DZ: [2, 2, 2, 3],
  TN: [2, 2, 2, 2],
  LY: [3, 3, 4],
  SD: [2, 3, 4],

  // 🇪🇹 🇹🇿 🇺🇬 🇿🇲 🇿🇼 🇲🇼 🇧🇼 🇸🇿 🇰🇲
  ET: [3, 3, 3],
  TZ: [3, 3, 3],
  UG: [3, 3, 3],
  ZM: [3, 3, 3],
  ZW: [3, 3, 3],
  MW: [3, 3, 3],
  BW: [3, 2, 2],
  SZ: [2, 3, 3],
  KM: [2, 2, 3],

  // 🇱🇺 🇮🇪 🇮🇸 🇲🇹 🇨🇾 🇧🇬
  LU: [3, 3, 3],
  IE: [2, 3, 4],
  IS: [3, 4],
  MT: [4, 4],
  CY: [2, 3, 3],
  BG: [3, 3, 3],

  // 🇱🇹 🇱🇻 🇪🇪 🇲🇩
  LT: [3, 2, 3],
  LV: [2, 3, 3],
  EE: [3, 3, 2],
  MD: [2, 2, 2, 2],

  // 🇷🇸 🇲🇪 🇽🇰 🇭🇷 🇸🇮 🇧🇦 🇲🇰 🇱🇮
  RS: [2, 3, 2, 2],
  ME: [2, 2, 2, 2],
  XK: [2, 2, 2, 2],
  HR: [2, 2, 2, 2],
  SI: [2, 3, 3],
  BA: [2, 2, 2, 2],
  MK: [2, 2, 2, 2],
  LI: [3, 2, 2],

  // 🇩🇰 🇳🇴 🇳🇿
  DK: [2, 2, 2, 2],
  NO: [2, 2, 2, 2],
  NZ: [2, 3, 4],

  // 🇸🇬 🇹🇭 🇻🇳 🇲🇾 🇮🇩 🇵🇭
  SG: [4, 4],
  TH: [3, 3, 3],
  VN: [3, 3, 3],
  MY: [2, 3, 4],
  ID: [3, 4, 3],
  PH: [3, 3, 4],

  // 🇱🇰 🇲🇲 🇮🇷 🇱🇧 🇯🇴 🇸🇾 🇮🇶 🇰🇼 🇴🇲 🇵🇸 🇧🇭 🇶🇦 🇲🇳 🇳🇵
  LK: [2, 3, 4],
  MM: [2, 3, 4],
  IR: [3, 3, 4],
  LB: [2, 2, 2, 2],
  JO: [3, 3, 3],
  SY: [2, 3, 4],
  IQ: [3, 3, 4],
  KW: [4, 4],
  OM: [4, 4],
  PS: [3, 3, 3],
  BH: [4, 4],
  QA: [4, 4],
  MN: [4, 4],
  NP: [2, 2, 2, 4],

  // 🇬🇮 🇫🇴 🇬🇱 🇪🇷 🇦🇼 🇸🇭
  GI: [5, 3],
  FO: [3, 3],
  GL: [2, 2, 2],
  ER: [2, 2, 3],
  AW: [3, 4],
  SH: [4],
};

/** Format national digits for display using country's group pattern. */
export function formatPhoneForDisplay(
  countryCode: string,
  nationalDigits: string,
  iso2?: string,
): string {
  const digits = nationalDigits.replace(/\D/g, '');
  if (!digits.length) return `${countryCode} ${nationalDigits}`;
  const groups = iso2 ? PHONE_FORMAT_BY_ISO2[iso2] : undefined;
  if (!groups || groups.length === 0) {
    return `${countryCode} ${digits}`;
  }
  let i = 0;
  const parts: string[] = [];
  for (const len of groups) {
    if (i >= digits.length) break;
    parts.push(digits.slice(i, i + len));
    i += len;
  }
  if (i < digits.length) parts.push(digits.slice(i));
  return `${countryCode} ${parts.join(' ')}`;
}

/** Format only national digits (no country code) for use in input display. */
export function formatNationalForDisplay(
  nationalDigits: string,
  iso2?: string,
): string {
  const digits = nationalDigits.replace(/\D/g, '');
  if (!digits.length) return nationalDigits;
  const groups = iso2 ? PHONE_FORMAT_BY_ISO2[iso2] : undefined;
  if (!groups || groups.length === 0) return digits;
  let i = 0;
  const parts: string[] = [];
  for (const len of groups) {
    if (i >= digits.length) break;
    parts.push(digits.slice(i, i + len));
    i += len;
  }
  if (i < digits.length) parts.push(digits.slice(i));
  return parts.join(' ');
}

const RAW_COUNTRIES: Country[] = [
  {
    code: '+355',
    flag: '🇦🇱',
    iso2: 'AL',
    nameEn: 'Albania',
    nameRu: 'Албания',
  },
  {
    code: '+376',
    flag: '🇦🇩',
    iso2: 'AD',
    nameEn: 'Andorra',
    nameRu: 'Андорра',
  },
  {
    code: '+375',
    flag: '🇧🇾',
    iso2: 'BY',
    nameEn: 'Belarus',
    nameRu: 'Беларусь',
  },
  { code: '+32', flag: '🇧🇪', iso2: 'BE', nameEn: 'Belgium', nameRu: 'Бельгия' },
  { code: '+55', flag: '🇧🇷', iso2: 'BR', nameEn: 'Brazil', nameRu: 'Бразилия' },
  {
    code: '+1',
    flag: '🇺🇸',
    iso2: 'US',
    nameEn: 'United States',
    nameRu: 'США',
  },
  { code: '+7', flag: '🇷🇺', iso2: 'RU', nameEn: 'Russia', nameRu: 'Россия' },
  { code: '+33', flag: '🇫🇷', iso2: 'FR', nameEn: 'France', nameRu: 'Франция' },
  { code: '+34', flag: '🇪🇸', iso2: 'ES', nameEn: 'Spain', nameRu: 'Испания' },
  { code: '+39', flag: '🇮🇹', iso2: 'IT', nameEn: 'Italy', nameRu: 'Италия' },
  {
    code: '+44',
    flag: '🇬🇧',
    iso2: 'GB',
    nameEn: 'United Kingdom',
    nameRu: 'Великобритания',
  },
  {
    code: '+49',
    flag: '🇩🇪',
    iso2: 'DE',
    nameEn: 'Germany',
    nameRu: 'Германия',
  },
  { code: '+52', flag: '🇲🇽', iso2: 'MX', nameEn: 'Mexico', nameRu: 'Мексика' },
  {
    code: '+61',
    flag: '🇦🇺',
    iso2: 'AU',
    nameEn: 'Australia',
    nameRu: 'Австралия',
  },
  { code: '+81', flag: '🇯🇵', iso2: 'JP', nameEn: 'Japan', nameRu: 'Япония' },
  {
    code: '+82',
    flag: '🇰🇷',
    iso2: 'KR',
    nameEn: 'South Korea',
    nameRu: 'Южная Корея',
  },
  { code: '+86', flag: '🇨🇳', iso2: 'CN', nameEn: 'China', nameRu: 'Китай' },
  { code: '+91', flag: '🇮🇳', iso2: 'IN', nameEn: 'India', nameRu: 'Индия' },
  {
    code: '+380',
    flag: '🇺🇦',
    iso2: 'UA',
    nameEn: 'Ukraine',
    nameRu: 'Украина',
  },
  {
    code: '+7',
    flag: '🇰🇿',
    iso2: 'KZ',
    nameEn: 'Kazakhstan',
    nameRu: 'Казахстан',
  },
  {
    code: '+998',
    flag: '🇺🇿',
    iso2: 'UZ',
    nameEn: 'Uzbekistan',
    nameRu: 'Узбекистан',
  },
  {
    code: '+996',
    flag: '🇰🇬',
    iso2: 'KG',
    nameEn: 'Kyrgyzstan',
    nameRu: 'Кыргызстан',
  },
  {
    code: '+992',
    flag: '🇹🇯',
    iso2: 'TJ',
    nameEn: 'Tajikistan',
    nameRu: 'Таджикистан',
  },
  {
    code: '+993',
    flag: '🇹🇲',
    iso2: 'TM',
    nameEn: 'Turkmenistan',
    nameRu: 'Туркменистан',
  },
  {
    code: '+374',
    flag: '🇦🇲',
    iso2: 'AM',
    nameEn: 'Armenia',
    nameRu: 'Армения',
  },
  { code: '+995', flag: '🇬🇪', iso2: 'GE', nameEn: 'Georgia', nameRu: 'Грузия' },
  {
    code: '+994',
    flag: '🇦🇿',
    iso2: 'AZ',
    nameEn: 'Azerbaijan',
    nameRu: 'Азербайджан',
  },
  { code: '+90', flag: '🇹🇷', iso2: 'TR', nameEn: 'Turkey', nameRu: 'Турция' },
  { code: '+971', flag: '🇦🇪', iso2: 'AE', nameEn: 'UAE', nameRu: 'ОАЭ' },
  {
    code: '+966',
    flag: '🇸🇦',
    iso2: 'SA',
    nameEn: 'Saudi Arabia',
    nameRu: 'Саудовская Аравия',
  },
  { code: '+20', flag: '🇪🇬', iso2: 'EG', nameEn: 'Egypt', nameRu: 'Египет' },
  {
    code: '+27',
    flag: '🇿🇦',
    iso2: 'ZA',
    nameEn: 'South Africa',
    nameRu: 'ЮАР',
  },
  {
    code: '+234',
    flag: '🇳🇬',
    iso2: 'NG',
    nameEn: 'Nigeria',
    nameRu: 'Нигерия',
  },
  { code: '+254', flag: '🇰🇪', iso2: 'KE', nameEn: 'Kenya', nameRu: 'Кения' },
  {
    code: '+212',
    flag: '🇲🇦',
    iso2: 'MA',
    nameEn: 'Morocco',
    nameRu: 'Марокко',
  },
  { code: '+213', flag: '🇩🇿', iso2: 'DZ', nameEn: 'Algeria', nameRu: 'Алжир' },
  { code: '+216', flag: '🇹🇳', iso2: 'TN', nameEn: 'Tunisia', nameRu: 'Тунис' },
  { code: '+218', flag: '🇱🇾', iso2: 'LY', nameEn: 'Libya', nameRu: 'Ливия' },
  { code: '+249', flag: '🇸🇩', iso2: 'SD', nameEn: 'Sudan', nameRu: 'Судан' },
  {
    code: '+251',
    flag: '🇪🇹',
    iso2: 'ET',
    nameEn: 'Ethiopia',
    nameRu: 'Эфиопия',
  },
  {
    code: '+255',
    flag: '🇹🇿',
    iso2: 'TZ',
    nameEn: 'Tanzania',
    nameRu: 'Танзания',
  },
  { code: '+256', flag: '🇺🇬', iso2: 'UG', nameEn: 'Uganda', nameRu: 'Уганда' },
  { code: '+260', flag: '🇿🇲', iso2: 'ZM', nameEn: 'Zambia', nameRu: 'Замбия' },
  {
    code: '+263',
    flag: '🇿🇼',
    iso2: 'ZW',
    nameEn: 'Zimbabwe',
    nameRu: 'Зимбабве',
  },
  { code: '+265', flag: '🇲🇼', iso2: 'MW', nameEn: 'Malawi', nameRu: 'Малави' },
  {
    code: '+267',
    flag: '🇧🇼',
    iso2: 'BW',
    nameEn: 'Botswana',
    nameRu: 'Ботсвана',
  },
  {
    code: '+268',
    flag: '🇸🇿',
    iso2: 'SZ',
    nameEn: 'Eswatini',
    nameRu: 'Эсватини',
  },
  { code: '+269', flag: '🇰🇲', iso2: 'KM', nameEn: 'Comoros', nameRu: 'Коморы' },
  {
    code: '+290',
    flag: '🇸🇭',
    iso2: 'SH',
    nameEn: 'Saint Helena',
    nameRu: 'Остров Святой Елены',
  },
  {
    code: '+291',
    flag: '🇪🇷',
    iso2: 'ER',
    nameEn: 'Eritrea',
    nameRu: 'Эритрея',
  },
  { code: '+297', flag: '🇦🇼', iso2: 'AW', nameEn: 'Aruba', nameRu: 'Аруба' },
  {
    code: '+298',
    flag: '🇫🇴',
    iso2: 'FO',
    nameEn: 'Faroe Islands',
    nameRu: 'Фарерские острова',
  },
  {
    code: '+299',
    flag: '🇬🇱',
    iso2: 'GL',
    nameEn: 'Greenland',
    nameRu: 'Гренландия',
  },
  {
    code: '+350',
    flag: '🇬🇮',
    iso2: 'GI',
    nameEn: 'Gibraltar',
    nameRu: 'Гибралтар',
  },
  {
    code: '+351',
    flag: '🇵🇹',
    iso2: 'PT',
    nameEn: 'Portugal',
    nameRu: 'Португалия',
  },
  {
    code: '+352',
    flag: '🇱🇺',
    iso2: 'LU',
    nameEn: 'Luxembourg',
    nameRu: 'Люксембург',
  },
  {
    code: '+353',
    flag: '🇮🇪',
    iso2: 'IE',
    nameEn: 'Ireland',
    nameRu: 'Ирландия',
  },
  {
    code: '+354',
    flag: '🇮🇸',
    iso2: 'IS',
    nameEn: 'Iceland',
    nameRu: 'Исландия',
  },
  { code: '+356', flag: '🇲🇹', iso2: 'MT', nameEn: 'Malta', nameRu: 'Мальта' },
  { code: '+357', flag: '🇨🇾', iso2: 'CY', nameEn: 'Cyprus', nameRu: 'Кипр' },
  {
    code: '+358',
    flag: '🇫🇮',
    iso2: 'FI',
    nameEn: 'Finland',
    nameRu: 'Финляндия',
  },
  {
    code: '+359',
    flag: '🇧🇬',
    iso2: 'BG',
    nameEn: 'Bulgaria',
    nameRu: 'Болгария',
  },
  {
    code: '+370',
    flag: '🇱🇹',
    iso2: 'LT',
    nameEn: 'Lithuania',
    nameRu: 'Литва',
  },
  { code: '+371', flag: '🇱🇻', iso2: 'LV', nameEn: 'Latvia', nameRu: 'Латвия' },
  {
    code: '+372',
    flag: '🇪🇪',
    iso2: 'EE',
    nameEn: 'Estonia',
    nameRu: 'Эстония',
  },
  {
    code: '+373',
    flag: '🇲🇩',
    iso2: 'MD',
    nameEn: 'Moldova',
    nameRu: 'Молдова',
  },
  { code: '+381', flag: '🇷🇸', iso2: 'RS', nameEn: 'Serbia', nameRu: 'Сербия' },
  {
    code: '+382',
    flag: '🇲🇪',
    iso2: 'ME',
    nameEn: 'Montenegro',
    nameRu: 'Черногория',
  },
  { code: '+383', flag: '🇽🇰', iso2: 'XK', nameEn: 'Kosovo', nameRu: 'Косово' },
  {
    code: '+385',
    flag: '🇭🇷',
    iso2: 'HR',
    nameEn: 'Croatia',
    nameRu: 'Хорватия',
  },
  {
    code: '+386',
    flag: '🇸🇮',
    iso2: 'SI',
    nameEn: 'Slovenia',
    nameRu: 'Словения',
  },
  { code: '+387', flag: '🇧🇦', iso2: 'BA', nameEn: 'Bosnia', nameRu: 'Босния' },
  {
    code: '+389',
    flag: '🇲🇰',
    iso2: 'MK',
    nameEn: 'North Macedonia',
    nameRu: 'Северная Македония',
  },
  {
    code: '+420',
    flag: '🇨🇿',
    iso2: 'CZ',
    nameEn: 'Czech Republic',
    nameRu: 'Чехия',
  },
  {
    code: '+421',
    flag: '🇸🇰',
    iso2: 'SK',
    nameEn: 'Slovakia',
    nameRu: 'Словакия',
  },
  {
    code: '+423',
    flag: '🇱🇮',
    iso2: 'LI',
    nameEn: 'Liechtenstein',
    nameRu: 'Лихтенштейн',
  },
  { code: '+48', flag: '🇵🇱', iso2: 'PL', nameEn: 'Poland', nameRu: 'Польша' },
  { code: '+30', flag: '🇬🇷', iso2: 'GR', nameEn: 'Greece', nameRu: 'Греция' },
  {
    code: '+31',
    flag: '🇳🇱',
    iso2: 'NL',
    nameEn: 'Netherlands',
    nameRu: 'Нидерланды',
  },
  {
    code: '+41',
    flag: '🇨🇭',
    iso2: 'CH',
    nameEn: 'Switzerland',
    nameRu: 'Швейцария',
  },
  { code: '+43', flag: '🇦🇹', iso2: 'AT', nameEn: 'Austria', nameRu: 'Австрия' },
  { code: '+45', flag: '🇩🇰', iso2: 'DK', nameEn: 'Denmark', nameRu: 'Дания' },
  { code: '+46', flag: '🇸🇪', iso2: 'SE', nameEn: 'Sweden', nameRu: 'Швеция' },
  { code: '+47', flag: '🇳🇴', iso2: 'NO', nameEn: 'Norway', nameRu: 'Норвегия' },
  {
    code: '+64',
    flag: '🇳🇿',
    iso2: 'NZ',
    nameEn: 'New Zealand',
    nameRu: 'Новая Зеландия',
  },
  {
    code: '+65',
    flag: '🇸🇬',
    iso2: 'SG',
    nameEn: 'Singapore',
    nameRu: 'Сингапур',
  },
  {
    code: '+66',
    flag: '🇹🇭',
    iso2: 'TH',
    nameEn: 'Thailand',
    nameRu: 'Таиланд',
  },
  { code: '+84', flag: '🇻🇳', iso2: 'VN', nameEn: 'Vietnam', nameRu: 'Вьетнам' },
  {
    code: '+60',
    flag: '🇲🇾',
    iso2: 'MY',
    nameEn: 'Malaysia',
    nameRu: 'Малайзия',
  },
  {
    code: '+62',
    flag: '🇮🇩',
    iso2: 'ID',
    nameEn: 'Indonesia',
    nameRu: 'Индонезия',
  },
  {
    code: '+63',
    flag: '🇵🇭',
    iso2: 'PH',
    nameEn: 'Philippines',
    nameRu: 'Филиппины',
  },
  {
    code: '+92',
    flag: '🇵🇰',
    iso2: 'PK',
    nameEn: 'Pakistan',
    nameRu: 'Пакистан',
  },
  {
    code: '+880',
    flag: '🇧🇩',
    iso2: 'BD',
    nameEn: 'Bangladesh',
    nameRu: 'Бангладеш',
  },
  {
    code: '+94',
    flag: '🇱🇰',
    iso2: 'LK',
    nameEn: 'Sri Lanka',
    nameRu: 'Шри-Ланка',
  },
  { code: '+95', flag: '🇲🇲', iso2: 'MM', nameEn: 'Myanmar', nameRu: 'Мьянма' },
  { code: '+98', flag: '🇮🇷', iso2: 'IR', nameEn: 'Iran', nameRu: 'Иран' },
  { code: '+961', flag: '🇱🇧', iso2: 'LB', nameEn: 'Lebanon', nameRu: 'Ливан' },
  {
    code: '+962',
    flag: '🇯🇴',
    iso2: 'JO',
    nameEn: 'Jordan',
    nameRu: 'Иордания',
  },
  { code: '+963', flag: '🇸🇾', iso2: 'SY', nameEn: 'Syria', nameRu: 'Сирия' },
  { code: '+964', flag: '🇮🇶', iso2: 'IQ', nameEn: 'Iraq', nameRu: 'Ирак' },
  { code: '+965', flag: '🇰🇼', iso2: 'KW', nameEn: 'Kuwait', nameRu: 'Кувейт' },
  { code: '+968', flag: '🇴🇲', iso2: 'OM', nameEn: 'Oman', nameRu: 'Оман' },
  {
    code: '+970',
    flag: '🇵🇸',
    iso2: 'PS',
    nameEn: 'Palestine',
    nameRu: 'Палестина',
  },
  { code: '+972', flag: '🇮🇱', iso2: 'IL', nameEn: 'Israel', nameRu: 'Израиль' },
  {
    code: '+973',
    flag: '🇧🇭',
    iso2: 'BH',
    nameEn: 'Bahrain',
    nameRu: 'Бахрейн',
  },
  { code: '+974', flag: '🇶🇦', iso2: 'QA', nameEn: 'Qatar', nameRu: 'Катар' },
  {
    code: '+976',
    flag: '🇲🇳',
    iso2: 'MN',
    nameEn: 'Mongolia',
    nameRu: 'Монголия',
  },
  { code: '+977', flag: '🇳🇵', iso2: 'NP', nameEn: 'Nepal', nameRu: 'Непал' },
];

// Single source of truth for country codes used in the app.
export const COUNTRIES: Country[] = RAW_COUNTRIES.slice().sort((a, b) =>
  a.nameEn.localeCompare(b.nameEn),
);

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getCountryByIso2(iso2: string): Country | undefined {
  return COUNTRIES.find((c) => c.iso2 === iso2);
}
