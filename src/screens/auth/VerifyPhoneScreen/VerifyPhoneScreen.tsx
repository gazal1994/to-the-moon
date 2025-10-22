import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './VerifyPhoneScreen.styles';

const VerifyPhoneScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Phone</Text>
        <Text style={styles.subtitle}>This screen will be implemented</Text>
      </View>
    </SafeAreaView>
  );
};

export default VerifyPhoneScreen;