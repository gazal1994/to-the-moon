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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
import { teacherService } from '../../../services';
import { styles } from './SearchScreen.styles';

const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  
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
  const [teachersData, setTeachersData] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<{ cities: string[]; countries: string[] }>({ cities: [], countries: [] });

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

  // Load teachers data from API
  const loadTeachers = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }

      console.log('🔍 Loading teachers with filters:', {
        query: localSearchQuery,
        page: isRefresh ? 1 : page,
        subject: selectedSubject,
        city: selectedLocation,
        minPrice: selectedPriceRange?.min,
        maxPrice: selectedPriceRange?.max,
      });

      const response = await teacherService.searchTeachers({
        query: localSearchQuery || undefined,
        page: isRefresh ? 1 : page,
        limit: 20,
        subjects: selectedSubject ? [selectedSubject] : undefined,
        city: selectedLocation || undefined,
        minPrice: selectedPriceRange?.min,
        maxPrice: selectedPriceRange?.max,
        isVolunteer: filters.isVolunteer,
        rating: filters.rating,
      });

      if (response.success && response.data) {
        const newTeachers = response.data.teachers || [];
        
        if (isRefresh) {
          setTeachersData(newTeachers);
          setPage(2);
        } else {
          setTeachersData(prevData => [...prevData, ...newTeachers]);
          setPage(prevPage => prevPage + 1);
        }

        setHasMoreData(response.data.hasMore || false);
        console.log(`✅ Loaded ${newTeachers.length} teachers`);
      } else {
        console.log('⚠️ No teachers data received');
        if (isRefresh) {
          setTeachersData([]);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load teachers:', error);
      Alert.alert(t('common.error'), 'Failed to load teachers');
      // Set empty array on error to prevent undefined issues
      if (isRefresh) {
        setTeachersData([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load available subjects and locations
  const loadFilterOptions = async () => {
    try {
      const [subjectsResponse, locationsResponse] = await Promise.all([
        teacherService.getAvailableSubjects(),
        teacherService.getAvailableLocations(),
      ]);

      if (subjectsResponse.success && subjectsResponse.data) {
        setAvailableSubjects(subjectsResponse.data);
      } else {
        // Set default subjects if API fails
        setAvailableSubjects([]);
      }

      if (locationsResponse.success && locationsResponse.data) {
        setAvailableLocations(locationsResponse.data);
      } else {
        // Set default locations if API fails
        setAvailableLocations({ cities: [], countries: [] });
      }
    } catch (error) {
      console.error('❌ Failed to load filter options:', error);
      // Set defaults on error
      setAvailableSubjects([]);
      setAvailableLocations({ cities: [], countries: [] });
    }
  };

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 SearchScreen loading teachers...');
      loadTeachers(true);
      loadFilterOptions();
    }, [])
  );

  useEffect(() => {
    // Trigger search when filters change
    if (selectedPriceRange || selectedLocation || selectedSubject) {
      loadTeachers(true);
    }
  }, [selectedPriceRange, selectedLocation, selectedSubject]);

  const handleSearch = async () => {
    await loadTeachers(true);
  };

  const handleSearchInput = (text: string) => {
    setLocalSearchQuery(text);
  };

  const handleSearchSubmit = () => {
    handleSearch();
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
    loadTeachers(true);
  };

  const handlePriceRangeSelect = (range: { min: number; max: number }) => {
    setSelectedPriceRange(range);
    setShowPriceModal(false);
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setShowLocationModal(false);
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setShowSubjectModal(false);
  };

  const handleRefresh = () => {
    loadTeachers(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMoreData) {
      loadTeachers(false);
    }
  };

  const handleToggleFavorite = async (teacherId: string) => {
    try {
      const response = await teacherService.toggleFavorite(teacherId);
      
      if (response.success) {
        dispatch(toggleFavorite(teacherId));
        Alert.alert(
          t('common.success'),
          response.data?.isFavorite ? 'Added to favorites' : 'Removed from favorites'
        );
      }
    } catch (error) {
      console.error('❌ Failed to toggle favorite:', error);
      Alert.alert(t('common.error'), 'Failed to update favorite status');
    }
  };

  const handleTeacherPress = (teacher: Teacher) => {
    navigation.navigate('TeacherProfile' as never, { teacherId: teacher.id } as never);
  };

  const renderTeacherItem = ({ item, index }: { item: Teacher; index: number }) => {
    const cardColor = getTeacherColor(index);

    return (
      <TeacherCard
        teacher={item}
        isFavorite={favorites.includes(item.id)}
        onPress={() => handleTeacherPress(item)}
        onFavoritePress={() => handleToggleFavorite(item.id)}
        accentColor={cardColor}
      />
    );
  };

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
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearchSubmit}
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
          {t('search.foundTeachers', { count: teachersData.length })}
        </Text>
      </View>

      {/* Teachers List */}
      {loading && teachersData.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a66c2" />
          <Text style={styles.loadingText}>Loading teachers...</Text>
        </View>
      ) : (
        <FlatList
          data={teachersData}
          renderItem={renderTeacherItem}
          keyExtractor={(item) => item.id}
          style={styles.teachersList}
          contentContainerStyle={styles.teachersListContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0a66c2"
              colors={['#0a66c2']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={100}
          windowSize={10}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No teachers found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search criteria or filters
              </Text>
            </View>
          }
          ListFooterComponent={
            loading && teachersData.length > 0 ? (
              <ActivityIndicator size="small" style={styles.footerLoader} color="#0a66c2" />
            ) : null
          }
        />
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
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
            
            <ScrollView style={styles.modalScroll}>
              {(availableLocations?.cities || []).map((city) => (
                <TouchableOpacity 
                  key={city}
                  style={styles.modalOption}
                  onPress={() => handleLocationSelect(city)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalOptionText}>📍 {city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
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
            
            <ScrollView style={styles.modalScroll}>
              {(availableSubjects || []).map((subject) => (
                <TouchableOpacity 
                  key={subject}
                  style={styles.modalOption}
                  onPress={() => handleSubjectSelect(subject)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalOptionText}>📚 {subject}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
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

export default SearchScreen;