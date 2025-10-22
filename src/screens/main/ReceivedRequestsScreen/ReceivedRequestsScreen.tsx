import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../SearchScreen/SearchScreen.styles';

const ReceivedRequestsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Received Requests</Text>
        <Text style={styles.subtitle}>Manage incoming lesson requests</Text>
      </View>
    </SafeAreaView>
  );
};

export default ReceivedRequestsScreen;