import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InventoryBike } from '../types';

interface InventoryStatsProps {
  bikes: InventoryBike[];
}

export const formatRupee = (num: number): string => {
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
};

export const InventoryStats: React.FC<InventoryStatsProps> = ({ bikes }) => {
  const availableBikes = bikes.filter(b => b.status === 'available');
  const soldBikes = bikes.filter(b => b.status === 'sold');
  const reservedBikes = bikes.filter(b => b.status === 'reserved');

  const totalAvailableUnits = availableBikes.reduce((sum, b) => sum + (b.quantity || 1), 0);
  const totalStockAskingValue = availableBikes.reduce(
    (sum, b) => sum + (b.quantity || 1) * b.selling_price,
    0
  );
  const totalSoldUnits = soldBikes.reduce((sum, b) => sum + (b.quantity || 1), 0);
  const totalReservedUnits = reservedBikes.reduce((sum, b) => sum + (b.quantity || 1), 0);

  return (
    <View style={styles.container}>
      <View style={[styles.card, styles.primaryCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="bicycle" size={18} color="#15803D" />
          </View>
          <Text style={styles.tag}>IN STOCK</Text>
        </View>
        <Text style={styles.value}>{totalAvailableUnits}</Text>
        <Text style={styles.label}>Available Vehicles</Text>
      </View>

      <View style={[styles.card, styles.secondaryCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="cash-outline" size={18} color="#B45309" />
          </View>
          <Text style={[styles.tag, { color: '#B45309', backgroundColor: '#FEF3C7' }]}>
            VALUATION
          </Text>
        </View>
        <Text style={styles.valueLarge} numberOfLines={1}>
          {formatRupee(totalStockAskingValue)}
        </Text>
        <Text style={styles.label}>Total Stock Asking Value</Text>
      </View>

      <View style={[styles.card, styles.tertiaryCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="checkmark-done-circle" size={18} color="#4338CA" />
          </View>
          <Text style={[styles.tag, { color: '#4338CA', backgroundColor: '#EEF2FF' }]}>
            CLOSED
          </Text>
        </View>
        <View style={styles.subStatsRow}>
          <View>
            <Text style={styles.miniValue}>{totalSoldUnits}</Text>
            <Text style={styles.miniLabel}>Sold</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.miniValue}>{totalReservedUnits}</Text>
            <Text style={styles.miniLabel}>Reserved</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    justifyContent: 'space-between',
  },
  primaryCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#16A34A',
  },
  secondaryCard: {
    flex: 1.35,
    borderLeftWidth: 3,
    borderLeftColor: '#D97706',
  },
  tertiaryCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  valueLarge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#14532D',
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: '#E2E8F0',
  },
  miniValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
});
