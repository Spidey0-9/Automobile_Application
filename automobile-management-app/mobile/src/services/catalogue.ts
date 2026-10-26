import { BikeBrand, BikeModel, VehicleCategory } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const INITIAL_BRANDS: BikeBrand[] = [
  { id: 'brand-hero', name: 'Hero' },
  { id: 'brand-honda', name: 'Honda' },
  { id: 'brand-bajaj', name: 'Bajaj' },
  { id: 'brand-tvs', name: 'TVS' },
  { id: 'brand-re', name: 'Royal Enfield' },
  { id: 'brand-yamaha', name: 'Yamaha' },
  { id: 'brand-suzuki', name: 'Suzuki' },
  { id: 'brand-ktm', name: 'KTM' },
];

export const INITIAL_MODELS: BikeModel[] = [
  // Hero
  { id: 'mod-hero-splendor', brand_id: 'brand-hero', brand_name: 'Hero', name: 'Splendor Plus', engine_cc: 97, variant: 'Self Drum', category: 'motorcycle' },
  { id: 'mod-hero-hf', brand_id: 'brand-hero', brand_name: 'Hero', name: 'HF Deluxe', engine_cc: 97, variant: 'Kick Start', category: 'motorcycle' },
  { id: 'mod-hero-passion', brand_id: 'brand-hero', brand_name: 'Hero', name: 'Passion Pro', engine_cc: 113, variant: 'Disc', category: 'motorcycle' },
  { id: 'mod-hero-glamour', brand_id: 'brand-hero', brand_name: 'Hero', name: 'Glamour 125', engine_cc: 125, variant: 'XTEC', category: 'motorcycle' },
  { id: 'mod-hero-xpulse', brand_id: 'brand-hero', brand_name: 'Hero', name: 'Xpulse 200', engine_cc: 199, variant: '4V Rally', category: 'motorcycle' },

  // Honda
  { id: 'mod-honda-shine', brand_id: 'brand-honda', brand_name: 'Honda', name: 'Shine', engine_cc: 124, variant: 'Disc CBS', category: 'motorcycle' },
  { id: 'mod-honda-sp125', brand_id: 'brand-honda', brand_name: 'Honda', name: 'SP 125', engine_cc: 124, variant: 'Drum CBS', category: 'motorcycle' },
  { id: 'mod-honda-activa', brand_id: 'brand-honda', brand_name: 'Honda', name: 'Activa 6G', engine_cc: 109, variant: 'DLX', category: 'scooter' },
  { id: 'mod-honda-unicorn', brand_id: 'brand-honda', brand_name: 'Honda', name: 'Unicorn', engine_cc: 162, variant: 'ABS', category: 'motorcycle' },
  { id: 'mod-honda-cb350', brand_id: 'brand-honda', brand_name: 'Honda', name: 'Hness CB350', engine_cc: 348, variant: 'DLX Pro', category: 'motorcycle' },

  // Bajaj
  { id: 'mod-bajaj-pulsar150', brand_id: 'brand-bajaj', brand_name: 'Bajaj', name: 'Pulsar 150', engine_cc: 149, variant: 'Twin Disc', category: 'motorcycle' },
  { id: 'mod-bajaj-pulsar125', brand_id: 'brand-bajaj', brand_name: 'Bajaj', name: 'Pulsar 125', engine_cc: 124, variant: 'Neon Split', category: 'motorcycle' },
  { id: 'mod-bajaj-platina', brand_id: 'brand-bajaj', brand_name: 'Bajaj', name: 'Platina 100', engine_cc: 102, variant: 'Comfortec', category: 'motorcycle' },
  { id: 'mod-bajaj-ns200', brand_id: 'brand-bajaj', brand_name: 'Bajaj', name: 'Pulsar NS200', engine_cc: 199, variant: 'Dual Channel ABS', category: 'motorcycle' },
  { id: 'mod-bajaj-dominar', brand_id: 'brand-bajaj', brand_name: 'Bajaj', name: 'Dominar 400', engine_cc: 373, variant: 'Touring Edition', category: 'motorcycle' },

  // TVS
  { id: 'mod-tvs-jupiter', brand_id: 'brand-tvs', brand_name: 'TVS', name: 'Jupiter 110', engine_cc: 109, variant: 'ZX Disc SmartXonnect', category: 'scooter' },
  { id: 'mod-tvs-raider', brand_id: 'brand-tvs', brand_name: 'TVS', name: 'Raider 125', engine_cc: 124, variant: 'Split Seat TFT', category: 'motorcycle' },
  { id: 'mod-tvs-apache160', brand_id: 'brand-tvs', brand_name: 'TVS', name: 'Apache RTR 160 4V', engine_cc: 159, variant: 'Special Edition', category: 'motorcycle' },
  { id: 'mod-tvs-ronin', brand_id: 'brand-tvs', brand_name: 'TVS', name: 'Ronin', engine_cc: 225, variant: 'Triple Tone', category: 'motorcycle' },

  // Royal Enfield
  { id: 'mod-re-classic350', brand_id: 'brand-re', brand_name: 'Royal Enfield', name: 'Classic 350', engine_cc: 349, variant: 'Reborn Stealth Black', category: 'motorcycle' },
  { id: 'mod-re-bullet350', brand_id: 'brand-re', brand_name: 'Royal Enfield', name: 'Bullet 350', engine_cc: 349, variant: 'Standard Black', category: 'motorcycle' },
  { id: 'mod-re-hunter350', brand_id: 'brand-re', brand_name: 'Royal Enfield', name: 'Hunter 350', engine_cc: 349, variant: 'Metro Dapper', category: 'motorcycle' },
  { id: 'mod-re-himalayan', brand_id: 'brand-re', brand_name: 'Royal Enfield', name: 'Himalayan 450', engine_cc: 452, variant: 'Summit Hanle Black', category: 'motorcycle' },

  // Yamaha
  { id: 'mod-yamaha-fzs', brand_id: 'brand-yamaha', brand_name: 'Yamaha', name: 'FZ-S FI', engine_cc: 149, variant: 'V4 Deluxe', category: 'motorcycle' },
  { id: 'mod-yamaha-mt15', brand_id: 'brand-yamaha', brand_name: 'Yamaha', name: 'MT-15 V2', engine_cc: 155, variant: 'MotoGP Edition', category: 'motorcycle' },
  { id: 'mod-yamaha-r15', brand_id: 'brand-yamaha', brand_name: 'Yamaha', name: 'YZF R15 V4', engine_cc: 155, variant: 'Racing Blue', category: 'motorcycle' },
  { id: 'mod-yamaha-aerox', brand_id: 'brand-yamaha', brand_name: 'Yamaha', name: 'Aerox 155', engine_cc: 155, variant: 'Standard', category: 'scooter' },

  // Suzuki
  { id: 'mod-suzuki-access', brand_id: 'brand-suzuki', brand_name: 'Suzuki', name: 'Access 125', engine_cc: 124, variant: 'Ride Connect Edition', category: 'scooter' },
  { id: 'mod-suzuki-burgman', brand_id: 'brand-suzuki', brand_name: 'Suzuki', name: 'Burgman Street', engine_cc: 124, variant: 'EX Bluetooth', category: 'scooter' },
  { id: 'mod-suzuki-gixxer', brand_id: 'brand-suzuki', brand_name: 'Suzuki', name: 'Gixxer 150', engine_cc: 155, variant: 'SF Naked', category: 'motorcycle' },

  // KTM
  { id: 'mod-ktm-duke200', brand_id: 'brand-ktm', brand_name: 'KTM', name: 'Duke 200', engine_cc: 199, variant: 'Electronic Orange', category: 'motorcycle' },
  { id: 'mod-ktm-duke250', brand_id: 'brand-ktm', brand_name: 'KTM', name: 'Duke 250', engine_cc: 248, variant: 'Gen 3 Dark Galvano', category: 'motorcycle' },
  { id: 'mod-ktm-rc390', brand_id: 'brand-ktm', brand_name: 'KTM', name: 'RC 390', engine_cc: 373, variant: 'GP Edition', category: 'motorcycle' },
];

