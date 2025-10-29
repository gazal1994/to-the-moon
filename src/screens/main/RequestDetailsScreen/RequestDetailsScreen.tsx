import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../SearchScreen/SearchScreen.styles';

const RequestDetailsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Request Details</Text>
        <Text style={styles.subtitle}>View lesson request information</Text>
      </View>
    </SafeAreaView>
  );
};

export default RequestDetailsScreen;