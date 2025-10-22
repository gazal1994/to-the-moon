import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { styles } from '../SearchScreen/SearchScreen.styles';

const EditProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update your information</Text>
      </View>
    </SafeAreaView>
  );
};

export default EditProfileScreen;