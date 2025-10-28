import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input, LanguageSelector } from '../../../components';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { registerUser } from '../../../store/slices/authSlice';
import { ScreenProps, RegisterRequest } from '../../../types';
import { validateEmail, validatePassword, validateName } from '../../../utils';
import { styles } from './RegisterScreen.styles';

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
  agreeToTerms: boolean;
  role: 'student' | 'teacher';
  city?: string;
  country?: string;
  subjects?: string;
  bio?: string;
  experience?: string;
  hourlyRate?: string;
}

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Arabic', 'French', 'Spanish', 'History', 'Geography',
  'Computer Science', 'Economics', 'Accounting', 'Business Studies',
  'Psychology', 'Sociology', 'Philosophy', 'Art', 'Music', 'Physical Education'
];

const SUBJECTS_AR = [
  'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'الإنجليزية',
  'العربية', 'الفرنسية', 'الإسبانية', 'التاريخ', 'الجغرافيا',
  'علوم الحاسوب', 'الاقتصاد', 'المحاسبة', 'إدارة الأعمال',
  'علم النفس', 'علم الاجتماع', 'الفلسفة', 'الفن', 'الموسيقى', 'التربية البدنية'
];

const RegisterScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const subjects = isRTL ? SUBJECTS_AR : SUBJECTS;
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      } else {
        return [...prev, subject];
      }
    });
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (!selectedRole) {
      Alert.alert(
        isRTL ? 'الدور مطلوب' : 'Role Required',
        isRTL ? 'الرجاء اختيار دورك (طالب أو معلم)' : 'Please select your role (Student or Teacher)'
      );
      return;
    }

    if (selectedRole === 'teacher' && selectedSubjects.length === 0) {
      Alert.alert(
        isRTL ? 'المواد مطلوبة' : 'Subjects Required',
        isRTL ? 'الرجاء اختيار مادة واحدة على الأقل تقوم بتدريسها' : 'Please select at least one subject you teach'
      );
      return;
    }

    if (!data.agreeToTerms) {
      Alert.alert(
        isRTL ? 'الشروط مطلوبة' : 'Terms Required',
        isRTL ? 'يرجى الموافقة على الشروط والأحكام' : 'Please agree to the terms and conditions'
      );
      return;
    }

    try {
      const { confirmPassword, agreeToTerms, ...registerData } = data;
      
      // Prepare the registration payload
      const payload: RegisterRequest = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        role: selectedRole,
        phone: registerData.phone,
        country: registerData.country,
        city: registerData.city,
        subjects: selectedSubjects, // Send as array
        bio: registerData.bio,
        experience: registerData.experience,
        hourlyRate: registerData.hourlyRate ? parseFloat(registerData.hourlyRate) : undefined,
      };
      
      const result = await dispatch(registerUser(payload)).unwrap();
      
      if (result) {
        Alert.alert(
          isRTL ? 'تم التسجيل بنجاح' : 'Registration Successful',
          isRTL ? 'مرحباً بك في أقرأ!' : 'Welcome to Aqra!',
          [
            {
              text: isRTL ? 'حسناً' : 'OK',
              onPress: () => navigation.navigate('Main'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        isRTL ? 'فشل التسجيل' : 'Registration Failed',
        error || (isRTL ? 'فشل في إنشاء الحساب' : 'Failed to create account')
      );
    }
  };

  const renderRoleSelection = () => (
    <View style={styles.roleSelection}>
      <Text style={[styles.roleTitle, isRTL && { textAlign: 'right' }]}>
        {isRTL ? 'أنا:' : 'I am a:'}
      </Text>
      <View style={styles.roleButtons}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            selectedRole === 'student' && styles.roleButtonActive
          ]}
          onPress={() => setSelectedRole('student')}
        >
          <Text style={styles.roleIcon}>🎓</Text>
          <Text style={[
            styles.roleButtonText,
            selectedRole === 'student' && styles.roleButtonTextActive
          ]}>{isRTL ? 'طالب' : 'Student'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            selectedRole === 'teacher' && styles.roleButtonActive
          ]}
          onPress={() => setSelectedRole('teacher')}
        >
          <Text style={styles.roleIcon}>👨‍🏫</Text>
          <Text style={[
            styles.roleButtonText,
            selectedRole === 'teacher' && styles.roleButtonTextActive
          ]}>{isRTL ? 'معلم' : 'Teacher'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LanguageSelector style={styles.languageSelector} />
          <Text style={[styles.title, isRTL && { textAlign: 'right' }]}>
            {isRTL ? 'إنشاء حساب' : 'Create Account'}
          </Text>
          <Text style={[styles.subtitle, isRTL && { textAlign: 'right' }]}>
            {isRTL ? 'انضم إلى أقرأ لبدء رحلتك' : 'Join Aqra to start your journey'}
          </Text>
        </View>

        {renderRoleSelection()}

        {selectedRole && (
          <View style={styles.form}>
            {/* Basic Information */}
            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>
              {isRTL ? '📋 المعلومات الأساسية' : '📋 Basic Information'}
            </Text>
            
            <Controller
              control={control}
              name="name"
              rules={{
                required: isRTL ? 'الاسم مطلوب' : 'Name is required',
                validate: (value) => validateName(value) || (isRTL ? 'يجب أن يكون الاسم حرفين على الأقل' : 'Name must be at least 2 characters'),
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={isRTL ? 'الاسم الكامل' : 'Full Name'}
                  placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  leftIcon="person-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              rules={{
                required: isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required',
                validate: (value) => validateEmail(value) || (isRTL ? 'تنسيق البريد الإلكتروني غير صالح' : 'Invalid email format'),
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={isRTL ? 'البريد الإلكتروني' : 'Email'}
                  placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  leftIcon="mail-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              rules={{
                required: isRTL ? 'رقم الهاتف مطلوب' : 'Phone number is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={isRTL ? 'رقم الهاتف' : 'Phone Number'}
                  placeholder={isRTL ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                  leftIcon="call-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                  required
                />
              )}
            />

            {/* Location Information */}
            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>
              {isRTL ? '📍 الموقع' : '📍 Location'}
            </Text>

            <Controller
              control={control}
              name="country"
              rules={{
                required: isRTL ? 'البلد مطلوب' : 'Country is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={isRTL ? 'البلد' : 'Country'}
                  placeholder={isRTL ? 'مثال: فلسطين، الأردن، مصر' : 'e.g., Palestine, Jordan, Egypt'}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.country?.message}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="city"
              rules={{
                required: isRTL ? 'المدينة مطلوبة' : 'City is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={isRTL ? 'المدينة' : 'City'}
                  placeholder={isRTL ? 'مثال: رام الله، عمّان، القاهرة' : 'e.g., Ramallah, Amman, Cairo'}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.city?.message}
                  required
                />
              )}
            />

            {/* Role-Specific Fields */}
            {selectedRole === 'teacher' && (
              <>
                <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>
                  {isRTL ? '👨‍🏫 معلومات المعلم' : '👨‍🏫 Teacher Information'}
                </Text>

                <View style={styles.subjectsContainer}>
                  <Text style={[styles.subjectsLabel, isRTL && { textAlign: 'right' }]}>
                    {isRTL ? 'المواد التي تدرسها' : 'Subjects You Teach'} <Text style={styles.required}>*</Text>
                  </Text>
                  <Text style={[styles.subjectsHint, isRTL && { textAlign: 'right' }]}>
                    {isRTL ? 'اختر جميع المواد التي تدرسها' : 'Select all subjects you teach'}
                  </Text>
                  <View style={styles.subjectsGrid}>
                    {subjects.map((subject, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.subjectChip,
                          selectedSubjects.includes(SUBJECTS[index]) && styles.subjectChipSelected
                        ]}
                        onPress={() => toggleSubject(SUBJECTS[index])}
                      >
                        <Text style={[
                          styles.subjectChipText,
                          selectedSubjects.includes(SUBJECTS[index]) && styles.subjectChipTextSelected
                        ]}>
                          {subject}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {selectedSubjects.length > 0 && (
                    <Text style={[styles.selectedCount, isRTL && { textAlign: 'right' }]}>
                      {isRTL 
                        ? `${selectedSubjects.length} ${selectedSubjects.length === 1 ? 'مادة' : selectedSubjects.length === 2 ? 'مادتان' : 'مواد'} محددة`
                        : `${selectedSubjects.length} subject${selectedSubjects.length !== 1 ? 's' : ''} selected`
                      }
                    </Text>
                  )}
                </View>

                <Controller
                  control={control}
                  name="experience"
                  rules={{
                    required: isRTL ? 'الخبرة مطلوبة للمعلمين' : 'Experience is required for teachers',
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label={isRTL ? 'سنوات الخبرة' : 'Years of Experience'}
                      placeholder={isRTL ? 'مثال: 5 سنوات' : 'e.g., 5 years'}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.experience?.message}
                      required
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="hourlyRate"
                  rules={{
                    required: isRTL ? 'الأجر بالساعة مطلوب للمعلمين' : 'Hourly rate is required for teachers',
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label={isRTL ? 'الأجر بالساعة (دولار أمريكي)' : 'Hourly Rate (USD)'}
                      placeholder={isRTL ? 'مثال: 25' : 'e.g., 25'}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.hourlyRate?.message}
                      keyboardType="numeric"
                      required
                    />
                  )}
                />
              </>
            )}

            {selectedRole === 'student' && (
              <>
                <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>
                  {isRTL ? '🎓 معلومات الطالب' : '🎓 Student Information'}
                </Text>

                <View style={styles.subjectsContainer}>
                  <Text style={[styles.subjectsLabel, isRTL && { textAlign: 'right' }]}>
                    {isRTL ? 'المواد التي تهمك' : 'Subjects of Interest'}
                  </Text>
                  <Text style={[styles.subjectsHint, isRTL && { textAlign: 'right' }]}>
                    {isRTL ? 'اختر المواد التي تريد تعلمها (اختياري)' : 'Select subjects you want to learn (optional)'}
                  </Text>
                  <View style={styles.subjectsGrid}>
                    {subjects.map((subject, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.subjectChip,
                          selectedSubjects.includes(SUBJECTS[index]) && styles.subjectChipSelected
                        ]}
                        onPress={() => toggleSubject(SUBJECTS[index])}
                      >
                        <Text style={[
                          styles.subjectChipText,
                          selectedSubjects.includes(SUBJECTS[index]) && styles.subjectChipTextSelected
                        ]}>
                          {subject}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {selectedSubjects.length > 0 && (
                    <Text style={[styles.selectedCount, isRTL && { textAlign: 'right' }]}>
                      {isRTL 
                        ? `${selectedSubjects.length} ${selectedSubjects.length === 1 ? 'مادة' : selectedSubjects.length === 2 ? 'مادتان' : 'مواد'} محددة`
                        : `${selectedSubjects.length} subject${selectedSubjects.length !== 1 ? 's' : ''} selected`
                      }
                    </Text>
                  )}
                </View>
              </>
            )}

            {/* Bio for both roles */}
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={isRTL ? 'عن نفسك' : 'About You'}
                  placeholder={selectedRole === 'teacher' 
                    ? isRTL 
                      ? "أخبر الطلاب عن خبرتك في التدريس..."
                      : "Tell students about your teaching experience..." 
                    : isRTL 
                      ? "أخبرنا عن أهدافك في التعلم..."
                      : "Tell us about your learning goals..."
                  }
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.bio?.message}
                  multiline
                />
              )}
            />

            {/* Security */}
            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>
              {isRTL ? '🔒 الأمان' : '🔒 Security'}
            </Text>

            <Controller
              control={control}
              name="password"
              rules={{
                required: isRTL ? 'كلمة المرور مطلوبة' : 'Password is required',
                validate: (value) => {
                  const validation = validatePassword(value);
                  return validation.isValid || (isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : validation.errors[0]);
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={isRTL ? 'كلمة المرور' : 'Password'}
                  placeholder={isRTL ? 'أنشئ كلمة مرور (6 أحرف على الأقل)' : 'Create a password (min 6 characters)'}
                  leftIcon="lock-closed-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: isRTL ? 'الرجاء تأكيد كلمة المرور' : 'Please confirm your password',
                validate: (value) => value === password || (isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'),
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  placeholder={isRTL ? 'أكّد كلمة المرور' : 'Confirm your password'}
                  leftIcon="lock-closed-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  secureTextEntry
                  required
                />
              )}
            />

            <Controller
              name="agreeToTerms"
              control={control}
              rules={{
                required: isRTL ? 'يجب الموافقة على الشروط والأحكام' : 'You must agree to the terms and conditions',
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.termsContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.checkbox,
                      value ? styles.checkboxChecked : styles.checkboxUnchecked
                    ]}
                    onPress={() => onChange(!value)}
                  >
                    {value && <Text style={styles.checkboxText}>✓</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.termsTextContainer}
                    onPress={() => onChange(!value)}
                  >
                    <Text style={[styles.termsText, isRTL && { textAlign: 'right' }]}>
                      {isRTL ? (
                        <>
                          أوافق على{' '}
                          <Text style={styles.link}>الشروط والأحكام</Text>
                          {' '}و{' '}
                          <Text style={styles.link}>سياسة الخصوصية</Text>
                        </>
                      ) : (
                        <>
                          I agree to the{' '}
                          <Text style={styles.link}>Terms and Conditions</Text> and{' '}
                          <Text style={styles.link}>Privacy Policy</Text>
                        </>
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.agreeToTerms && (
              <Text style={styles.errorText}>{errors.agreeToTerms.message}</Text>
            )}

            <Button
              title={isRTL ? 'إنشاء حساب' : 'Create Account'}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              fullWidth
              style={styles.signUpButton}
            />
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, isRTL && { textAlign: 'center' }]}>
            {isRTL ? 'هل لديك حساب بالفعل؟ ' : 'Already have an account? '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInLink}>{isRTL ? 'تسجيل الدخول' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;