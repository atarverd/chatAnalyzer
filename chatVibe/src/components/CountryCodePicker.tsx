import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Common country codes with emoji flags
const COUNTRIES = [
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+375', flag: '🇧🇾', name: 'Belarus' },
  { code: '+7', flag: '🇰🇿', name: 'Kazakhstan' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
  { code: '+996', flag: '🇰🇬', name: 'Kyrgyzstan' },
  { code: '+992', flag: '🇹🇯', name: 'Tajikistan' },
  { code: '+993', flag: '🇹🇲', name: 'Turkmenistan' },
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+218', flag: '🇱🇾', name: 'Libya' },
  { code: '+249', flag: '🇸🇩', name: 'Sudan' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+260', flag: '🇿🇲', name: 'Zambia' },
  { code: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
  { code: '+265', flag: '🇲🇼', name: 'Malawi' },
  { code: '+267', flag: '🇧🇼', name: 'Botswana' },
  { code: '+268', flag: '🇸🇿', name: 'Eswatini' },
  { code: '+269', flag: '🇰🇲', name: 'Comoros' },
  { code: '+290', flag: '🇸🇭', name: 'Saint Helena' },
  { code: '+291', flag: '🇪🇷', name: 'Eritrea' },
  { code: '+297', flag: '🇦🇼', name: 'Aruba' },
  { code: '+298', flag: '🇫🇴', name: 'Faroe Islands' },
  { code: '+299', flag: '🇬🇱', name: 'Greenland' },
  { code: '+350', flag: '🇬🇮', name: 'Gibraltar' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+354', flag: '🇮🇸', name: 'Iceland' },
  { code: '+355', flag: '🇦🇱', name: 'Albania' },
  { code: '+356', flag: '🇲🇹', name: 'Malta' },
  { code: '+357', flag: '🇨🇾', name: 'Cyprus' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+373', flag: '🇲🇩', name: 'Moldova' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+382', flag: '🇲🇪', name: 'Montenegro' },
  { code: '+383', flag: '🇽🇰', name: 'Kosovo' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+387', flag: '🇧🇦', name: 'Bosnia' },
  { code: '+389', flag: '🇲🇰', name: 'North Macedonia' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: '+423', flag: '🇱🇮', name: 'Liechtenstein' },
  { code: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+95', flag: '🇲🇲', name: 'Myanmar' },
  { code: '+98', flag: '🇮🇷', name: 'Iran' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+970', flag: '🇵🇸', name: 'Palestine' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+976', flag: '🇲🇳', name: 'Mongolia' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+992', flag: '🇹🇯', name: 'Tajikistan' },
  { code: '+993', flag: '🇹🇲', name: 'Turkmenistan' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+996', flag: '🇰🇬', name: 'Kyrgyzstan' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
];

type CountryCodePickerProps = {
  selectedCode: string;
  onSelect: () => void; // Changed to just trigger navigation, no code parameter
};

export function CountryCodePicker({
  selectedCode,
  onSelect,
}: CountryCodePickerProps) {
  const selectedCountry =
    COUNTRIES.find((c) => c.code === selectedCode) || COUNTRIES[1]; // Default to Russia

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.8}>
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.14)',
          'rgba(255, 255, 255, 0.02)',
          'rgba(255, 255, 255, 0.14)',
        ]}
        locations={[0.1647, 0.8353]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.12, y: 0.99 }}
        style={styles.selectorBorder}
      >
        <LinearGradient
          colors={['#272727', '#272727']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.selector}
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={styles.code}>{selectedCountry.code}</Text>
          <Text style={styles.chevron}>▼</Text>
        </LinearGradient>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  selectorBorder: {
    borderRadius: 999,
    padding: 1,
    marginRight: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 998,
    paddingLeft: 16,
    paddingRight: 16,
    height: 48,
    width: 113,
    gap: 4,
    justifyContent: 'center',
  },
  flag: {
    fontSize: 20,
  },
  code: {
    fontSize: 16,
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
    fontWeight: '400',
  },
  chevron: {
    fontSize: 10,
    color: '#C5C1B9',
  },
});
