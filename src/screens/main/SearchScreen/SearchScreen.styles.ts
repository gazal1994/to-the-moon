import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SIZES } from '../../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f2ef', // LinkedIn background
  },
  
  // Header Section
  header: {
    padding: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#d0d0d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700', 
    color: '#000000',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 13,
    color: '#666666', 
    fontWeight: '400',
    lineHeight: 18,
  },

  // Search Section
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: '#ffffff',
    marginRight: 8,
    fontWeight: '400',
    color: '#000000',
  },
  searchButton: {
    backgroundColor: '#0a66c2', 
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  // Filter Toggle Section
  filterToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterToggle: {
    paddingVertical: 8,
  },
  filterToggleText: {
    fontSize: FONT_SIZES.md,
    color: '#0077b5',
    fontWeight: '600',
  },
  clearFiltersButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '500',
  },

  // Filters Section
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#0a66c2',
    borderColor: '#0a66c2',
    shadowColor: '#0a66c2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipText: {
    fontSize: 12,
    color: '#404040',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.1,
    lineHeight: 16,
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },

  // Results Section
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsCount: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },

  // Teachers List
  teachersList: {
    flex: 1,
    backgroundColor: '#f3f2ef', 
  },
  teachersListContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  footerLoader: {
    marginVertical: 20,
  },

  // Error State
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    margin: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#0a66c2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Development Mode Indicator
  devModeContainer: {
    backgroundColor: '#fef3c7',
    padding: 8,
    margin: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#b45309',
  },
  devModeText: {
    fontSize: 12,
    color: '#b45309',
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '92%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    backgroundColor: '#f3f2ef',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#0a66c2',
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});