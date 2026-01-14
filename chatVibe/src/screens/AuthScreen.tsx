import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
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
import Toast from 'react-native-toast-message';

export function AuthScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(selectAuth);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [sendCode, { isLoading }] = useSendCodeMutation();
  const [signIn, { isLoading: isVerifyingCode }] = useSignInMutation();
  const [submitPassword, { isLoading: isVerifyingPassword }] =
    useSubmitPasswordMutation();

  const handleChangePhone = (value: string) => {
    const cleaned = value.replace(/\s/g, '').replace(/\+/g, '');
    dispatch(setPhone(cleaned));
  };

  const handleBack = () => {
    if (auth.step === 'code') {
      dispatch(setStep('phone'));
      setCode('');
      setStatus(null);
    } else if (auth.step === 'password') {
      dispatch(setStep('code'));
      setPassword('');
      setStatus(null);
    }
  };

  const handleSendCode = async () => {
    const phoneNumber = auth.phone.trim();
    if (!phoneNumber) {
      setStatus('Please enter a phone number');
      return;
    }
    const phone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    setStatus('Sending verification code...');
    Toast.show({ type: 'info', text1: 'Sending verification code...' });
    try {
      const res = await sendCode({ phone }).unwrap();
      setStatus(res.message || 'Code sent! Check your Telegram app');
      Toast.show({
        type: 'success',
        text1: 'Code sent',
        text2: res.message || 'Check your Telegram app',
      });
    } catch {
      setStatus('Failed to send code. Please try again.');
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'Failed to send code. Please try again.',
      });
    }
  };

  const handleVerifyCode = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setStatus('Please enter the verification code');
      Toast.show({
        type: 'error',
        text1: 'Invalid code',
        text2: 'Please enter the verification code',
      });
      return;
    }
    setStatus('Verifying code...');
    Toast.show({ type: 'info', text1: 'Verifying code...' });
    try {
      const phoneNumber = auth.phone.trim();
      const phone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+${phoneNumber}`;
      const res = await signIn({
        phone,
        code: trimmedCode,
      }).unwrap();
      if (res.needPassword) {
        setStatus('2FA enabled. Please enter your password');
        Toast.show({
          type: 'info',
          text1: '2FA required',
          text2: 'Please enter your password',
        });
      } else if (res.success) {
        setStatus('Successfully authenticated!');
        Toast.show({
          type: 'success',
          text1: 'Authenticated',
          text2: 'Successfully authenticated!',
        });
      } else {
        setStatus(res.error || 'Invalid code');
        Toast.show({
          type: 'error',
          text1: 'Invalid code',
          text2: res.error || 'Invalid code',
        });
      }
    } catch {
      setStatus('Failed to verify code. Please try again.');
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'Failed to verify code. Please try again.',
      });
    }
  };

  const handleSubmitPassword = async () => {
    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      setStatus('Please enter your password');
      Toast.show({
        type: 'error',
        text1: 'Missing password',
        text2: 'Please enter your password',
      });
      return;
    }
    setStatus('Verifying password...');
    Toast.show({ type: 'info', text1: 'Verifying password...' });
    try {
      const res = await submitPassword({ password: trimmedPassword }).unwrap();
      if (res.success) {
        setStatus('Successfully authenticated!');
        Toast.show({
          type: 'success',
          text1: 'Authenticated',
          text2: 'Successfully authenticated!',
        });
      } else {
        setStatus(res.error || 'Invalid password');
        Toast.show({
          type: 'error',
          text1: 'Invalid password',
          text2: res.error || 'Invalid password',
        });
      }
    } catch {
      setStatus('Failed to verify password. Please try again.');
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'Failed to verify password. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Authorization</Text>
          {auth.step === 'phone' && (
            <React.Fragment key='phone-step'>
              <View style={styles.phoneInputContainer}>
                <Text style={styles.phonePrefix}>+</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder='Phone number'
                  keyboardType='phone-pad'
                  value={auth.phone}
                  onChangeText={handleChangePhone}
                />
              </View>
              <Button
                title={isLoading ? 'Sending...' : 'Submit'}
                onPress={handleSendCode}
              />
            </React.Fragment>
          )}
          {auth.step === 'code' && (
            <React.Fragment key='code-step'>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder='Verification code'
                keyboardType='number-pad'
                value={code}
                onChangeText={setCode}
              />
              <Button
                title={isVerifyingCode ? 'Verifying...' : 'Verify'}
                onPress={handleVerifyCode}
              />
            </React.Fragment>
          )}
          {auth.step === 'password' && (
            <React.Fragment key='password-step'>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder='Password'
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
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
              <Button
                title={isVerifyingPassword ? 'Verifying...' : 'Submit password'}
                onPress={handleSubmitPassword}
              />
            </React.Fragment>
          )}
          {status ? <Text style={styles.status}>{status}</Text> : null}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    paddingLeft: 12,
  },
  phonePrefix: {
    fontSize: 16,
    color: '#333',
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 12,
    fontSize: 16,
  },
  status: {
    marginTop: 12,
    textAlign: 'center',
    color: '#333',
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
});
