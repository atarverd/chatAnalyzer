import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { BackButton } from '../components/BackButton';
import { CloseButton } from '../components/CloseButton';
import { ImageAssets } from '../utils/imageCache';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { COUNTRIES, getCountryByIso2 } from '../data/countries';

type CountrySelectionScreenProps = {
  selectedIso2: string;
  currentPhone: string;
  onSelect: (iso2: string) => void;
  onBack: () => void;
};

export function CountrySelectionScreen({
  selectedIso2,
  currentPhone,
  onSelect,
  onBack,
}: CountrySelectionScreenProps) {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const searchInputRef = useRef<TextInput>(null);



  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent as any, (e) => {
      const height = e?.endCoordinates?.height ?? 0;
      setKeyboardVisible(true);
      setKeyboardHeight(height);
    });

    const hideSub = Keyboard.addListener(hideEvent as any, () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);


  // Group countries by first letter
  const groupedCountries = useMemo(() => {
    const getName = (c: (typeof COUNTRIES)[number]) =>
      i18n.language === 'ru' ? c.nameRu : c.nameEn;

    const q = searchQuery.toLowerCase();
    const filtered = COUNTRIES.filter(
      (country) =>
        getName(country).toLowerCase().includes(q) ||
        country.nameEn.toLowerCase().includes(q) ||
        country.nameRu.toLowerCase().includes(q) ||
        country.code.includes(searchQuery)
    );

    const grouped: { [key: string]: typeof COUNTRIES } = {};
    filtered.forEach((country) => {
      const firstLetter = getName(country).charAt(0).toUpperCase();
      if (!grouped[firstLetter]) grouped[firstLetter] = [];
      grouped[firstLetter].push(country);
    });

    return Object.keys(grouped)
      .sort()
      .map((letter) => ({
        title: letter,
        data: grouped[letter],
      }));
  }, [searchQuery, i18n.language]);

  const selectedCountry = getCountryByIso2(selectedIso2) || COUNTRIES[0];

  const handleSelect = (iso2: string) => {
    onSelect(iso2);
    onBack();
  };


  const floatingBottomClosed = Platform.OS === 'android' ? 16 : 30;

  const floatingBottomOpen =
    keyboardHeight + // keyboard height
    10 + // gap above keyboard
    (Platform.OS === 'android' ? insets.bottom : 0);

  const floatingBottomFinal = keyboardVisible && keyboardHeight > 0 ? floatingBottomOpen : floatingBottomClosed;

  const searchButtonBottom =
    (keyboardVisible ? keyboardHeight : 0) + 20 + insets.bottom;

  return (
    <BackgroundWrapper showGlow showHeader={false} >
      <View
        style={[
          styles.safeArea,
          {
            paddingTop: Platform.OS === 'web' ? 24 : insets.top + 24,
            paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
          },
        ]}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <BackButton onPress={onBack} />
            <Text style={styles.headerTitle}>{t('common.country')}</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Static Search Bar for Android/Web */}
          {Platform.OS !== 'ios' && (
            <View style={styles.staticSearchContainer}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.12)',
                  'rgba(255, 255, 255, 0.02)',
                  'rgba(255, 255, 255, 0.12)',
                ]}
                locations={[0.1443, 0.4978, 0.8512]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={[
                  styles.searchInputBorder,
                  Platform.OS === 'android' && styles.searchInputBorderFullWidth,
                ]}
              >
                <View style={styles.searchBar}>
                  <ExpoImage
                    source={ImageAssets.searchIcon}
                    style={styles.searchIcon}
                    contentFit="contain"
                    tintColor="#fff"
                  />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder={t('common.search')}
                    keyboardAppearance="dark"
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                  />
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Floating Search Bar for iOS */}
          {Platform.OS === 'ios' && showSearch && (
            <View
              style={[
                styles.floatingSearchContainer,
                { bottom: floatingBottomFinal },
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
                    contentFit="contain"
                    tintColor="#fff"
                  />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder={t('common.search')}
                    keyboardAppearance="dark"
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                    returnKeyType="search"
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
            keyExtractor={(item, index) => `${item.code}-${item.nameEn}-${index}`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => handleSelect(item.iso2)}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <Text style={styles.countryName}>
                  {i18n.language === 'ru' ? item.nameRu : item.nameEn}
                </Text>
                <View style={styles.countryCodeContainer}>
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
              Platform.OS === 'ios' &&
                keyboardVisible &&
                showSearch && {
                  paddingBottom: keyboardHeight + 100,
                },
            ]}
            stickySectionHeadersEnabled={false}
          />

          {/* Search Button - bottom right (iOS only) */}
          {Platform.OS === 'ios' && !showSearch && (
            <TouchableOpacity
              style={[styles.searchButton, { bottom: searchButtonBottom }]}
              onPress={() => {
                setShowSearch(true);
                setTimeout(() => {
                  searchInputRef.current?.focus();
                }, 100);
              }}
              activeOpacity={0.8}
            >
              <ExpoImage
                source={ImageAssets.searchIcon}
                style={styles.searchButtonIcon}
                contentFit="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
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
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },

  staticSearchContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...(Platform.OS === 'android' && {
      marginHorizontal: -24,
      paddingHorizontal: 24,
    }),
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
    marginRight: Platform.OS === 'ios' ? 12 : 0,
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
  searchInputBorderFullWidth: {
    marginRight: 0,
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
      android: 'SF-Pro',
      web: 'SF Pro Text, sans-serif',
    }),
    fontWeight: '500',
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
    paddingBottom: 12,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  sectionHeaderText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'SF-Pro',
      web: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
    lineHeight: 17,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  countryFlag: {
    fontSize: 20,
    fontWeight: '300',
    fontFamily: Platform.select({
      ios: 'SF Compact',
      android: 'SF-Pro',
      web: 'SF Compact, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
    lineHeight: 20,
    marginRight: 12,
    textAlign: 'center',
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'SF-Pro',
      web: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: -0.32,
  },
  countryCodeContainer: {
    marginLeft: 'auto',
  },
  countryCode: {
    fontSize: 17,
    fontWeight: '500',
    color: '#999999',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'SF-Pro',
      web: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
    lineHeight: 17,
    textAlign: 'right',
  },

  searchButton: {
    position: 'absolute',
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
