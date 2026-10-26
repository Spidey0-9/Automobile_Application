import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryBike, ShopProfile } from '../types';

const KEYS = {
  SHOP_PROFILE: '@autocare_shop_profile_v1',
  LOCAL_INVENTORY: '@autocare_local_inventory_v1',
  HAS_ONBOARDED: '@autocare_has_onboarded_v1',
};

export const defaultShopProfile: ShopProfile = {
  name: 'Apex Motors & Workshop',
  phone: '+91 98765 43210',
  address: 'Shop 12, Main Auto Market, MG Road',
  currency: 'INR',
  is_onboarded: false,
};

export async function getStoredShopProfile(): Promise<ShopProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SHOP_PROFILE);
    if (!raw) return defaultShopProfile;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load shop profile from AsyncStorage', err);
    return defaultShopProfile;
  }
}

export async function saveStoredShopProfile(profile: ShopProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SHOP_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save shop profile to AsyncStorage', err);
  }
}

export async function getStoredInventory(): Promise<InventoryBike[] | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.LOCAL_INVENTORY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load local inventory from AsyncStorage', err);
    return null;
  }
}

export async function saveStoredInventory(items: InventoryBike[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.LOCAL_INVENTORY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save local inventory to AsyncStorage', err);
  }
}

export async function getHasOnboarded(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.HAS_ONBOARDED);
    return raw === 'true';
  } catch {
    return false;
  }
}

export async function setHasOnboarded(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.HAS_ONBOARDED, value ? 'true' : 'false');
  } catch (err) {
    console.error('Failed to save onboarding flag', err);
  }
}
