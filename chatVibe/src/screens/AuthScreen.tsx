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

export function AuthScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(selectAuth);

  const [code, setCode] = useState(['', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('+7');
  const [focusedInputIndex, setFocusedInputIndex] = useState<number | null>(0);
  const [showCountrySelection, setShowCountrySelection] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const codeInputRefs = useRef<(TextInput | null)[]>([]);
  const isVerifyingRef = useRef(false);
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
      dispatch(setStep('code'));
      setPassword('');
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
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
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

  const handleSendCode = async () => {
    const phoneNumber = auth.phone.trim();
    if (!phoneNumber) {
      setStatus('Please enter a phone number');
      return;
    }
    const phone = `${countryCode}${phoneNumber}`;
    // setStatus('Sending verification code...');
    try {
      const res = await sendCode({ phone }).unwrap();
      //   setStatus(res.message || 'Code sent! Check your Telegram app');
    } catch {
      setStatus('Failed to send code. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 5) {
      setStatus('Please enter the verification code');
      return;
    }
    // setStatus('Verifying code...');
    try {
      const phoneNumber = auth.phone.trim();
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
      }
    } catch {
      setStatus('Failed to verify code. Please try again.');
      setCodeError(true);
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
      }
    } catch {
      setStatus('Failed to verify password. Please try again.');
    }
  };

  if (showCountrySelection) {
    return (
      <CountrySelectionScreen
        selectedCode={countryCode}
        currentPhone={auth.phone}
        onSelect={setCountryCode}
        onBack={() => setShowCountrySelection(false)}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <BackgroundWrapper showGlow showHeader>
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
            disabled={Platform.OS === 'web'}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
            >
              <View style={styles.content}>
                {auth.step === 'phone' && (
                  <React.Fragment key='phone-step'>
                    <Text style={styles.mainTitle}>Подключите Telegram</Text>
                    <Text style={styles.secondaryText}>
                      Чтобы проанализировать чат, нам нужен временный доступ к
                      вашей переписке
                    </Text>
                    <View style={styles.phoneInputContainer}>
                      <CountryCodePicker
                        selectedCode={countryCode}
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
                    <Text style={styles.codeTitle}>Введите код</Text>
                    <Text style={styles.codeSubtitle}>
                      Код отправлен на {countryCode} {auth.phone}
                    </Text>
                    <View style={styles.codeInputsContainer}>
                      {code.map((digit, index) => {
                        const isFocused = focusedInputIndex === index;
                        return (
                          <LinearGradient
                            key={index}
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
                                onFocus={() => setFocusedInputIndex(index)}
                                onBlur={() => setFocusedInputIndex(null)}
                                keyboardType='number-pad'
                                maxLength={1}
                                selectTextOnFocus
                                selectionColor='#34C759'
                                textAlign='center'
                                {...(Platform.OS === 'web' && {
                                  caretColor: '#34C759',
                                })}
                              />
                              {isFocused && !digit && (
                                <View style={styles.codeCursor} />
                              )}
                            </LinearGradient>
                          </LinearGradient>
                        );
                      })}
                    </View>
                  </React.Fragment>
                )}
                {auth.step === 'password' && (
                  <React.Fragment key='password-step'>
                    <TouchableOpacity
                      onPress={handleBack}
                      style={styles.backButton}
                    >
                      <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <View style={styles.passwordRow}>
                      <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder='Password'
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        autoFocus={Platform.OS === 'web'}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword((v) => !v)}
                        style={styles.togglePasswordButton}
                      >
                        <Text style={styles.togglePasswordText}>
                          {showPassword ? 'Hide' : 'Show'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                )}
                {status ? <Text style={styles.status}>{status}</Text> : null}
              </View>

              <View style={styles.buttonContainer}>
                {auth.step === 'phone' && (
                  <GlassButton
                    title={isLoading ? 'Sending...' : 'Получить код'}
                    onPress={handleSendCode}
                    disabled={isLoading}
                  />
                )}
                {auth.step === 'code' && (
                  <ResendButton
                    title='Отправить снова'
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
                      isVerifyingPassword ? 'Verifying...' : 'Submit password'
                    }
                    onPress={handleSubmitPassword}
                    disabled={isVerifyingPassword}
                  />
                )}
              </View>
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
    paddingHorizontal: 24,
    paddingTop: 110,
    paddingBottom: 26,
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
    marginBottom: 12,
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
    marginBottom: 24,
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
    lineHeight: 17,
    letterSpacing: 2,
    textAlign: 'left',
    textAlignVertical: 'bottom',
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  togglePasswordButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  togglePasswordText: {
    color: '#007AFF',
    fontSize: 14,
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
    marginBottom: 40,
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
    gap: 4,
    marginBottom: 40,
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
    paddingLeft: 24,
    paddingRight: 24,
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
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest_600SemiBold',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 17,
    letterSpacing: 12,
    padding: 0,
    margin: 0,
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
