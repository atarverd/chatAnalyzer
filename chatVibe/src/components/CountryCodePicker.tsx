import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { COUNTRIES, getCountryByIso2 } from '../data/countries';
import { ImageAssets } from '../utils/imageCache';

type CountryCodePickerProps = {
  selectedIso2: string;
  onSelect: () => void; // Changed to just trigger navigation, no code parameter
};

export function CountryCodePicker({
  selectedIso2,
  onSelect,
}: CountryCodePickerProps) {
  const selectedCountry =
    getCountryByIso2(selectedIso2) || getCountryByIso2('RU') || COUNTRIES[0];

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.8}>
      <LinearGradient
        colors={['#FFFFFF24', '#FFFFFF05', '#FFFFFF24']}
        locations={[0.1647, 0.8353]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.12, y: 0.99 }}
        style={styles.selectorBorder}
      >
        <LinearGradient
          colors={['#202121', '#202121']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.selector}
        >
          <Text style={styles.code}>{selectedCountry.code}</Text>
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <ExpoImage
            source={ImageAssets.arrowDown}
            style={styles.chevron}
            contentFit='contain'
          />
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
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest-SemiBold, sans-serif',
    }),
    fontWeight: '600',
  },
  chevron: {
    width: 12,
    height: 12,
  },
});
