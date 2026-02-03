import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export function AuthScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(selectAuth);
  const { t } = useTranslation();
  // const auth = {
  //   step: 'phone',
  //   phone: '1233',
  // }
  const [code, setCode] = useState(['', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedCountryIso2, setSelectedCountryIso2] = useState<string>('RU'); 
  const [focusedInputIndex, setFocusedInputIndex] = useState<number | null>(0);
  const [showCountrySelection, setShowCountrySelection] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [paddingBottom, setPaddingBottom] = useState(36);
  const paddingBottomAnim = useRef(new Animated.Value(36)).current;
  const buttonBottomAnim = useRef(new Animated.Value(0)).current;
  const codeInputRefs = useRef<(TextInput | null)[]>([]);
  const isVerifyingRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [sendCode, { isLoading }] = useSendCodeMutation();
  const [signIn, { isLoading: isVerifyingCode }] = useSignInMutation();
  const [submitPassword, { isLoading: isVerifyingPassword }] =
    useSubmitPasswordMutation();

  const handleChangePhone = (value: string) => {
    // Only allow numbers
    const numbersOnly = value.replace(/\D/g, '');
    dispatch(setPhone(numbersOnly));
  };

  const handleBack = () => {
    if (auth.step === 'code') {
      dispatch(setStep('phone'));
      setCode(['', '', '', '', '']);
      setStatus(null);
    } else if (auth.step === 'password') {
      dispatch(setStep('phone'));
      setPassword('');
      setCode(['', '', '', '', '']);
      setStatus(null);
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    // Clear error when user starts typing
    if (codeError) {
      setCodeError(false);
    }
    // Only allow numbers
    const numbersOnly = value.replace(/\D/g, '');

    // If value is empty (backspace on selected text or empty input)
    if (numbersOnly === '' && code[index]) {
      // Clear current input
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      return;
    }

    // If multiple digits pasted (autofill/paste), distribute them
    if (numbersOnly.length > 1) {
      const newCode = [...code];
      const digits = numbersOnly.split('').slice(0, 5);
      digits.forEach((digit, i) => {
        if (index + i < 5) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      // Focus the last filled input
      const lastFilledIndex = Math.min(index + digits.length - 1, 4);
      setTimeout(() => {
        codeInputRefs.current[lastFilledIndex]?.focus();
      }, 0);
    } else {
      // Single digit entered
      const newCode = [...code];
      newCode[index] = numbersOnly;
      setCode(newCode);
      // Auto-focus next input if digit entered and not the last one
      if (numbersOnly && index < 4) {
        setTimeout(() => {
          codeInputRefs.current[index + 1]?.focus();
        }, 0);
      }
    }
  };

  const handleCodeKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (code[index]) {
        // If current input has a value, clear it immediately
        // This will be handled by handleCodeChange when onChangeText is called
        // But we also handle it here to ensure immediate response
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      } else if (index > 0) {
        // If current input is empty, move to previous and clear it
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        setTimeout(() => {
          codeInputRefs.current[index - 1]?.focus();
        }, 0);
      }
    }
  };

  useEffect(() => {
    if (auth.step === 'code') {
      // Focus first input when code step is shown
      setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [auth.step]);

  useEffect(() => {
    // Auto-submit when all 5 digits are entered
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
  }, [code]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        console.log('Keyboard is open', e.endCoordinates.height);
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
        
        // On Android, we'll handle button positioning separately
        const targetPadding = 26;
        
        Animated.timing(paddingBottomAnim, {
          toValue: targetPadding,
          duration: 250,
          useNativeDriver: false,
        }).start((finished) => {
          if (finished) {
            setPaddingBottom(targetPadding);
          }
        });

        // On Android, animate button position above keyboard
        if (Platform.OS === 'android' && e.endCoordinates.height > 0) {
          Animated.timing(buttonBottomAnim, {
            toValue: -(e.endCoordinates.height - 270),
            duration: 250,
            useNativeDriver: true,
          }).start();
        }
      }
    );
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      console.log('Keyboard is closed');
      setKeyboardVisible(false);
      setKeyboardHeight(0);
      Animated.timing(paddingBottomAnim, {
        toValue: 36,
        duration: 250,
        useNativeDriver: false,
      }).start((finished) => {
        if (finished) {
          setPaddingBottom(36);
        }
      });

      // Reset button position on Android
      if (Platform.OS === 'android') {
        Animated.timing(buttonBottomAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    });

    // Update state during animation
    const listenerId = paddingBottomAnim.addListener(({ value }) => {
      setPaddingBottom(value);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      paddingBottomAnim.removeListener(listenerId);
    };
  }, []);

  const handleSendCode = async () => {
    const phoneNumber = auth.phone.trim();
    if (!phoneNumber) {
      setStatus(t('errors.generic'));
      return;
    }
    const selectedCountry = getCountryByIso2(selectedCountryIso2);
    const countryCode = selectedCountry?.code || '+7';
    const phone = `${countryCode}${phoneNumber}`;
    // setStatus('Sending verification code...');
    try {
      const res = await sendCode({ phone }).unwrap();
      //   setStatus(res.message || 'Code sent! Check your Telegram app');
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
    // setStatus('Verifying code...');
    try {
      const phoneNumber = auth.phone.trim();
      const selectedCountry = getCountryByIso2(selectedCountryIso2);
      const countryCode = selectedCountry?.code || '+7';
      const phone = `${countryCode}${phoneNumber}`;
      const res = await signIn({
        phone,
        code: fullCode,
      }).unwrap();
      if (res.needPassword) {
        // setStatus('2FA enabled. Please enter your password');
        setCodeError(false);
      } else if (res.success) {
        // setStatus('Successfully authenticated!');
        setCodeError(false);
      } else {
        setStatus(res.error || 'Invalid code');
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
    if (!trimmedPassword) {
      //   setStatus('Please enter your password');
      return;
    }
    // setStatus('Verifying password...');
    try {
      const res = await submitPassword({ password: trimmedPassword }).unwrap();
      if (res.success) {
        // setStatus('Successfully authenticated!');
      } else {
        setStatus(res.error || 'Invalid password');
        await triggerHaptic('error');
      }
    } catch {
      setStatus('Failed to verify password. Please try again.');
      await triggerHaptic('error');
    }
  };

  if (showCountrySelection) {
    return (
      <CountrySelectionScreen
        selectedIso2={selectedCountryIso2}
        currentPhone={auth.phone}
        onSelect={setSelectedCountryIso2}
        onBack={() => setShowCountrySelection(false)}
      />
    );
  }

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={0}
      style={styles.keyboardAvoid}
      enabled={true}
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
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingBottom: Platform.OS === 'web' ? 36 : paddingBottom,
                },
              ]}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
            >
              <View style={styles.content}>
                {auth.step === 'phone' && (
                  <React.Fragment key='phone-step'>
                    <Text style={styles.mainTitle}>
                      {t('auth.connectTelegram')}
                    </Text>
                    <Text style={styles.secondaryText}>
                      {t('auth.connectTelegramSubtitle')}
                    </Text>
                    <View style={styles.phoneInputContainer}>
                      <CountryCodePicker
                        selectedIso2={selectedCountryIso2}
                        onSelect={() => setShowCountrySelection(true)}
                      />
                      <View style={styles.phoneInputWrapper}>
                        <TextInput
                          style={styles.phoneInput}
                          placeholder=''
                          keyboardType='phone-pad'
                          value={auth.phone}
                          onChangeText={handleChangePhone}
                          autoFocus={Platform.OS === 'web'}
                          inputMode='numeric'
                          selectionColor='#34C759'
                          keyboardAppearance='dark'
                          onFocus={() => {
                            // Scroll to bottom on Android when phone input is focused
                            if (Platform.OS === 'android') {
                              setTimeout(() => {
                                scrollViewRef.current?.scrollToEnd({ animated: true });
                              }, 100);
                            }
                          }}
                        />
                        {!auth.phone && (
                          <Text style={styles.phoneInputPlaceholder}>
                            555 44 32
                          </Text>
                        )}
                      </View>
                    </View>
                  </React.Fragment>
                )}
                {auth.step === 'code' && (
                  <React.Fragment key='code-step'>
                    <Text style={styles.codeTitle}>
                      {t('auth.enterCodeTitle')}
                    </Text>
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
                            onPress={() => {
                              codeInputRefs.current[index]?.focus();
                            }}
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
                                  onChangeText={(value) =>
                                    handleCodeChange(value, index)
                                  }
                                  onKeyPress={(e) => handleCodeKeyPress(e, index)}
                                  onFocus={() => {
                                    setFocusedInputIndex(index);
                                    // Scroll to bottom on Android when code input is focused
                                    if (Platform.OS === 'android') {
                                      setTimeout(() => {
                                        scrollViewRef.current?.scrollToEnd({ animated: true });
                                      }, 100);
                                    }
                                  }}
                                  onBlur={() => setFocusedInputIndex(null)}
                                  keyboardType='number-pad'
                                  keyboardAppearance='dark'
                                  maxLength={index === 0 ? 5 : 1}
                                  textContentType={index === 0 ? 'oneTimeCode' : 'none'}
                                  autoComplete={index === 0 ? ('sms-otp' as any) : 'off'}
                                  selectTextOnFocus
                                  selectionColor='#34C759'
                                  textAlign='center'
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
                  </React.Fragment>
                )}
                {auth.step === 'password' && (
                  <React.Fragment key='password-step'>
                    <Text style={styles.codeTitle}>
                      {t('auth.enterPasswordTitle')}
                    </Text>
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
                        start={{ x: 0.50, y: 0 }}
                        end={{ x: 0.515, y: 1 }}
                        style={styles.passwordInputBorder}
                      >
                        <View style={styles.passwordInputWrapper}>
                          <TextInput
                            style={styles.passwordInput}
                            placeholder=''
                            secureTextEntry={!showPassword}
                            keyboardAppearance='dark'
                            value={password}
                            onChangeText={setPassword}
                            autoFocus={Platform.OS === 'web'}
                            selectionColor='#34C759'
                            placeholderTextColor='#C5C1B9'
                            onFocus={() => {
                              // Scroll to bottom on Android when password input is focused
                              if (Platform.OS === 'android') {
                                setTimeout(() => {
                                  scrollViewRef.current?.scrollToEnd({ animated: true });
                                }, 100);
                              }
                            }}
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
                              contentFit='contain'
                              tintColor='#fff'
                            />
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </View>
                  </React.Fragment>
                )}
                {status ? <Text style={styles.status}>{status}</Text> : null}
              </View>

              <Animated.View
                style={[
                  styles.buttonContainer,
                  Platform.OS === 'android' && {
                    transform: [{ translateY: buttonBottomAnim }],
                  },
                ]}
              >
                {auth.step === 'phone' && (
                  <GlassButton
                    title={isLoading ? t('auth.sending') : t('auth.getCode')}
                    onPress={handleSendCode}
                    disabled={isLoading}
                  />
                )}
                {auth.step === 'code' && (
                  <ResendButton
                    title={t('auth.resend')}
                    onPress={handleSendCode}
                    disabled={isLoading}
                    width={141}
                    height={32}
                    fontSize={12}
                  />
                )}
                {auth.step === 'password' && (
                  <GlassButton
                    title={
                      isVerifyingPassword ? t('auth.sending') : t('auth.submitPassword')
                    }
                    onPress={handleSubmitPassword}
                    disabled={isVerifyingPassword}
                  />
                )}
              </Animated.View>
            </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 34,
    paddingBottom: 26,
    paddingTop: 110,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 110,
    paddingHorizontal: 24,
    ...(Platform.OS === 'web' && {
      maxWidth: 500,
      width: '100%',
      alignSelf: 'center',
    }),
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest_600SemiBold',
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
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none' as any,
      WebkitAppearance: 'none' as any,
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
      android: 'Onest_600SemiBold',
      web: 'Onest, sans-serif',
    }),
    // lineHeight: 17,
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
      android: 'Onest_600SemiBold',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 48,
    letterSpacing: 2,
    textAlign: 'left',
    textAlignVertical: 'center',
    pointerEvents: 'none',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    width: '100%',
  },
  status: {
    marginTop: 12,
    textAlign: 'center',
    color: '#FE3F21',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 20,
    letterSpacing: 0,
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
      android: 'Onest_600SemiBold',
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  codeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest_600SemiBold',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 22,
    letterSpacing: 0,
  },
  codeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 44,
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 20,
    letterSpacing: 0,
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
  codeCursor: {
    position: 'absolute',
    width: 2,
    height: 24,
    backgroundColor: '#34C759',
    borderRadius: 1,
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
      android: 'Onest_600SemiBold',
      web: 'Onest, sans-serif',
    }),
    // lineHeight: 17,
    // letterSpacing: 12,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none' as any,
      WebkitAppearance: 'none' as any,
    }),
  },
  resendButtonContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 26,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
  },
});
