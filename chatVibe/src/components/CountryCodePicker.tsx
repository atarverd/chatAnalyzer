import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { COUNTRIES, getCountryByCode } from '../data/countries';

type CountryCodePickerProps = {
  selectedCode: string;
  onSelect: () => void; // Changed to just trigger navigation, no code parameter
};

export function CountryCodePicker({
  selectedCode,
  onSelect,
}: CountryCodePickerProps) {
  const selectedCountry = getCountryByCode(selectedCode) || getCountryByCode('+7') || COUNTRIES[0];

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
