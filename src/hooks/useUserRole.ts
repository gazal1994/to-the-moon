import { useAppSelector } from '../store/hooks';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../types';

export const useUserRole = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();
  
  const isStudent = user?.role === UserRole.STUDENT;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isParent = user?.role === UserRole.PARENT;
  const isAdmin = user?.role === UserRole.ADMIN;
  
  const getGreeting = () => {
    const firstName = user?.name?.split(' ')[0] || 'User';
    return t('home.welcome', { name: firstName });
  };
  
  const getSubtitle = () => {
    switch (user?.role) {
      case UserRole.STUDENT:
        return t('home.studentSubtitle');
      case UserRole.TEACHER:
        return t('home.teacherSubtitle');
      case UserRole.PARENT:
        return t('home.parentSubtitle');
      case UserRole.ADMIN:
        return t('home.adminSubtitle');
      default:
        return t('home.defaultSubtitle');
    }
  };
  
  const getDashboardContent = () => {
    if (isStudent) {
      return {
        primaryAction: t('home.actions.searchTeachers'),
        primaryDescription: t('home.actions.searchTeachersDesc'),
        secondaryAction: t('home.actions.myLessons'),
        secondaryDescription: t('home.actions.myLessonsDesc'),
        tertiaryAction: t('home.actions.learningProgress'),
        tertiaryDescription: t('home.actions.learningProgressDesc')
      };
    }
    
    if (isTeacher) {
      return {
        primaryAction: t('home.actions.manageProfile'),
        primaryDescription: t('home.actions.manageProfileDesc'),
        secondaryAction: t('home.actions.studentRequests'),
        secondaryDescription: t('home.actions.studentRequestsDesc'),
        tertiaryAction: t('home.actions.teachingSchedule'),
        tertiaryDescription: t('home.actions.teachingScheduleDesc')
      };
    }
    
    return {
      primaryAction: t('home.actions.gettingStarted'),
      primaryDescription: t('home.actions.gettingStartedDesc'),
      secondaryAction: t('home.actions.explore'),
      secondaryDescription: t('home.actions.exploreDesc'),
      tertiaryAction: t('home.actions.helpSupport'),
      tertiaryDescription: t('home.actions.helpSupportDesc')
    };
  };
  
  return {
    user,
    isStudent,
    isTeacher,
    isParent,
    isAdmin,
    getGreeting,
    getSubtitle,
    getDashboardContent,
  };
};