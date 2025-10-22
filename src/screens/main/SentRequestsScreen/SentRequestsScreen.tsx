import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../SearchScreen/SearchScreen.styles';

const SentRequestsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sent Requests</Text>
        <Text style={styles.subtitle}>Track your lesson requests</Text>
      </View>
    </SafeAreaView>
  );
};

export default SentRequestsScreen;