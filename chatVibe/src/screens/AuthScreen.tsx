import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../store';
import { selectAuth } from '../store';
import { setPhone, setStep } from '../features/auth/authSlice';
import {
  useSendCodeMutation,
  useSignInMutation,
  useSubmitPasswordMutation,
} from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { GlassButton } from '../components/GlassButton';
import { ResendButton } from '../components/ResendButton';
import { CountryCodePicker } from '../components/CountryCodePicker';
import { CountrySelectionScreen } from './CountrySelectionScreen';
import { useTranslation } from 'react-i18next';
import { triggerHaptic } from '../utils/haptics';
import { getCountryByIso2 } from '../data/countries';
import { Image as ExpoImage } from 'expo-image';
import { ImageAssets } from '../utils/imageCache';

const BOTTOM_BAR_PADDING = 26;
const BOTTOM_BAR_HEIGHT_APPROX = 64;

export function AuthScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(selectAuth);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState(['', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedCountryIso2, setSelectedCountryIso2] = useState<string>('RU');
  const [focusedInputIndex, setFocusedInputIndex] = useState<number | null>(0);
  const [showCountrySelection, setShowCountrySelection] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [isPhoneInputFocused, setIsPhoneInputFocused] = useState(false);
  const [isCodeInputFocused, setIsCodeInputFocused] = useState(false);
  const [isPasswordInputFocused, setIsPasswordInputFocused] = useState(false);

  const codeInputRefs = useRef<(TextInput | null)[]>([]);
  const isVerifyingRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const [sendCode, { isLoading }] = useSendCodeMutation();
  const [signIn, { isLoading: isVerifyingCode }] = useSignInMutation();
  const [submitPassword, { isLoading: isVerifyingPassword }] =
    useSubmitPasswordMutation();

  // ✅ Bottom bar animation value (Android only when needed)
  const bottomTranslateY = useRef(new Animated.Value(0)).current;

  // ✅ Track whether Android is actually resizing (to avoid double shift)
  const baseWindowHeightRef = useRef(Dimensions.get('window').height);

  const bottomBarExtraPadding = useMemo(() => {
    return BOTTOM_BAR_PADDING + (Platform.OS === 'android' ? insets.bottom : 0);
  }, [insets.bottom]);

  const scrollPaddingBottom = useMemo(() => {
    return bottomBarExtraPadding + BOTTOM_BAR_HEIGHT_APPROX + 24;
  }, [bottomBarExtraPadding]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      const h = e?.endCoordinates?.height ?? 0;

      // iOS handled by KeyboardAvoidingView
      if (Platform.OS !== 'android') return;

      // Give Android a frame to apply adjustResize (if it will)
      requestAnimationFrame(() => {
        const newH = Dimensions.get('window').height;
        const baseH = baseWindowHeightRef.current;
        const resized = baseH - newH > 40; // threshold

        // If resized => do NOT translate (otherwise it goes too high)
        const target = resized ? 0 : -h;

        Animated.timing(bottomTranslateY, {
          toValue: target,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    };

    const onHide = () => {
      if (Platform.OS === 'android') {
        Animated.timing(bottomTranslateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start();

        // reset baseline height after keyboard closes
        requestAnimationFrame(() => {
          baseWindowHeightRef.current = Dimensions.get('window').height;
        });
      }
    };

    const subShow = Keyboard.addListener(showEvent as any, onShow);
    const subHide = Keyboard.addListener(hideEvent as any, onHide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [bottomTranslateY]);

  const handleChangePhone = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '').slice(0, 16);
    dispatch(setPhone(numbersOnly));
  };

  const handleBack = () => {
    // Reset all focus states
    setIsPhoneInputFocused(false);
    setIsCodeInputFocused(false);
    setIsPasswordInputFocused(false);
    
    if (auth.step === 'code') {
      dispatch(setStep('phone'));
      setCode(['', '', '', '', '']);
      setStatus(null);
      setCodeError(false);
    } else if (auth.step === 'password') {
      dispatch(setStep('phone'));
      setPassword('');
      setCode(['', '', '', '', '']);
      setStatus(null);
      setCodeError(false);
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    if (codeError) setCodeError(false);
    const numbersOnly = value.replace(/\D/g, '');

    if (numbersOnly === '' && code[index]) {
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      return;
    }

    if (numbersOnly.length > 1) {
      const newCode = [...code];
      const digits = numbersOnly.split('').slice(0, 5);
      digits.forEach((digit, i) => {
        if (index + i < 5) newCode[index + i] = digit;
      });
      setCode(newCode);

      const lastFilledIndex = Math.min(index + digits.length - 1, 4);
      setTimeout(() => codeInputRefs.current[lastFilledIndex]?.focus(), 0);
    } else {
      const newCode = [...code];
      newCode[index] = numbersOnly;
      setCode(newCode);

      if (numbersOnly && index < 4) {
        setTimeout(() => codeInputRefs.current[index + 1]?.focus(), 0);
      }
    }
  };

  const handleCodeKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      } else if (index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        setTimeout(() => codeInputRefs.current[index - 1]?.focus(), 0);
      }
    }
  };

  // Reset focus states on mount and unmount
  useEffect(() => {
    setIsPhoneInputFocused(false);
    setIsCodeInputFocused(false);
    setIsPasswordInputFocused(false);

    return () => {
      setIsPhoneInputFocused(false);
      setIsCodeInputFocused(false);
      setIsPasswordInputFocused(false);
    };
  }, []);

  useEffect(() => {
    if (auth.step === 'code') {
      setTimeout(() => codeInputRefs.current[0]?.focus(), 100);
    }
    // Reset focus states when step changes
    if (auth.step !== 'phone') {
      setIsPhoneInputFocused(false);
    }
    if (auth.step !== 'code') {
      setIsCodeInputFocused(false);
    }
    if (auth.step !== 'password') {
      setIsPasswordInputFocused(false);
    }
  }, [auth.step]);

  useEffect(() => {
    const fullCode = code.join('');
    if (
      fullCode.length === 5 &&
      auth.step === 'code' &&
      !isVerifyingCode &&
      !isVerifyingRef.current
    ) {
      isVerifyingRef.current = true;
      handleVerifyCode().finally(() => {
        isVerifyingRef.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, auth.step, isVerifyingCode]);

  const handleSendCode = async () => {
    const phoneNumber = auth.phone.trim();
    if (!phoneNumber) {
      setStatus(t('errors.generic'));
      return;
    }
    if (phoneNumber.length < 7 || phoneNumber.length > 16) {
      setStatus(t('errors.invalidPhoneLength'));
      return;
    }

    const selectedCountry = getCountryByIso2(selectedCountryIso2);
    const countryCode = selectedCountry?.code || '+7';
    const phone = `${countryCode}${phoneNumber}`;

    try {
      await sendCode({ phone }).unwrap();
      setStatus(null);
      dispatch(setStep('code'));
    } catch {
      setStatus(t('errors.failedToSendCode'));
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 5) {
      setStatus(t('errors.invalidCode'));
      return;
    }

    try {
      const phoneNumber = auth.phone.trim();
      const selectedCountry = getCountryByIso2(selectedCountryIso2);
      const countryCode = selectedCountry?.code || '+7';
      const phone = `${countryCode}${phoneNumber}`;

      const res = await signIn({ phone, code: fullCode }).unwrap();

      if (res.needPassword) {
        setStatus(null);
        setCodeError(false);
        dispatch(setStep('password'));
      } else if (res.success) {
        setStatus(null);
        setCodeError(false);
      } else {
        setStatus(res.error || t('errors.invalidCode'));
        setCodeError(true);
        await triggerHaptic('error');
      }
    } catch {
      setStatus(t('errors.failedToVerifyCode'));
      setCodeError(true);
      await triggerHaptic('error');
    }
  };

  const handleSubmitPassword = async () => {
    const trimmedPassword = password.trim();
    if (!trimmedPassword) return;

    try {
      const res = await submitPassword({ password: trimmedPassword }).unwrap();
      if (res.success) {
        setStatus(null);
      } else {
        setStatus(res.error || t('errors.generic'));
        await triggerHaptic('error');
      }
    } catch {
      setStatus(
        t('errors.failedToVerifyPassword') || 'Failed to verify password. Please try again.'
      );
      await triggerHaptic('error');
    }
  };
  // const isFloatingKeyboard = useIsFloatingKeyboard();

  if (showCountrySelection) {
    return (
      <CountrySelectionScreen
        selectedIso2={selectedCountryIso2}
        currentPhone={auth.phone}
        onSelect={setSelectedCountryIso2}
        onBack={() => {
          setIsPhoneInputFocused(false);
          setIsCodeInputFocused(false);
          setIsPasswordInputFocused(false);
          setShowCountrySelection(false);
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
      // enabled={!isFloatingKeyboard}
    >
      <BackgroundWrapper
        showGlow
        showHeader
        showBackButton={auth.step === 'code' || auth.step === 'password'}
        onBackPress={auth.step === 'code' || auth.step === 'password' ? handleBack : undefined}
      >
        <SafeAreaView style={styles.safeArea} edges={Platform.OS === 'android' ? ['bottom'] : []}>
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
            disabled={Platform.OS === 'web'}
          >
            <View style={styles.screen}>
              <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.content}>
                  {auth.step === 'phone' && (
                    <React.Fragment key="phone-step">
                      <Text style={styles.mainTitle}>{t('auth.connectTelegram')}</Text>
                      <Text style={styles.secondaryText}>{t('auth.connectTelegramSubtitle')}</Text>

                      <View style={styles.phoneInputContainer}>
                        <CountryCodePicker
                          selectedIso2={selectedCountryIso2}
                          onSelect={() => {
                            setIsPhoneInputFocused(false);
                            setIsCodeInputFocused(false);
                            setIsPasswordInputFocused(false);
                            setShowCountrySelection(true);
                          }}
                        />
                        <View style={styles.phoneInputWrapper}>
                          <TextInput
                            style={styles.phoneInput}
                            placeholder=""
                            keyboardType="phone-pad"
                            value={auth.phone}
                            onChangeText={handleChangePhone}
                            autoFocus={Platform.OS === 'web'}
                            inputMode="numeric"
                            selectionColor="#34C759"
                            keyboardAppearance="dark"
                            onFocus={() => setIsPhoneInputFocused(true)}
                            onBlur={() => setIsPhoneInputFocused(false)}
                          />
                          {!auth.phone && (
                            <Text style={styles.phoneInputPlaceholder}>555 44 32</Text>
                          )}
                        </View>
                      </View>
                      {Platform.OS === 'android' && isPhoneInputFocused && (
                        <View style={styles.phoneButtonContainer}>
                          <GlassButton
                            title={isLoading ? t('auth.sending') : t('auth.getCode')}
                            onPress={handleSendCode}
                            disabled={isLoading || !auth.phone || auth.phone.length < 7}
                          />
                        </View>
                      )}
                    </React.Fragment>
                  )}

                  {auth.step === 'code' && (
                    <React.Fragment key="code-step">
                      <Text style={styles.codeTitle}>{t('auth.enterCodeTitle')}</Text>
                      <Text style={styles.codeSubtitle}>
                        {t('auth.codeSentTo', {
                          phone: `${getCountryByIso2(selectedCountryIso2)?.code || '+7'} ${auth.phone}`,
                        })}
                      </Text>

                      <View style={styles.codeInputsContainer}>
                        {code.map((digit, index) => {
                          const isFocused = focusedInputIndex === index;
                          return (
                            <TouchableOpacity
                              key={index}
                              activeOpacity={1}
                              onPress={() => codeInputRefs.current[index]?.focus()}
                              style={styles.codeInputTouchable}
                            >
                              <LinearGradient
                                colors={
                                  codeError
                                    ? [
                                        'rgba(255, 255, 255, 0.14)',
                                        'rgba(254, 63, 33, 0.22)',
                                        'rgba(254, 63, 33, 0.44)',
                                      ]
                                    : isFocused
                                      ? [
                                          'rgba(255, 255, 255, 0.14)',
                                          'rgba(52, 199, 89, 0.22)',
                                          'rgba(52, 199, 89, 0.44)',
                                        ]
                                      : [
                                          'rgba(255, 255, 255, 0.14)',
                                          'rgba(255, 255, 255, 0.02)',
                                          'rgba(255, 255, 255, 0.14)',
                                        ]
                                }
                                locations={[0.1451, 0.5005, 0.8594]}
                                start={{ x: 0.2, y: 0 }}
                                end={{ x: 0.8, y: 1 }}
                                style={styles.codeInputBorder}
                              >
                                <LinearGradient
                                  colors={['#272727', '#272727']}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={styles.codeInputWrapper}
                                >
                                  <TextInput
                                    ref={(ref) => {
                                      codeInputRefs.current[index] = ref;
                                    }}
                                    style={styles.codeInput}
                                    value={digit}
                                    onChangeText={(value) => handleCodeChange(value, index)}
                                    onKeyPress={(e) => handleCodeKeyPress(e, index)}
                                    onFocus={() => {
                                      setFocusedInputIndex(index);
                                      setIsCodeInputFocused(true);
                                    }}
                                    onBlur={() => {
                                      setFocusedInputIndex(null);
                                      setIsCodeInputFocused(false);
                                    }}
                                    keyboardType="number-pad"
                                    keyboardAppearance="dark"
                                    maxLength={index === 0 ? 5 : 1}
                                    textContentType={index === 0 ? 'oneTimeCode' : 'none'}
                                    autoComplete={index === 0 ? ('sms-otp' as any) : 'off'}
                                    selectTextOnFocus
                                    selectionColor="#34C759"
                                    textAlign="center"
                                    {...(Platform.OS !== 'ios' && {
                                      caretColor: '#34C759' as any,
                                    })}
                                  />
                                </LinearGradient>
                              </LinearGradient>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      {Platform.OS === 'android' && isCodeInputFocused && (
                        <View style={styles.codeButtonContainer}>
                          <ResendButton
                            title={t('auth.resend')}
                            onPress={handleSendCode}
                            disabled={isLoading}
                            width={141}
                            height={32}
                            fontSize={12}
                          />
                        </View>
                      )}
                    </React.Fragment>
                  )}

                  {auth.step === 'password' && (
                    <React.Fragment key="password-step">
                      <Text style={styles.codeTitle}>{t('auth.enterPasswordTitle')}</Text>
                      <Text style={styles.codeSubtitle}>
                        {t('auth.passwordSentTo', {
                          phone: `${getCountryByIso2(selectedCountryIso2)?.code || '+7'} ${auth.phone}`,
                        })}
                      </Text>

                      <View style={styles.passwordInputContainer}>
                        <LinearGradient
                          colors={[
                            'rgba(255, 255, 255, 0.14)',
                            'rgba(52, 199, 89, 0.22)',
                            'rgba(52, 199, 89, 0.44)',
                          ]}
                          locations={[0.1451, 0.5005, 0.8594]}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.515, y: 1 }}
                          style={styles.passwordInputBorder}
                        >
                          <View style={styles.passwordInputWrapper}>
                            <TextInput
                              style={styles.passwordInput}
                              placeholder=""
                              secureTextEntry={!showPassword}
                              keyboardAppearance="dark"
                              value={password}
                              onChangeText={setPassword}
                              autoFocus={Platform.OS === 'web'}
                              selectionColor="#34C759"
                              placeholderTextColor="#C5C1B9"
                              onFocus={() => setIsPasswordInputFocused(true)}
                              onBlur={() => setIsPasswordInputFocused(false)}
                              {...(Platform.OS === 'web' && {
                                outlineStyle: 'none' as any,
                                WebkitAppearance: 'none' as any,
                                caretColor: '#34C759',
                              })}
                            />
                            <TouchableOpacity
                              onPress={() => setShowPassword((v) => !v)}
                              style={styles.eyeIconButton}
                              activeOpacity={0.7}
                            >
                              <ExpoImage
                                source={showPassword ? ImageAssets.eye : ImageAssets.eyeClosed}
                                style={styles.eyeIcon}
                                contentFit="contain"
                                tintColor="#fff"
                              />
                            </TouchableOpacity>
                          </View>
                        </LinearGradient>
                      </View>
                      {Platform.OS === 'android' && isPasswordInputFocused && (
                        <View style={styles.passwordButtonContainer}>
                          <GlassButton
                            title={isVerifyingPassword ? t('auth.sending') : t('auth.submitPassword')}
                            onPress={handleSubmitPassword}
                            disabled={isVerifyingPassword}
                          />
                        </View>
                      )}
                    </React.Fragment>
                  )}

                  {status ? <Text style={styles.status}>{status}</Text> : null}
                </View>
              </ScrollView>

              <Animated.View
                style={[
                  styles.bottomBar,
                  {
                    paddingBottom: bottomBarExtraPadding,
                    transform:
                      Platform.OS === 'android'  
                        ? [{ translateY: bottomTranslateY }]
                        : undefined,
                  },
                ]}
              >
                {auth.step === 'phone' && (Platform.OS !== 'android' || !isPhoneInputFocused) && (
                  <GlassButton
                    title={isLoading ? t('auth.sending') : t('auth.getCode')}
                    onPress={handleSendCode}
                    disabled={isLoading || !auth.phone || auth.phone.length < 7}
                  />
                )}
                {auth.step === 'code' && (Platform.OS !== 'android' || !isCodeInputFocused) && (
                  <ResendButton
                    title={t('auth.resend')}
                    onPress={handleSendCode}
                    disabled={isLoading}
                    width={141}
                    height={32}
                    fontSize={12}
                  />
                )}
                {auth.step === 'password' && (Platform.OS !== 'android' || !isPasswordInputFocused) && (
                  <GlassButton
                    title={isVerifyingPassword ? t('auth.sending') : t('auth.submitPassword')}
                    onPress={handleSubmitPassword}
                    disabled={isVerifyingPassword}
                  />
                )}
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </BackgroundWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 34,
    paddingTop: 110,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },

  mainTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#C5C1B9',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
  },

  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 24,
    paddingRight: 12,
    backgroundColor: 'transparent',
    alignSelf: 'center',
    maxWidth: 300,
  },
  phoneButtonContainer: {
    marginTop: 0,
    alignItems: 'center',
    width: '100%',
  },
  codeButtonContainer: {
    marginTop: 0,
    alignItems: 'center',
    width: '100%',
  },
  passwordButtonContainer: {
    marginTop: 0,
    alignItems: 'center',
    width: '100%',
  },
  phoneInputWrapper: {
    position: 'relative',
    width: 230,
    minHeight: 48,
    justifyContent: 'center',
    marginLeft: 15,
  },
  phoneInput: {
    width: 230,
    height: 48,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
    letterSpacing: 2,
    textAlign: 'left',
    textAlignVertical: 'center',
    includeFontPadding: false,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none' as any,
      WebkitAppearance: 'none' as any,
      caretColor: '#34C759',
    }),
  },
  phoneInputPlaceholder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    fontSize: 17,
    fontWeight: '600',
    color: '#666',
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 48,
    letterSpacing: 2,
    textAlign: 'left',
    textAlignVertical: 'center',
    pointerEvents: 'none',
  },

  status: {
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
    color: '#FE3F21',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 20,
  },

  codeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 22,
  },
  codeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 44,
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 20,
  },

  codeInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginBottom: 44,
  },
  codeInputTouchable: {
    width: 54,
    height: 48,
  },
  codeInputBorder: {
    width: 54,
    height: 48,
    borderRadius: 999,
    padding: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeInputWrapper: {
    flex: 1,
    width: '100%',
    borderRadius: 998,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  codeInput: {
    flex: 1,
    width: '100%',
    height: '100%',
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    ...(Platform.OS === 'ios' && {
      tintColor: '#34C759',
    } as any),
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none' as any,
      WebkitAppearance: 'none' as any,
    }),
  },

  passwordInputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  passwordInputBorder: {
    width: '100%',
    maxWidth: 334,
    borderRadius: 999,
    padding: 1,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 998,
    backgroundColor: '#272727',
    paddingLeft: 16,
    paddingRight: 12,
    minHeight: 48,
  },
  passwordInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
    paddingVertical: 0,
    paddingHorizontal: 0,
    textAlign: 'left',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  eyeIconButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  eyeIcon: {
    width: 19,
    height: 14,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 34,
    alignItems: 'center',
  },
});
