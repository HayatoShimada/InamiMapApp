import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, GeoPoint } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Old default coordinates (incorrect)
const OLD_DEFAULT_LAT = 36.5561;
const OLD_DEFAULT_LNG = 136.7762;

// New default coordinates (correct - Inami town center)
const NEW_DEFAULT_LAT = 36.5569;
const NEW_DEFAULT_LNG = 136.9628;

async function updateDefaultCoordinates() {
  try {
    // Initialize Firebase Admin if not already initialized
    if (getApps().length === 0) {
      // Check if we have a service account key path in environment
      const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      
      if (serviceAccountPath) {
        const serviceAccount = require(path.resolve(serviceAccountPath));
        initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || serviceAccount.project_id
        });
      } else {
        // Initialize with default credentials (useful for Cloud Functions or GCP environments)
        initializeApp({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID
        });
      }
    }

    const db = getFirestore();
    
    console.log('🔍 Searching for shops with old default coordinates...');
    console.log(`   Old coordinates: ${OLD_DEFAULT_LAT}, ${OLD_DEFAULT_LNG}`);
    console.log(`   New coordinates: ${NEW_DEFAULT_LAT}, ${NEW_DEFAULT_LNG}`);
    
    // Query shops collection
    const shopsRef = db.collection('shops');
    const snapshot = await shopsRef.get();
    
    let updatedCount = 0;
    let checkedCount = 0;
    const updatedShops: string[] = [];
    
    // Check each shop
    for (const doc of snapshot.docs) {
      checkedCount++;
      const data = doc.data();
      
      if (data.location && data.location instanceof GeoPoint) {
        const location = data.location as GeoPoint;
        
        // Check if location matches old default coordinates (with small tolerance for floating point comparison)
        if (Math.abs(location.latitude - OLD_DEFAULT_LAT) < 0.0001 && 
            Math.abs(location.longitude - OLD_DEFAULT_LNG) < 0.0001) {
          
          console.log(`📍 Found shop with old coordinates: ${data.name} (ID: ${doc.id})`);
          
          // Update to new coordinates
          const newLocation = new GeoPoint(NEW_DEFAULT_LAT, NEW_DEFAULT_LNG);
          
          await doc.ref.update({
            location: newLocation,
            updatedAt: new Date().toISOString()
          });
          
          updatedCount++;
          updatedShops.push(`${data.name} (ID: ${doc.id})`);
          console.log(`   ✅ Updated to new coordinates`);
        }
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   Total shops checked: ${checkedCount}`);
    console.log(`   Shops updated: ${updatedCount}`);
    
    if (updatedCount > 0) {
      console.log('\n📝 Updated shops:');
      updatedShops.forEach(shop => console.log(`   - ${shop}`));
    } else {
      console.log('\n✨ No shops found with old default coordinates. Nothing to update.');
    }
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating coordinates:', error);
    process.exit(1);
  }
}

// Run the migration
updateDefaultCoordinates()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });