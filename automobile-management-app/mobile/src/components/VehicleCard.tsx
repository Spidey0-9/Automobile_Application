import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Condition, InventoryBike } from '../types';
import { formatRupee } from './InventoryStats';

interface VehicleCardProps {
  bike: InventoryBike;
  onPressDetails: (bike: InventoryBike) => void;
  onQuickSold?: (bike: InventoryBike) => void;
}

const getConditionStyle = (condition: Condition) => {
  switch (condition) {
    case 'Excellent':
      return { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
    case 'Good':
      return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' };
    case 'Fair':
      return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
    case 'Needs repair':
      return { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' };
    default:
      return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'sold':
      return { label: 'SOLD', bg: '#FEE2E2', text: '#991B1B' };
    case 'reserved':
      return { label: 'RESERVED', bg: '#FEF3C7', text: '#92400E' };
    case 'under_repair':
      return { label: 'IN SERVICE', bg: '#E0E7FF', text: '#3730A3' };
    default:
      return null;
  }
};

export const VehicleCard: React.FC<VehicleCardProps> = ({
  bike,
  onPressDetails,
  onQuickSold,
}) => {
  const condStyle = getConditionStyle(bike.condition);
  const statusBadge = getStatusBadge(bike.status);
  const isAvailable = bike.status === 'available';

  return (
    <View style={[styles.card, !isAvailable && styles.cardInactive]}>
      <View style={styles.contentRow}>
        {/* Vehicle Photo or Icon Thumbnail */}
        <View style={styles.mediaContainer}>
          {bike.photo_urls && bike.photo_urls.length > 0 ? (
            <Image
              source={{ uri: bike.photo_urls[0] }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons
                name={bike.category === 'scooter' ? 'speedometer-outline' : 'bicycle'}
                size={32}
                color="#64748B"
              />
              <Text style={styles.thumbnailType}>
                {bike.category === 'scooter' ? 'SCOOTER' : 'BIKE'}
              </Text>
            </View>
          )}

          {bike.is_second_hand ? (
            <View style={styles.preOwnedBadge}>
              <Text style={styles.preOwnedText}>USED</Text>
            </View>
          ) : (
            <View style={[styles.preOwnedBadge, { backgroundColor: '#15803D' }]}>
              <Text style={styles.preOwnedText}>NEW</Text>
            </View>
          )}
        </View>

        {/* Main Vehicle Specs */}
        <View style={styles.infoCol}>
          <View style={styles.headerRow}>
            <View style={styles.brandPill}>
              <Text style={styles.brandText}>{bike.brand}</Text>
            </View>

            <View style={[styles.conditionPill, { backgroundColor: condStyle.bg, borderColor: condStyle.border }]}>
              <Text style={[styles.conditionText, { color: condStyle.text }]}>
                {bike.condition}
              </Text>
            </View>
          </View>

          <Text style={styles.modelTitle} numberOfLines={1}>
            {bike.model}
          </Text>

          <Text style={styles.specsLine}>
            <Text style={styles.ccHighlight}>{bike.cc} CC</Text>
            {bike.variant ? ` · ${bike.variant}` : ''}
            {bike.manufacture_year ? ` · ${bike.manufacture_year}` : ''}
            {bike.odometer_km !== undefined ? ` · ${bike.odometer_km.toLocaleString('en-IN')} km` : ''}
          </Text>

          {bike.registration_number ? (
            <View style={styles.regBadge}>
              <Ionicons name="card-outline" size={11} color="#64748B" />
              <Text style={styles.regNumber}>{bike.registration_number.toUpperCase()}</Text>
            </View>
          ) : null}

          {statusBadge ? (
            <View style={[styles.statusBanner, { backgroundColor: statusBadge.bg }]}>
              <Text style={[styles.statusBannerText, { color: statusBadge.text }]}>
                {statusBadge.label}
              </Text>
            </View>
          ) : null}

          {/* Pricing & Actions Footer */}
          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.price}>{formatRupee(bike.selling_price)}</Text>
              <Text style={styles.quantityText}>
                {bike.quantity > 1 ? `${bike.quantity} units available` : 'Single unit record'}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              {isAvailable && onQuickSold && (
                <TouchableOpacity
                  style={styles.quickSoldBtn}
                  onPress={() => onQuickSold(bike)}
                  accessibilityLabel="Record sale"
                >
                  <Ionicons name="checkmark" size={14} color="#15803D" />
                  <Text style={styles.quickSoldText}>Sell</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.detailsBtn}
                onPress={() => onPressDetails(bike)}
                accessibilityLabel="View details"
              >
                <Text style={styles.detailsBtnText}>Details</Text>
                <Ionicons name="chevron-forward" size={14} color="#14532D" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInactive: {
    backgroundColor: '#FAFAFA',
    borderColor: '#CBD5E1',
    opacity: 0.88,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaContainer: {
    width: 90,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  thumbnailType: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#94A3B8',
    marginTop: 4,
  },
  preOwnedBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  preOwnedText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  conditionPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  specsLine: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  ccHighlight: {
    color: '#0F172A',
    fontWeight: '700',
  },
  regBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  regNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.5,
  },
  statusBanner: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusBannerText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#14532D', // Forest Green
    letterSpacing: -0.3,
  },
  quantityText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickSoldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  quickSoldText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#14532D',
  },
});
