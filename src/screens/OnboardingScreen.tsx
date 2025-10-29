import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components';
import { COLORS, FONT_SIZES } from '../constants/colors';
import { useAppDispatch } from '../store/hooks';
import { completeOnboarding } from '../store/slices/appSlice';

const OnboardingScreen: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleCompleteOnboarding = () => {
    dispatch(completeOnboarding());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Aqra!</Text>
        <Text style={styles.subtitle}>
          Connect with the best teachers and start your learning journey
        </Text>
        <Button
          title="Get Started"
          onPress={handleCompleteOnboarding}
          buttonStyle={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
  },
});

export default OnboardingScreen;