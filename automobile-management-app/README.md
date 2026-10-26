# Automobile Management App

Starter foundation for a workshop and second-hand bike inventory app.

## Stack
- Expo + React Native + TypeScript
- Expo Router
- Supabase Auth, Storage and PostgreSQL

## What's included
- Mobile dashboard and inventory starter screen
- Bike inventory entry form (brand, model, engine CC, quantity, selling price, condition)
- Supabase client setup via environment variables
- Initial PostgreSQL schema for brands, models, individual bikes, and inventory summary

## Start the mobile app

1. Install Node.js LTS and Git.
2. Open a terminal in `mobile/`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` and add your Supabase project URL and publishable/anon key.
5. Start Expo:
   ```bash
   npx expo start
   ```
6. Scan the QR code using Expo Go.

The UI currently runs with sample local data if Supabase credentials are not configured. Database persistence will work after the Supabase project is created and the SQL migration is applied.

## Database setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/migrations/0001_initial_schema.sql`.
3. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to `mobile/.env`.
4. Do not put a service-role key in the mobile app.

## Important inventory design note

Each physical second-hand bike is stored as an individual `inventory_bikes` record, allowing separate registration number, odometer, condition and photos. The `model_inventory_summary` view calculates available quantity per model. The quantity shown in the UI is therefore a count, not a manually editable number that can drift out of sync.

## Git

Initialize the repository from this folder:

```bash
git init
git add .
git commit -m "Initial automobile app foundation"
```

Do not commit `.env` files or secrets.