export class CatalogueService {
  private static brands: BikeBrand[] = [...INITIAL_BRANDS];
  private static models: BikeModel[] = [...INITIAL_MODELS];
  private static isInitialized = false;

  public static async init(): Promise<void> {
    if (this.isInitialized) return;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbBrands } = await supabase.from('bike_brands').select('*').order('name');
        if (dbBrands && dbBrands.length > 0) {
          this.brands = dbBrands.map((b: any) => ({ id: b.id, name: b.name }));
        }

        const { data: dbModels } = await supabase
          .from('bike_models')
          .select('*, bike_brands(name)')
          .order('name');

        if (dbModels && dbModels.length > 0) {
          this.models = dbModels.map((m: any) => ({
            id: m.id,
            brand_id: m.brand_id,
            brand_name: m.bike_brands?.name || 'Unknown',
            name: m.name,
            engine_cc: m.engine_cc,
            variant: m.variant,
            category: 'motorcycle',
          }));
        }
      } catch (e) {
        console.warn('CatalogueService: using local catalogue fallback', e);
      }
    }
    this.isInitialized = true;
  }

  public static getBrands(): BikeBrand[] {
    return this.brands;
  }

  public static getModelsForBrand(brandName: string): BikeModel[] {
    const trimmed = brandName.trim().toLowerCase();
    return this.models.filter(m => m.brand_name.toLowerCase() === trimmed);
  }

  public static getAllModels(): BikeModel[] {
    return this.models;
  }

  public static findModel(brandName: string, modelName: string): BikeModel | undefined {
    const b = brandName.trim().toLowerCase();
    const m = modelName.trim().toLowerCase();
    return this.models.find(
      item => item.brand_name.toLowerCase() === b && item.name.toLowerCase() === m
    );
  }

  public static async addCustomModel(
    brandName: string,
    modelName: string,
    engineCc: number,
    variant?: string,
    category: VehicleCategory = 'motorcycle'
  ): Promise<BikeModel> {
    const cleanBrand = brandName.trim();
    const cleanModel = modelName.trim();

    // Check duplicate
    const existing = this.findModel(cleanBrand, cleanModel);
    if (existing) {
      return existing;
    }

    // Ensure brand exists
    let brand = this.brands.find(b => b.name.toLowerCase() === cleanBrand.toLowerCase());
    if (!brand) {
      brand = {
        id: `brand-local-${Date.now()}`,
        name: cleanBrand,
      };
      this.brands.push(brand);
    }

    const newModel: BikeModel = {
      id: `model-local-${Date.now()}`,
      brand_id: brand.id,
      brand_name: brand.name,
      name: cleanModel,
      engine_cc: engineCc,
      variant: variant?.trim(),
      category,
    };

    this.models.push(newModel);

    // If Supabase configured, attempt to save to database
    if (isSupabaseConfigured && supabase) {
      try {
        let dbBrandId = brand.id;
        const { data: bData } = await supabase
          .from('bike_brands')
          .upsert({ name: cleanBrand }, { onConflict: 'name' })
          .select('id')
          .single();

        if (bData?.id) {
          dbBrandId = bData.id;
          brand.id = dbBrandId;
        }

        const { data: mData } = await supabase
          .from('bike_models')
          .upsert({
            brand_id: dbBrandId,
            name: cleanModel,
            engine_cc: engineCc,
            variant: variant?.trim() || null,
          })
          .select('id')
          .single();

        if (mData?.id) {
          newModel.id = mData.id;
          newModel.brand_id = dbBrandId;
        }
      } catch (err) {
        console.warn('Could not persist custom model to Supabase', err);
      }
    }

    return newModel;
  }
}
