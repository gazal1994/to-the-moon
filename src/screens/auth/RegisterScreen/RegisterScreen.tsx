import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '../../../components';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { registerUser } from '../../../store/slices/authSlice';
import { ScreenProps, RegisterRequest } from '../../../types';
import { validateEmail, validatePassword, validateName } from '../../../utils';
import { styles } from './RegisterScreen.styles';

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
  agreeToTerms: boolean;
}

const RegisterScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    if (!data.agreeToTerms) {
      Alert.alert('Terms Required', 'Please agree to the terms and conditions');
      return;
    }

    try {
      const { confirmPassword, agreeToTerms, ...registerData } = data;
      const result = await dispatch(registerUser(registerData)).unwrap();
      
      if (result) {
        Alert.alert(
          'Registration Successful',
          'Please check your email to verify your account',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('RoleSelection'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error || 'Failed to create account');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Aqra to start learning</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            rules={{
              required: 'Name is required',
              validate: (value) => validateName(value) || 'Name must be at least 2 characters',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                leftIcon="person-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              validate: (value) => validateEmail(value) || 'Invalid email format',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="Enter your email"
                leftIcon="mail-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Phone Number"
                placeholder="Enter your phone number (optional)"
                leftIcon="call-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
                keyboardType="phone-pad"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              validate: (value) => {
                const validation = validatePassword(value);
                return validation.isValid || validation.errors[0];
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Create a password"
                leftIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry
                required
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                leftIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                secureTextEntry
                required
              />
            )}
          />

          <Controller
            control={control}
            name="agreeToTerms"
            rules={{
              required: 'You must agree to the terms and conditions',
            }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.termsContainer}>
                <TouchableOpacity 
                  style={[
                    styles.checkbox,
                    value ? styles.checkboxChecked : styles.checkboxUnchecked
                  ]}
                  onPress={() => onChange(!value)}
                >
                  {value && <Text style={styles.checkboxText}>✓</Text>}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.termsTextContainer}
                  onPress={() => onChange(!value)}
                >
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text style={styles.link}>Terms and Conditions</Text> and{' '}
                    <Text style={styles.link}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.agreeToTerms && (
            <Text style={styles.errorText}>{errors.agreeToTerms.message}</Text>
          )}

          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            style={styles.signUpButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;