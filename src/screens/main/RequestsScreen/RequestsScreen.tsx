import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants';
import ReceivedRequestsScreen from '../ReceivedRequestsScreen/ReceivedRequestsScreen';
import SentRequestsScreen from '../SentRequestsScreen/SentRequestsScreen';

const RequestsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      {/* Custom Tab Header */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 16,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'received' ? COLORS.primary : 'transparent',
          }}
          onPress={() => setActiveTab('received')}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: activeTab === 'received' ? COLORS.primary : COLORS.textSecondary,
          }}>
            Received
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 16,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'sent' ? COLORS.primary : 'transparent',
          }}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: activeTab === 'sent' ? COLORS.primary : COLORS.textSecondary,
          }}>
            Sent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'received' ? <ReceivedRequestsScreen /> : <SentRequestsScreen />}
      </View>
    </SafeAreaView>
  );
};

export default RequestsScreen;