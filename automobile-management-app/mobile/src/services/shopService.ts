import { ShopProfile } from '../types';
import { getStoredShopProfile, saveStoredShopProfile, getHasOnboarded, setHasOnboarded, defaultShopProfile } from '../lib/storage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export class ShopService {
  private static cachedProfile: ShopProfile | null = null;

  public static async getProfile(): Promise<ShopProfile> {
    if (this.cachedProfile) {
      return this.cachedProfile;
    }

    const localProfile = await getStoredShopProfile();
    const onboarded = await getHasOnboarded();
    this.cachedProfile = { ...localProfile, is_onboarded: onboarded };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, phone, address, logo_url, currency')
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          const merged: ShopProfile = {
            id: data.id,
            name: data.name || localProfile.name,
            phone: data.phone || localProfile.phone,
            address: data.address || localProfile.address,
            logo_url: data.logo_url || localProfile.logo_url,
            currency: data.currency || localProfile.currency || 'INR',
            is_onboarded: true,
          };
          this.cachedProfile = merged;
          await saveStoredShopProfile(merged);
          await setHasOnboarded(true);
        }
      } catch (err) {
        console.warn('ShopService: Supabase business fetch failed, using local profile', err);
      }
    }

    return this.cachedProfile;
  }

  public static async updateProfile(profile: Partial<ShopProfile>): Promise<ShopProfile> {
    const current = await this.getProfile();
    const updated: ShopProfile = {
      ...current,
      ...profile,
      is_onboarded: true,
    };

    this.cachedProfile = updated;
    await saveStoredShopProfile(updated);
    await setHasOnboarded(true);

    if (isSupabaseConfigured && supabase) {
      try {
        if (updated.id) {
          await supabase
            .from('businesses')
            .update({
              name: updated.name,
              phone: updated.phone || null,
              address: updated.address || null,
              logo_url: updated.logo_url || null,
              currency: updated.currency || 'INR',
            })
            .eq('id', updated.id);
        } else {
          const { data } = await supabase
            .from('businesses')
            .insert({
              name: updated.name,
              phone: updated.phone || null,
              address: updated.address || null,
              logo_url: updated.logo_url || null,
              currency: updated.currency || 'INR',
            })
            .select('id')
            .single();

          if (data?.id) {
            updated.id = data.id;
            this.cachedProfile = updated;
            await saveStoredShopProfile(updated);
          }
        }
      } catch (err) {
        console.warn('ShopService: Could not sync profile update to remote Supabase', err);
      }
    }

    return updated;
  }
}
