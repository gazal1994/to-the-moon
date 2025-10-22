import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { styles } from '../SearchScreen/SearchScreen.styles';

const ChatScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.subtitle}>Individual conversation</Text>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;