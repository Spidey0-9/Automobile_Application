import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InventorySyncStatus } from '../services/inventoryService';

interface AppHeaderProps {
  shopName: string;
  syncStatus: InventorySyncStatus;
  onOpenDrawer: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  shopName,
  syncStatus,
  onOpenDrawer,
  onOpenSettings,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onOpenDrawer}
          style={styles.iconButton}
          accessibilityLabel="Open navigation menu"
          accessibilityRole="button"
        >
          <Ionicons name="menu-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.brandContainer}>
          <Text style={styles.shopEyebrow}>DEALERSHIP & WORKSHOP</Text>
          <TouchableOpacity onPress={onOpenSettings} activeOpacity={0.8} style={styles.shopNameRow}>
            <Text style={styles.shopName} numberOfLines={1}>
              {shopName || 'AutoCare Manager'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#A7F3D0" style={styles.editIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={onRefresh}
            style={[styles.iconButton, isRefreshing && styles.rotating]}
            accessibilityLabel="Refresh inventory"
            accessibilityRole="button"
          >
            <Ionicons
              name={isRefreshing ? 'sync' : 'refresh-outline'}
              size={21}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onOpenSettings}
            style={styles.avatarButton}
            accessibilityLabel="Shop Settings"
            accessibilityRole="button"
          >
            <Ionicons name="settings-sharp" size={18} color="#14532D" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statusBar}>
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusDot,
              syncStatus.isLive
                ? syncStatus.isRealtimeConnected
                  ? styles.dotRealtime
                  : styles.dotLive
                : styles.dotDemo,
            ]}
          />
          <Text style={styles.statusText}>
            {syncStatus.isLive
              ? syncStatus.isRealtimeConnected
                ? 'Supabase Live · Real-Time'
                : 'Supabase Connected'
              : 'Local Demo Mode · 3 Sample Records'}
          </Text>
        </View>

        {syncStatus.errorMessage ? (
          <Text style={styles.errorNotice} numberOfLines={1}>
            Offline
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#14532D', // Deep Forest Green
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  shopEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#86EFAC', // Light emerald green
    marginBottom: 2,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    maxWidth: '85%',
  },
  editIcon: {
    marginLeft: 6,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },
  dotRealtime: {
    backgroundColor: '#4ADE80',
  },
  dotLive: {
    backgroundColor: '#60A5FA',
  },
  dotDemo: {
    backgroundColor: '#FBBF24',
  },
  statusText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
  },
  errorNotice: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '700',
  },
  rotating: {
    opacity: 0.7,
  },
});
