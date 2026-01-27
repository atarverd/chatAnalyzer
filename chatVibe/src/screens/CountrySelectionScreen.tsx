import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  SectionList,
  Keyboard,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { BackButton } from '../components/BackButton';
import { CloseButton } from '../components/CloseButton';
import { ImageAssets } from '../utils/imageCache';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

// Common country codes with emoji flags - sorted alphabetically
const COUNTRIES = [
  { code: '+355', flag: '🇦🇱', name: 'Albania' },
  { code: '+376', flag: '🇦🇩', name: 'Andorra' },
  { code: '+375', flag: '🇧🇾', name: 'Belarus' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
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
].sort((a, b) => a.name.localeCompare(b.name));

type CountrySelectionScreenProps = {
  selectedCode: string;
  currentPhone: string;
  onSelect: (code: string) => void;
  onBack: () => void;
};

export function CountrySelectionScreen({
  selectedCode,
  currentPhone,
  onSelect,
  onBack,
}: CountrySelectionScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
        // Ensure search is shown when keyboard appears
        if (!showSearch) {
          setShowSearch(true);
        }
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
        // Don't hide search bar automatically - let user close it with X button
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [showSearch]);

  // Group countries by first letter
  const groupedCountries = useMemo(() => {
    const filtered = COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.includes(searchQuery)
    );

    const grouped: { [key: string]: typeof COUNTRIES } = {};
    filtered.forEach((country) => {
      const firstLetter = country.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(country);
    });

    return Object.keys(grouped)
      .sort()
      .map((letter) => ({
        title: letter,
        data: grouped[letter],
      }));
  }, [searchQuery]);

  const selectedCountry =
    COUNTRIES.find((c) => c.code === selectedCode) || COUNTRIES[0];

  const handleSelect = (code: string) => {
    onSelect(code);
    onBack();
  };

  const dialPadNumbers = [
    ['1', ''],
    ['2', 'ABC'],
    ['3', 'DEF'],
    ['4', 'GHI'],
    ['5', 'JKL'],
    ['6', 'MNO'],
    ['7', 'PQRS'],
    ['8', 'TUV'],
    ['9', 'WXYZ'],
    ['*', ''],
    ['0', '+'],
    ['#', ''],
  ];

  return (
    <BackgroundWrapper showGlow showHeader={false}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.container]}>
          {/* Header */}
          <View style={styles.header}>
            <BackButton onPress={onBack} />
            <Text style={styles.headerTitle}>Страна</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Floating Search Bar - shown when search is active */}
          {showSearch && (
            <View
              style={[
                styles.floatingSearchContainer,
                keyboardVisible
                  ? { bottom: keyboardHeight + 10 }
                  : { bottom: 30 },
              ]}
            >
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.12)',
                  'rgba(255, 255, 255, 0.02)',
                  'rgba(255, 255, 255, 0.12)',
                ]}
                locations={[0.1443, 0.4978, 0.8512]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={styles.searchInputBorder}
              >
                <View style={styles.searchBar}>
                  <ExpoImage
                    source={ImageAssets.searchIcon}
                    style={styles.searchIcon}
                    contentFit='contain'
                    tintColor='#fff'
                  />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder='Search'
                    placeholderTextColor='#666'
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus={true}
                    onFocus={() => {
                      // Keyboard will show automatically when focused
                    }}
                  />
                </View>
              </LinearGradient>
              <View style={styles.closeButtonWrapper}>
                <CloseButton
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                />
              </View>
            </View>
          )}

          {/* Country List */}
          <SectionList
            sections={groupedCountries}
            keyExtractor={(item, index) => `${item.code}-${item.name}-${index}`}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => handleSelect(item.code)}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryCode}>{item.code}</Text>
                </View>
              </TouchableOpacity>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
              </View>
            )}
            style={styles.countryList}
            contentContainerStyle={[
              styles.countryListContent,
              keyboardVisible &&
                showSearch && {
                  paddingBottom: keyboardHeight + 100,
                },
            ]}
            stickySectionHeadersEnabled={false}
          />

          {/* Search Button - bottom right */}
          {!showSearch && (
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {
                setShowSearch(true);
                // Small delay to ensure the TextInput is rendered before focusing
                setTimeout(() => {
                  searchInputRef.current?.focus();
                }, 100);
              }}
              activeOpacity={0.8}
            >
              <ExpoImage
                source={ImageAssets.searchIcon}
                style={styles.searchButtonIcon}
                contentFit='contain'
              />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest_600SemiBold',
      web: 'Onest, sans-serif',
    }),
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  floatingSearchContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputBorder: {
    borderRadius: 296,
    padding: 1,
    flex: 1,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 3,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    }),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 295,
    paddingLeft: 11,
    paddingRight: 10,
    backgroundColor: '#151515ee',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    }),
  },
  closeButtonWrapper: {
    marginLeft: 0,
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif-medium',
      web: 'SF Pro Text, sans-serif',
    }),
    fontWeight: '500',
    // lineHeight: 17,
    letterSpacing: 0,
  },
  countryList: {
    flex: 1,
  },
  countryListContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  sectionHeaderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif',
      web: 'SF Pro Text, sans-serif',
    }),
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
    fontWeight: '400',
    marginBottom: 4,
  },
  countryCode: {
    fontSize: 14,
    color: '#C5C1B9',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
    fontWeight: '400',
  },
  myPhoneSection: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  myPhoneLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif',
      web: 'SF Pro Text, sans-serif',
    }),
  },
  myPhoneNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif',
      web: 'SF Pro Text, sans-serif',
    }),
  },
  dialPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  dialPadButton: {
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 12,
  },
  dialPadNumber: {
    fontSize: 24,
    fontWeight: '400',
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif',
      web: 'SF Pro Text, sans-serif',
    }),
  },
  dialPadLetters: {
    fontSize: 10,
    color: '#C5C1B9',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif',
      web: 'SF Pro Text, sans-serif',
    }),
  },
  searchButton: {
    position: 'absolute',
    bottom: 20,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchButtonIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
});
