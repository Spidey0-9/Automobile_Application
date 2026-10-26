import { Condition, InventoryBike, VehicleStatus } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getStoredInventory, saveStoredInventory } from '../lib/storage';
import { CatalogueService } from './catalogue';

export interface InventorySyncStatus {
  isLive: boolean;
  isRealtimeConnected: boolean;
  lastSyncedAt: Date | null;
  errorMessage: string | null;
}

export const DEMO_INVENTORY: InventoryBike[] = [
  {
    id: 'demo-1',
    brand: 'Hero',
    model: 'Splendor Plus',
    cc: 97,
    variant: 'Self Drum',
    is_second_hand: true,
    manufacture_year: 2022,
    odometer_km: 24000,
    condition: 'Good',
    condition_notes: 'Single owner, regular authorized service, excellent tyre tread.',
    registration_number: 'MH-12-AB-1234',
    purchase_price: 36000,
    selling_price: 45000,
    quantity: 2,
    status: 'available',
    photo_urls: [],
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'demo-2',
    brand: 'Honda',
    model: 'Shine',
    cc: 124,
    variant: 'Disc CBS',
    is_second_hand: true,
    manufacture_year: 2023,
    odometer_km: 12000,
    condition: 'Excellent',
    condition_notes: 'Showroom condition, scratchless tank, insurance valid.',
    registration_number: 'DL-04-CD-5678',
    purchase_price: 43000,
    selling_price: 52000,
    quantity: 1,
    status: 'available',
    photo_urls: [],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'demo-3',
    brand: 'Bajaj',
    model: 'Pulsar 150',
    cc: 149,
    variant: 'Single Disc',
    is_second_hand: true,
    manufacture_year: 2021,
    odometer_km: 31000,
    condition: 'Fair',
    condition_notes: 'Recent chain kit replacement, minor scratches on silencer shield.',
    registration_number: 'KA-05-EF-9012',
    purchase_price: 49000,
    selling_price: 61000,
    quantity: 3,
    status: 'available',
    photo_urls: [],
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

type SubscriptionCallback = (items: InventoryBike[], status: InventorySyncStatus) => void;

export class InventoryService {
  private static localItems: InventoryBike[] = [];
  private static subscribers: Set<SubscriptionCallback> = new Set();
  private static realtimeChannel: any = null;
  private static currentStatus: InventorySyncStatus = {
    isLive: false,
    isRealtimeConnected: false,
    lastSyncedAt: null,
    errorMessage: null,
  };

  public static getStatus(): InventorySyncStatus {
    return { ...this.currentStatus };
  }

  private static notifySubscribers(): void {
    const items = [...this.localItems];
    const status = { ...this.currentStatus };
    this.subscribers.forEach(cb => {
      try {
        cb(items, status);
      } catch (err) {
        console.error('Error in inventory subscriber callback', err);
      }
    });
  }

  public static subscribe(cb: SubscriptionCallback): () => void {
    this.subscribers.add(cb);
    // immediately notify subscriber of current state
    cb([...this.localItems], { ...this.currentStatus });
    return () => {
      this.subscribers.delete(cb);
    };
  }

  public static async loadInventory(): Promise<InventoryBike[]> {
    await CatalogueService.init();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('inventory_bikes')
          .select(`
            id,
            business_id,
            model_id,
            display_name,
            registration_number,
            manufacture_year,
            odometer_km,
            condition,
            condition_notes,
            purchase_price,
            selling_price,
            status,
            photo_urls,
            is_second_hand,
            created_at,
            updated_at,
            bike_models (
              id,
              name,
              engine_cc,
              variant,
              bike_brands (
                id,
                name
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const liveBikes: InventoryBike[] = (data || []).map((row: any) => {
          const model = row.bike_models;
          const brand = model?.bike_brands;
          return {
            id: row.id,
            business_id: row.business_id,
            model_id: row.model_id,
            brand: brand?.name || 'Unknown',
            model: model?.name || row.display_name || 'Generic Model',
            cc: model?.engine_cc || 0,
            variant: model?.variant,
            is_second_hand: row.is_second_hand ?? true,
            manufacture_year: row.manufacture_year,
            odometer_km: row.odometer_km,
            condition: this.normalizeCondition(row.condition),
            condition_notes: row.condition_notes,
            registration_number: row.registration_number,
            purchase_price: row.purchase_price ? Number(row.purchase_price) : undefined,
            selling_price: Number(row.selling_price) || 0,
            quantity: 1, // each physical row is 1 unit
            status: row.status as VehicleStatus,
            photo_urls: row.photo_urls || [],
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        });

        this.localItems = liveBikes;
        this.currentStatus = {
          isLive: true,
          isRealtimeConnected: Boolean(this.realtimeChannel),
          lastSyncedAt: new Date(),
          errorMessage: null,
        };

        this.setupRealtimeSubscription();
        this.notifySubscribers();
        return this.localItems;
      } catch (err: any) {
        console.warn('InventoryService: Supabase query failed, falling back to local storage', err);
        this.currentStatus = {
          isLive: false,
          isRealtimeConnected: false,
          lastSyncedAt: null,
          errorMessage: err?.message || 'Database connection error',
        };
      }
    }

    // Offline / Demo mode
    const stored = await getStoredInventory();
    if (stored && stored.length > 0) {
      this.localItems = stored;
    } else {
      // First run with demo records
      this.localItems = [...DEMO_INVENTORY];
      await saveStoredInventory(this.localItems);
    }

    this.currentStatus = {
      isLive: false,
      isRealtimeConnected: false,
      lastSyncedAt: new Date(),
      errorMessage: null,
    };

    this.notifySubscribers();
    return this.localItems;
  }

  private static setupRealtimeSubscription(): void {
    if (!isSupabaseConfigured || !supabase || this.realtimeChannel) {
      return;
    }

    try {
      this.realtimeChannel = supabase
        .channel('public:inventory_bikes_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'inventory_bikes' },
          async (payload: any) => {
            console.log('Realtime change received on inventory_bikes:', payload.eventType);
            // Reload authoritative database rows on any change
            await this.loadInventory();
          }
        )
        .subscribe((status: string) => {
          this.currentStatus.isRealtimeConnected = status === 'SUBSCRIBED';
          this.notifySubscribers();
        });
    } catch (err) {
      console.warn('Failed to attach Supabase Realtime channel', err);
    }
  }

  public static teardownRealtimeSubscription(): void {
    if (this.realtimeChannel && supabase) {
      try {
        supabase.removeChannel(this.realtimeChannel);
      } catch (err) {
        console.warn('Error removing realtime channel', err);
      }
      this.realtimeChannel = null;
      this.currentStatus.isRealtimeConnected = false;
    }
  }

  public static async createVehicle(bikeData: Omit<InventoryBike, 'id' | 'created_at'>): Promise<InventoryBike> {
    const cleanQuantity = Math.max(1, bikeData.quantity || 1);
    const cleanSellingPrice = Math.max(0, bikeData.selling_price || 0);
    const cleanPurchasePrice = bikeData.purchase_price !== undefined ? Math.max(0, bikeData.purchase_price) : undefined;
    const cleanKm = bikeData.odometer_km !== undefined ? Math.max(0, bikeData.odometer_km) : undefined;

    // First ensure model is registered in catalogue
    const model = await CatalogueService.addCustomModel(
      bikeData.brand,
      bikeData.model,
      bikeData.cc,
      bikeData.variant,
      bikeData.category || 'motorcycle'
    );

    if (isSupabaseConfigured && supabase) {
      try {
        // Fetch or create business id
        let businessId = bikeData.business_id;
        if (!businessId) {
          const { data: biz } = await supabase.from('businesses').select('id').limit(1).maybeSingle();
          businessId = biz?.id;
        }

        if (!businessId) {
          const { data: newBiz } = await supabase
            .from('businesses')
            .insert({ name: 'AutoCare Workshop' })
            .select('id')
            .single();
          businessId = newBiz?.id;
        }

        const newRows: any[] = [];
        for (let i = 0; i < cleanQuantity; i++) {
          newRows.push({
            business_id: businessId,
            model_id: model.id.startsWith('model-local-') ? null : model.id,
            display_name: `${bikeData.brand} ${bikeData.model}`,
            registration_number: cleanQuantity === 1 ? bikeData.registration_number?.trim() || null : null,
            manufacture_year: bikeData.manufacture_year || null,
            odometer_km: cleanKm ?? null,
            condition: bikeData.condition.toLowerCase().replace(' ', '_'),
            condition_notes: bikeData.condition_notes?.trim() || null,
            purchase_price: cleanPurchasePrice ?? null,
            selling_price: cleanSellingPrice,
            status: bikeData.status || 'available',
            is_second_hand: bikeData.is_second_hand,
            photo_urls: bikeData.photo_urls || [],
          });
        }

        const { data: inserted, error } = await supabase
          .from('inventory_bikes')
          .insert(newRows)
          .select();

        if (error) {
          throw error;
        }

        await this.loadInventory();
        return this.localItems[0];
      } catch (err: any) {
        console.error('Failed to create vehicle in Supabase', err);
        throw new Error(`Database error: ${err.message || 'Could not save to remote database'}`);
      }
    }

    // Local / Demo Mode save
    const newLocalItem: InventoryBike = {
      ...bikeData,
      id: `local-${Date.now()}`,
      quantity: cleanQuantity,
      selling_price: cleanSellingPrice,
      purchase_price: cleanPurchasePrice,
      odometer_km: cleanKm,
      created_at: new Date().toISOString(),
    };

    this.localItems = [newLocalItem, ...this.localItems];
    await saveStoredInventory(this.localItems);
    this.notifySubscribers();
    return newLocalItem;
  }

  public static async updateVehicle(
    id: string,
    updates: Partial<Omit<InventoryBike, 'id' | 'created_at'>>
  ): Promise<InventoryBike> {
    const existing = this.localItems.find(b => b.id === id);
    if (!existing) {
      throw new Error('Vehicle record not found');
    }

    const updatedItem: InventoryBike = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase && !id.startsWith('demo-') && !id.startsWith('local-')) {
      try {
        const payload: any = {};
        if (updates.condition) payload.condition = updates.condition.toLowerCase().replace(' ', '_');
        if (updates.condition_notes !== undefined) payload.condition_notes = updates.condition_notes;
        if (updates.selling_price !== undefined) payload.selling_price = updates.selling_price;
        if (updates.purchase_price !== undefined) payload.purchase_price = updates.purchase_price;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.registration_number !== undefined) payload.registration_number = updates.registration_number;
        if (updates.odometer_km !== undefined) payload.odometer_km = updates.odometer_km;
        if (updates.photo_urls !== undefined) payload.photo_urls = updates.photo_urls;
        payload.updated_at = new Date().toISOString();

        const { error } = await supabase.from('inventory_bikes').update(payload).eq('id', id);
        if (error) throw error;

        await this.loadInventory();
        return this.localItems.find(b => b.id === id) || updatedItem;
      } catch (err: any) {
        console.error('Failed to update vehicle in Supabase', err);
        throw new Error(`Database update failed: ${err.message}`);
      }
    }

    // Local / Demo update
    this.localItems = this.localItems.map(item => (item.id === id ? updatedItem : item));
    await saveStoredInventory(this.localItems);
    this.notifySubscribers();
    return updatedItem;
  }

  public static async recordSale(id: string, sellingPrice: number, customerName?: string, notes?: string): Promise<void> {
    const existing = this.localItems.find(b => b.id === id);
    if (!existing) {
      throw new Error('Vehicle not found');
    }

    if (existing.status === 'sold') {
      throw new Error('This vehicle has already been marked as sold.');
    }

    if (isSupabaseConfigured && supabase && !id.startsWith('demo-') && !id.startsWith('local-')) {
      try {
        // Call atomic sale RPC if available
        const { error: rpcError } = await supabase.rpc('record_vehicle_sale', {
          p_business_id: existing.business_id,
          p_inventory_bike_id: id,
          p_customer_id: null,
          p_selling_price: sellingPrice,
          p_notes: notes || `Sold to ${customerName || 'Customer'}`,
        });

        if (rpcError) {
          // Fallback to direct status update if function is not yet installed
          const { error: updateError } = await supabase
            .from('inventory_bikes')
            .update({ status: 'sold', updated_at: new Date().toISOString() })
            .eq('id', id);
          if (updateError) throw updateError;
        }

        await this.loadInventory();
        return;
      } catch (err: any) {
        console.error('Failed to record sale in Supabase', err);
        throw new Error(`Sale recording failed: ${err.message}`);
      }
    }

    // Local update
    if (existing.quantity > 1) {
      // Decrease available quantity by 1 and record 1 sold entry
      existing.quantity -= 1;
      const soldItem: InventoryBike = {
        ...existing,
        id: `local-sold-${Date.now()}`,
        quantity: 1,
        status: 'sold',
        selling_price: sellingPrice,
        condition_notes: notes || `Sold to ${customerName || 'Customer'}`,
        updated_at: new Date().toISOString(),
      };
      this.localItems = [soldItem, ...this.localItems];
    } else {
      existing.status = 'sold';
      existing.selling_price = sellingPrice;
      if (notes) existing.condition_notes = notes;
      existing.updated_at = new Date().toISOString();
    }

    await saveStoredInventory(this.localItems);
    this.notifySubscribers();
  }

  public static async deleteVehicle(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase && !id.startsWith('demo-') && !id.startsWith('local-')) {
      try {
        const { error } = await supabase.from('inventory_bikes').delete().eq('id', id);
        if (error) throw error;
        await this.loadInventory();
        return;
      } catch (err: any) {
        console.error('Failed to delete vehicle in Supabase', err);
        throw new Error(`Deletion failed: ${err.message}`);
      }
    }

    this.localItems = this.localItems.filter(item => item.id !== id);
    await saveStoredInventory(this.localItems);
    this.notifySubscribers();
  }

  private static normalizeCondition(cond: string): Condition {
    if (!cond) return 'Good';
    const lower = cond.toLowerCase().replace('_', ' ');
    if (lower.includes('excel')) return 'Excellent';
    if (lower.includes('need') || lower.includes('repair')) return 'Needs repair';
    if (lower.includes('fair')) return 'Fair';
    return 'Good';
  }
}
