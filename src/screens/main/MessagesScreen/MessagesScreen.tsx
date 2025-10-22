import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { styles } from '../SearchScreen/SearchScreen.styles';

const MessagesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Chat with your teachers and students</Text>
      </View>
    </SafeAreaView>
  );
};

export default MessagesScreen;