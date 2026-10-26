import React from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationDestination, ShopProfile } from '../types';
import { InventorySyncStatus } from '../services/inventoryService';

interface NavigationDrawerProps {
  visible: boolean;
  onClose: () => void;
  activeDestination: NavigationDestination;
  onSelectDestination: (dest: NavigationDestination) => void;
  shopProfile: ShopProfile;
  syncStatus: InventorySyncStatus;
}

interface DrawerItem {
  id: NavigationDestination;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
  isPlanned?: boolean;
}

const MENU_ITEMS: DrawerItem[] = [
  { id: 'inventory', title: 'Inventory Dashboard', icon: 'speedometer-outline' },
  { id: 'catalogue', title: 'Vehicle Catalogue', icon: 'grid-outline', badge: 'Active' },
  { id: 'customers', title: 'Customer Directory', icon: 'people-outline', isPlanned: true },
  { id: 'sales', title: 'Sales & Payments', icon: 'receipt-outline', isPlanned: true },
  { id: 'service', title: 'Service & Maintenance', icon: 'construct-outline', isPlanned: true },
  { id: 'reports', title: 'Reports & Valuation', icon: 'bar-chart-outline', isPlanned: true },
  { id: 'settings', title: 'Shop Profile & Settings', icon: 'storefront-outline' },
];

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  visible,
  onClose,
  activeDestination,
  onSelectDestination,
  shopProfile,
  syncStatus,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <SafeAreaView style={styles.drawerContainer}>
          <View style={styles.drawerHeader}>
            <View style={styles.logoBadge}>
              <Ionicons name="car-sport" size={26} color="#FFFFFF" />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.shopName} numberOfLines={1}>
                {shopProfile.name || 'Apex Motors'}
              </Text>
              <Text style={styles.shopSub} numberOfLines={1}>
                {shopProfile.phone || 'Automobile Shop'}
              </Text>
              {shopProfile.address ? (
                <Text style={styles.shopAddress} numberOfLines={1}>
                  {shopProfile.address}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close drawer">
              <Ionicons name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
            <Text style={styles.menuSectionHeader}>MANAGEMENT MODULES</Text>
            {MENU_ITEMS.map(item => {
              const isActive = activeDestination === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => {
                    onSelectDestination(item.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, isActive && styles.menuIconActive]}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={isActive ? '#14532D' : '#475569'}
                    />
                  </View>
                  <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                    {item.title}
                  </Text>
                  {item.badge ? (
                    <View style={styles.badgePill}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : item.isPlanned ? (
                    <View style={styles.plannedPill}>
                      <Text style={styles.plannedText}>Next Phase</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Connection & Auth Footer */}
          <View style={styles.drawerFooter}>
            <View style={styles.statusCard}>
              <View style={styles.statusDotRow}>
                <View
                  style={[
                    styles.footerDot,
                    syncStatus.isLive ? styles.dotLive : styles.dotDemo,
                  ]}
                />
                <Text style={styles.footerStatusTitle}>
                  {syncStatus.isLive ? 'Supabase Database' : 'Local Storage Mode'}
                </Text>
              </View>
              <Text style={styles.footerStatusSubtitle}>
                {syncStatus.isLive
                  ? syncStatus.isRealtimeConnected
                    ? 'Real-Time Sync Active'
                    : 'Connected'
                  : '3 sample demo records loaded'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={() => {
                onClose();
                onSelectDestination('settings');
              }}
            >
              <Ionicons name="settings-outline" size={18} color="#64748B" />
              <Text style={styles.signOutText}>App & Database Settings</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>AutoCare Manager v1.0.0 · Expo SDK 54</Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawerContainer: {
    width: '82%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAF8',
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#14532D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  shopSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  shopAddress: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  menuList: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  menuSectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#94A3B8',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: '#ECFDF5', // Light emerald
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconActive: {
    backgroundColor: '#D1FAE5',
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  menuItemTextActive: {
    color: '#14532D',
    fontWeight: '700',
  },
  badgePill: {
    backgroundColor: '#14532D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  plannedPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  plannedText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAF8',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotLive: {
    backgroundColor: '#22C55E',
  },
  dotDemo: {
    backgroundColor: '#F59E0B',
  },
  footerStatusTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  footerStatusSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  versionText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
});
