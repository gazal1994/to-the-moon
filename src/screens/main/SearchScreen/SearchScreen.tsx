import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  searchTeachers, 
  setSearchQuery, 
  updateFilter, 
  clearFilters, 
  resetSearch,
  toggleFavorite 
} from '../../../store/slices/teachersSlice';
import { RootState, AppDispatch } from '../../../store';
import TeacherCard from '../../../components/TeacherCard';
import { SearchFilters, UserWithProfile, Teacher } from '../../../types';
import { styles } from './SearchScreen.styles';

const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  const {
    teachers,
    favorites,
    isLoading,
    error,
    hasMore,
    currentPage,
    searchQuery,
    filters
  } = useSelector((state: RootState) => state.teachers);

  const [showFilters, setShowFilters] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // LinkedIn-style color palette for teacher cards
  const linkedinColors = [
    '#0a66c2', // LinkedIn blue
    '#0a66c2', // LinkedIn blue
    '#0a66c2', // LinkedIn blue
    '#0a66c2', // LinkedIn blue
    '#0a66c2', // LinkedIn blue
    '#0a66c2', // LinkedIn blue
    '#0a66c2', // LinkedIn blue
  ];

  const getTeacherColor = (index: number) => {
    return linkedinColors[index % linkedinColors.length];
  };

  // Mock data for development
  const mockTeachers: UserWithProfile[] = [
    {
      id: '1',
      email: 'ahmad@example.com',
      firstName: 'Ahmad',
      lastName: 'Ali',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        id: '1',
        userId: '1',
        bio: 'Experienced Arabic teacher with 10 years of experience',
        subjects: ['Arabic', 'Islamic Studies'],
        languages: ['Arabic', 'English'],
        teachingLevel: 'Advanced',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        hourlyRate: 25,
        isVolunteer: false,
        rating: 4.8,
        totalStudents: 120,
        profileImage: null,
        learningModes: ['online', 'in-person'],
        availability: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    {
      id: '2',
      email: 'fatima@example.com',
      firstName: 'Fatima',
      lastName: 'Hassan',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        id: '2',
        userId: '2',
        bio: 'Native Arabic speaker specializing in Quranic studies',
        subjects: ['Quran', 'Arabic', 'Tajweed'],
        languages: ['Arabic', 'English', 'French'],
        teachingLevel: 'Expert',
        city: 'Cairo',
        country: 'Egypt',
        hourlyRate: 0,
        isVolunteer: true,
        rating: 5.0,
        totalStudents: 85,
        profileImage: null,
        learningModes: ['online'],
        availability: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    {
      id: '3',
      email: 'omar@example.com',
      firstName: 'Omar',
      lastName: 'Ibrahim',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        id: '3',
        userId: '3',
        bio: 'Young and energetic teacher focusing on modern Arabic',
        subjects: ['Modern Arabic', 'Conversation'],
        languages: ['Arabic', 'English'],
        teachingLevel: 'Intermediate',
        city: 'Dubai',
        country: 'UAE',
        hourlyRate: 30,
        isVolunteer: false,
        rating: 4.5,
        totalStudents: 65,
        profileImage: null,
        learningModes: ['online', 'in-person'],
        availability: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    {
      id: '4',
      email: 'mohammed@example.com',
      firstName: 'Mohammed',
      lastName: 'Al-Rashid',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        id: '4',
        userId: '4',
        bio: 'Mathematics and Science teacher with engineering background',
        subjects: ['Mathematics', 'Science', 'Physics'],
        languages: ['English', 'Arabic'],
        teachingLevel: 'Advanced',
        city: 'Jeddah',
        country: 'Saudi Arabia',
        hourlyRate: 40,
        isVolunteer: false,
        rating: 4.9,
        totalStudents: 95,
        profileImage: null,
        learningModes: ['online', 'in-person'],
        availability: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    {
      id: '5',
      email: 'sara@example.com',
      firstName: 'Sara',
      lastName: 'Ahmed',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        id: '5',
        userId: '5',
        bio: 'English language specialist and literature enthusiast',
        subjects: ['English', 'Literature', 'Writing'],
        languages: ['English', 'Arabic'],
        teachingLevel: 'Advanced',
        city: 'Dammam',
        country: 'Saudi Arabia',
        hourlyRate: 30,
        isVolunteer: false,
        rating: 4.7,
        totalStudents: 110,
        profileImage: null,
        learningModes: ['online'],
        availability: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    {
      id: '6',
      email: 'layla@example.com',
      firstName: 'Layla',
      lastName: 'Mansour',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        id: '6',
        userId: '6',
        bio: 'Volunteer Islamic Studies teacher with deep knowledge of Fiqh',
        subjects: ['Islamic Studies', 'Fiqh', 'Arabic'],
        languages: ['Arabic', 'English'],
        teachingLevel: 'Intermediate',
        city: 'Mecca',
        country: 'Saudi Arabia',
        hourlyRate: 0,
        isVolunteer: true,
        rating: 4.8,
        totalStudents: 60,
        profileImage: null,
        learningModes: ['online', 'in-person'],
        availability: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  ];

  useEffect(() => {
    // Load initial data with mock fallback
    handleSearch(true);
  }, []);

  useEffect(() => {
    // Trigger search when filters change
    if (Object.keys(filters).length > 0 || selectedPriceRange || selectedLocation || selectedSubject) {
      handleSearch(true);
    }
  }, [filters, selectedPriceRange, selectedLocation, selectedSubject]);

  const handleSearch = useCallback(async (refresh = false) => {
    try {
      // In development, use mock data directly
      if (__DEV__) {
        console.log('🔧 Using mock teachers data in development mode');
        console.log('🔍 Search query:', localSearchQuery);
        console.log('🎯 Active filters:', filters);
        
        // Filter mock data based on search query and filters
        let filteredTeachers = [...mockTeachers];
        
        // Apply search query filter
        if (localSearchQuery && localSearchQuery.trim() !== '') {
          const searchTerm = localSearchQuery.toLowerCase().trim();
          filteredTeachers = filteredTeachers.filter(teacher => 
            teacher.firstName.toLowerCase().includes(searchTerm) ||
            teacher.lastName.toLowerCase().includes(searchTerm) ||
            teacher.profile?.subjects?.some(subject => 
              subject.toLowerCase().includes(searchTerm)
            ) ||
            teacher.profile?.bio?.toLowerCase().includes(searchTerm) ||
            teacher.profile?.city?.toLowerCase().includes(searchTerm) ||
            teacher.profile?.country?.toLowerCase().includes(searchTerm)
          );
        }

        // Apply subject filter
        if (filters.subject) {
          filteredTeachers = filteredTeachers.filter(teacher =>
            teacher.profile?.subjects?.some(subject => 
              subject.toLowerCase().includes(filters.subject!.toLowerCase())
            )
          );
        }

        // Apply location filter
        if (filters.city) {
          filteredTeachers = filteredTeachers.filter(teacher =>
            teacher.profile?.city?.toLowerCase().includes(filters.city!.toLowerCase())
          );
        }

        // Apply volunteer/paid filter
        if (filters.isVolunteer !== undefined) {
          filteredTeachers = filteredTeachers.filter(teacher =>
            teacher.profile?.isVolunteer === filters.isVolunteer
          );
        }

        // Apply price range filter
        if (filters.priceMin !== undefined) {
          filteredTeachers = filteredTeachers.filter(teacher =>
            teacher.profile?.hourlyRate! >= filters.priceMin!
          );
        }
        
        if (filters.priceMax !== undefined) {
          filteredTeachers = filteredTeachers.filter(teacher =>
            teacher.profile?.hourlyRate! <= filters.priceMax!
          );
        }

        // Apply rating filter
        if (filters.rating) {
          filteredTeachers = filteredTeachers.filter(teacher =>
            teacher.profile?.rating! >= filters.rating!
          );
        }

        console.log(`📚 Found ${filteredTeachers.length} teachers matching criteria`);
        
        // Dispatch to Redux to update the state
        dispatch(searchTeachers({ 
          filters: { ...filters, subject: localSearchQuery }, 
          page: 1,
          refresh: true,
          mockResults: filteredTeachers // Pass filtered results
        }));
        
        return;
      }

      // Real API call
      await dispatch(searchTeachers({ 
        filters: { ...filters, subject: localSearchQuery }, 
        page: refresh ? 1 : currentPage,
        refresh 
      })).unwrap();
    } catch (err) {
      console.error('❌ Search failed:', err);
      Alert.alert(t('common.error'), t('search.errorMessage'));
    }
  }, [dispatch, filters, localSearchQuery, currentPage, mockTeachers]);

  const handleSearchInput = (text: string) => {
    setLocalSearchQuery(text);
    dispatch(setSearchQuery(text));
    
    // Trigger search automatically after typing (with a small delay)
    setTimeout(() => {
      if (text === localSearchQuery) { // Only search if text hasn't changed
        handleSearch(true);
      }
    }, 300);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    dispatch(updateFilter({ key, value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setLocalSearchQuery('');
    setSelectedPriceRange(null);
    setSelectedLocation('');
    setSelectedSubject('');
  };

  const handlePriceRangeSelect = (range: { min: number; max: number }) => {
    setSelectedPriceRange(range);
    handleFilterChange('priceMin', range.min);
    handleFilterChange('priceMax', range.max);
    setShowPriceModal(false);
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    handleFilterChange('city', location);
    setShowLocationModal(false);
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    handleFilterChange('subject', subject);
    setShowSubjectModal(false);
  };

  const handleRefresh = () => {
    dispatch(resetSearch());
    handleSearch(true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      handleSearch();
    }
  };

  const handleTeacherPress = (teacher: UserWithProfile) => {
    Alert.alert(
      t('search.teacherProfile'),
      `${teacher.firstName} ${teacher.lastName}\n${teacher.profile?.bio}\n\n${t('search.subjects')}: ${teacher.profile?.subjects?.join(', ')}\n${t('search.rating')}: ${teacher.profile?.rating || 'N/A'}`
    );
  };

  const handleFavoritePress = (teacherId: string) => {
    dispatch(toggleFavorite(teacherId));
  };

  const renderTeacherItem = ({ item, index }: { item: UserWithProfile; index: number }) => {
    // Convert UserWithProfile to Teacher format for TeacherCard
    const teacher: Teacher = {
      id: item.id,
      name: `${item.firstName} ${item.lastName}`,
      avatar: item.profile?.profileImage || undefined,
      rating: item.profile?.rating || 0,
      reviewCount: item.profile?.totalStudents || 0,
      experience: 5, // Mock experience years
      location: `${item.profile?.city || 'Unknown'}, ${item.profile?.country || 'Unknown'}`,
      subjects: item.profile?.subjects || ['Arabic'],
      availableModes: item.profile?.learningModes || ['online'],
      pricePerHour: item.profile?.hourlyRate || 0,
      bio: item.profile?.bio || '',
      isVerified: item.isVerified,
      languages: item.profile?.languages || ['Arabic']
    };

    const cardColor = getTeacherColor(index);

    return (
      <TeacherCard
        teacher={teacher}
        isFavorite={favorites.includes(item.id)}
        onPress={() => handleTeacherPress(item)}
        onFavoritePress={() => handleFavoritePress(item.id)}
        accentColor={cardColor} // Pass dynamic color
      />
    );
  };

  // Use Redux state teachers (which includes filtered results in dev mode)
  const displayTeachers = teachers;

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('search.searchTeachers')}</Text>
        <Text style={styles.subtitle}>{t('search.findPerfectTeacher')}</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('search.searchPlaceholder')}
          value={localSearchQuery}
          onChangeText={handleSearchInput}
          onSubmitEditing={() => handleSearch(true)}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => handleSearch(true)}
          activeOpacity={0.8} // Smooth button feedback
        >
          <Text style={styles.searchButtonText}>{t('search.search')}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Toggle */}
      <View style={styles.filterToggleContainer}>
        <TouchableOpacity 
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.7} // Smooth feedback
        >
          <Text style={styles.filterToggleText}>
            {t('search.filters')} {showFilters ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
        {Object.keys(filters).length > 0 && (
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={handleClearFilters}
          >
            <Text style={styles.clearFiltersText}>{t('search.clearFilters')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      {showFilters && (
        <ScrollView 
          style={styles.filtersContainer} 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }} // Add end padding
        >
          <TouchableOpacity 
            style={[styles.filterChip, filters.isVolunteer === true && styles.filterChipActive]}
            onPress={() => handleFilterChange('isVolunteer', filters.isVolunteer === true ? undefined : true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, filters.isVolunteer === true && styles.filterChipTextActive]}>
              🤝 {t('search.volunteers')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, filters.isVolunteer === false && styles.filterChipActive]}
            onPress={() => handleFilterChange('isVolunteer', filters.isVolunteer === false ? undefined : false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, filters.isVolunteer === false && styles.filterChipTextActive]}>
              💰 {t('search.paid')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, selectedPriceRange && styles.filterChipActive]}
            onPress={() => setShowPriceModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, selectedPriceRange && styles.filterChipTextActive]}>
              💵 {selectedPriceRange ? `$${selectedPriceRange.min}-${selectedPriceRange.max}` : t('search.priceRange')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, selectedLocation && styles.filterChipActive]}
            onPress={() => setShowLocationModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, selectedLocation && styles.filterChipTextActive]}>
              📍 {selectedLocation || t('search.location')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, selectedSubject && styles.filterChipActive]}
            onPress={() => setShowSubjectModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, selectedSubject && styles.filterChipTextActive]}>
              📚 {selectedSubject || t('search.subject')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, filters.rating && styles.filterChipActive]}
            onPress={() => handleFilterChange('rating', filters.rating ? undefined : 4.5)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, filters.rating && styles.filterChipTextActive]}>
              ⭐ {filters.rating ? `${filters.rating}+` : t('search.rating')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {t('search.foundTeachers', { count: displayTeachers.length })}
        </Text>
      </View>

      {/* Teachers List */}
      <FlatList
        data={displayTeachers}
        renderItem={renderTeacherItem}
        keyExtractor={(item) => item.id}
        style={styles.teachersList}
        contentContainerStyle={styles.teachersListContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#0a66c2" // LinkedIn professional blue
            colors={['#0a66c2']} // Android
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        removeClippedSubviews={true} // Performance optimization
        maxToRenderPerBatch={5} // Render fewer items per batch for smoothness
        updateCellsBatchingPeriod={100} // Batch updates for smoother scrolling
        windowSize={10} // Optimize memory usage
        showsVerticalScrollIndicator={false} // Cleaner look
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? t('search.searching') : t('search.noTeachers')}
            </Text>
            {isLoading && <ActivityIndicator size="large" style={styles.loader} />}
          </View>
        }
        ListFooterComponent={
          isLoading && displayTeachers.length > 0 ? (
            <ActivityIndicator size="small" style={styles.footerLoader} />
          ) : null
        }
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => handleSearch(true)}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Price Range Modal */}
      <Modal
        visible={showPriceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPriceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('search.selectPriceRange')}</Text>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => handlePriceRangeSelect({ min: 0, max: 20 })}
              activeOpacity={0.8}
            >
              <Text style={styles.modalOptionText}>💰 $0 - $20 /hr</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => handlePriceRangeSelect({ min: 20, max: 50 })}
              activeOpacity={0.8}
            >
              <Text style={styles.modalOptionText}>💵 $20 - $50 /hr</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => handlePriceRangeSelect({ min: 50, max: 100 })}
              activeOpacity={0.8}
            >
              <Text style={styles.modalOptionText}>💸 $50 - $100 /hr</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => handlePriceRangeSelect({ min: 100, max: 999 })}
              activeOpacity={0.8}
            >
              <Text style={styles.modalOptionText}>⭐ $100+ /hr</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowPriceModal(false)}
              activeOpacity={0.9}
            >
              <Text style={styles.modalCloseText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('search.selectLocation')}</Text>
            
            {['📍 Riyadh', '🏙️ Jeddah', '🌊 Dammam', '🕌 Mecca', '🌟 Medina', '🏔️ Taif', '💻 Online'].map((location) => (
              <TouchableOpacity 
                key={location}
                style={styles.modalOption}
                onPress={() => handleLocationSelect(location.split(' ')[1])} // Remove emoji for filter
                activeOpacity={0.8}
              >
                <Text style={styles.modalOptionText}>{location}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowLocationModal(false)}
              activeOpacity={0.9}
            >
              <Text style={styles.modalCloseText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Subject Modal */}
      <Modal
        visible={showSubjectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('search.selectSubject')}</Text>
            
            {['📚 Arabic', '🇺🇸 English', '🔢 Mathematics', '🔬 Science', '☪️ Islamic Studies', '📜 History', '🌍 Geography', '💻 Computer Science'].map((subject) => (
              <TouchableOpacity 
                key={subject}
                style={styles.modalOption}
                onPress={() => handleSubjectSelect(subject.split(' ')[1])} // Remove emoji for filter
                activeOpacity={0.8}
              >
                <Text style={styles.modalOptionText}>{subject}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowSubjectModal(false)}
              activeOpacity={0.9}
            >
              <Text style={styles.modalCloseText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SearchScreen;