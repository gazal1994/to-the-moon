import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const DevModeIndicator: React.FC = () => {
  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🔧 DEV MODE - Using mock data</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: COLORS.linkedinBlue + '90',
    paddingVertical: 4,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default DevModeIndicator;