import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useRTL } from '../../../hooks/useRTL';
import { styles } from './HelpSupportScreen.styles';

const HelpSupportScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isRTL, textAlign, flexDirection } = useRTL();

  const handleEmailPress = async () => {
    const email = 'gazal.eg.94@gmail.com';
    const subject = 'Aqra App Support Request';
    const body = 'Hello,\n\nI need help with the Aqra app.\n\nDescription of issue:\n\n';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          t('helpSupport.noEmailApp'),
          `${t('helpSupport.copyEmail')}: ${email}`,
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.ok'), onPress: () => {} }
          ]
        );
      }
    } catch (error) {
      Alert.alert(t('helpSupport.emailError'), t('helpSupport.tryAgain'));
    }
  };

  const appDetails = {
    name: 'Aqra',
    version: '1.0.0',
    developer: 'Aqra Team',
    email: 'gazal.eg.94@gmail.com',
    description: t('helpSupport.appDescription')
  };

  const supportTopics = [
    {
      title: t('helpSupport.topics.accountIssues'),
      description: t('helpSupport.topics.accountIssuesDesc'),
      icon: '👤'
    },
    {
      title: t('helpSupport.topics.technicalSupport'),
      description: t('helpSupport.topics.technicalSupportDesc'),
      icon: '🔧'
    },
    {
      title: t('helpSupport.topics.paymentHelp'),
      description: t('helpSupport.topics.paymentHelpDesc'),
      icon: '💳'
    },
    {
      title: t('helpSupport.topics.generalQuestions'),
      description: t('helpSupport.topics.generalQuestionsDesc'),
      icon: '❓'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.backButton, { [isRTL ? 'right' : 'left']: 0 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{isRTL ? '→' : '←'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { textAlign }]}>{t('helpSupport.title')}</Text>
        </View>

        {/* App Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.appIcon}>📚</Text>
            <View style={styles.appInfo}>
              <Text style={[styles.appName, { textAlign }]}>{appDetails.name}</Text>
              <Text style={[styles.appVersion, { textAlign }]}>
                {t('helpSupport.version')}: {appDetails.version}
              </Text>
            </View>
          </View>
          <Text style={[styles.appDescription, { textAlign }]}>
            {appDetails.description}
          </Text>
          <View style={styles.developerInfo}>
            <Text style={[styles.developerLabel, { textAlign }]}>
              {t('helpSupport.developedBy')}:
            </Text>
            <Text style={[styles.developerName, { textAlign }]}>
              {appDetails.developer}
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { textAlign }]}>
            {t('helpSupport.contactUs')}
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleEmailPress}
            activeOpacity={0.8}
          >
            <Text style={styles.contactIcon}>✉️</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { textAlign }]}>
                {t('helpSupport.email')}
              </Text>
              <Text style={[styles.contactValue, { textAlign }]}>
                {appDetails.email}
              </Text>
            </View>
            <Text style={styles.contactArrow}>{isRTL ? '←' : '→'}</Text>
          </TouchableOpacity>
        </View>

        {/* Support Topics */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { textAlign }]}>
            {t('helpSupport.commonTopics')}
          </Text>
          {supportTopics.map((topic, index) => (
            <View key={index} style={styles.topicItem}>
              <Text style={styles.topicIcon}>{topic.icon}</Text>
              <View style={styles.topicContent}>
                <Text style={[styles.topicTitle, { textAlign }]}>
                  {topic.title}
                </Text>
                <Text style={[styles.topicDescription, { textAlign }]}>
                  {topic.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { textAlign }]}>
            {t('helpSupport.faq')}
          </Text>
          <Text style={[styles.faqText, { textAlign }]}>
            {t('helpSupport.faqDescription')}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { textAlign }]}>
            {t('helpSupport.thankYou')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupportScreen;