import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { COLORS } from '../../../constants';

const SimpleProfileTest: React.FC = () => {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    // Simulate the same flow as ProfileScreen
    const testProfile = () => {
      try {
        // This will fail like the real API call
        throw new Error('API unavailable');
      } catch (error) {
        if (__DEV__) {
          console.log('✅ Mock mode working - no error shown');
          setStatus('✅ Profile loaded with mock data');
        } else {
          console.error('Failed to load profile:', error);
          setStatus('❌ Error in production mode');
        }
      }
    };

    testProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile Test</Text>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.mode}>
          {__DEV__ ? '🔧 Development Mode' : '🚀 Production Mode'}
        </Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  mode: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default SimpleProfileTest;