import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Condition, VehicleStatus } from '../types';

interface InventoryFilterBarProps {
  search: string;
  onSearchChange: (text: string) => void;
  selectedCondition: Condition | 'All';
  onSelectCondition: (cond: Condition | 'All') => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  availableBrands: string[];
  selectedStatus: VehicleStatus | 'all';
  onSelectStatus: (status: VehicleStatus | 'all') => void;
}

const CONDITIONS: (Condition | 'All')[] = ['All', 'Excellent', 'Good', 'Fair', 'Needs repair'];

const STATUS_FILTERS: { id: VehicleStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All Stock' },
  { id: 'available', label: 'Available' },
  { id: 'reserved', label: 'Reserved' },
  { id: 'sold', label: 'Sold' },
];

export const InventoryFilterBar: React.FC<InventoryFilterBarProps> = ({
  search,
  onSearchChange,
  selectedCondition,
  onSelectCondition,
  selectedBrand,
  onSelectBrand,
  availableBrands,
  selectedStatus,
  onSelectStatus,
}) => {
  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={19} color="#64748B" />
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search brand, model, engine CC..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusChipsRow}
      >
        {STATUS_FILTERS.map(st => {
          const isSelected = selectedStatus === st.id;
          return (
            <TouchableOpacity
              key={st.id}
              onPress={() => onSelectStatus(st.id)}
              style={[styles.statusChip, isSelected && styles.statusChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.statusChipText, isSelected && styles.statusChipTextActive]}>
                {st.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Condition & Brand Filter Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        <Text style={styles.filterLabel}>Condition:</Text>
        {CONDITIONS.map(cond => {
          const isSelected = selectedCondition === cond;
          return (
            <TouchableOpacity
              key={cond}
              onPress={() => onSelectCondition(cond)}
              style={[styles.chip, isSelected && styles.chipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {cond}
              </Text>
            </TouchableOpacity>
          );
        })}

        {availableBrands.length > 0 && (
          <>
            <View style={styles.verticalDivider} />
            <Text style={styles.filterLabel}>Brand:</Text>
            <TouchableOpacity
              onPress={() => onSelectBrand('All')}
              style={[styles.chip, selectedBrand === 'All' && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedBrand === 'All' && styles.chipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {availableBrands.map(b => {
              const isSelected = selectedBrand === b;
              return (
                <TouchableOpacity
                  key={b}
                  onPress={() => onSelectBrand(b)}
                  style={[styles.chip, isSelected && styles.chipActive]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {b}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  statusChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    marginBottom: 6,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusChipActive: {
    backgroundColor: '#14532D',
    borderColor: '#14532D',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  statusChipTextActive: {
    color: '#FFFFFF',
  },
  chipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 2,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  verticalDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
});
