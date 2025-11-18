# Migration Scripts

This directory contains one-time migration scripts for database updates and fixes.

## updateDefaultCoordinates.ts

This script updates all shops that have the old incorrect default coordinates to the new correct coordinates for Inami town.

### Background
- **Old coordinates**: 36.5561, 136.7762 (incorrect location)
- **New coordinates**: 36.5569, 136.9628 (correct Inami town center)

### Prerequisites

1. **Firebase Admin SDK credentials**: You need to have Firebase Admin SDK credentials set up. Either:
   - Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable pointing to your service account JSON file
   - Run from a Google Cloud environment with default credentials

2. **Install dependencies**:
   ```bash
   cd web
   npm install
   ```

### Usage

Run the migration script:
```bash
npm run migrate:coordinates
```

### What it does

1. Connects to Firebase Admin SDK
2. Queries all shops in the database
3. Finds shops with location matching the old default coordinates
4. Updates them to the new correct coordinates
5. Logs all changes made

### Safety

- The script only updates shops that exactly match the old coordinates
- It adds an `updatedAt` timestamp to track when the migration was performed
- All changes are logged for audit purposes

### Example output

```
🔍 Searching for shops with old default coordinates...
   Old coordinates: 36.5561, 136.7762
   New coordinates: 36.5569, 136.9628

📍 Found shop with old coordinates: サンプル店舗 (ID: abc123)
   ✅ Updated to new coordinates

📊 Migration Summary:
   Total shops checked: 15
   Shops updated: 3

📝 Updated shops:
   - サンプル店舗 (ID: abc123)
   - テスト店舗 (ID: def456)
   - 新規店舗 (ID: ghi789)

✅ Migration completed successfully!
```