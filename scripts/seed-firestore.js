/**
 * Firestore Emulator Seed Script
 *
 * このスクリプトは開発環境のFirestoreエミュレータにシードデータを投入します。
 *
 * 使用方法:
 *   node scripts/seed-firestore.js
 *
 * 前提条件:
 *   - Firebase Emulatorが起動していること
 *   - FIRESTORE_EMULATOR_HOST環境変数が設定されていること
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// エミュレータ接続設定（Firebase Admin SDKが読み取る環境変数を設定）
// 注意: admin.initializeApp()を呼ぶ前に設定する必要がある
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
}
if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
}

console.log(`Using Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
console.log(`Using Auth Emulator: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);

// Firebase Admin初期化（エミュレータモード）
// エミュレーター使用時は認証情報は不要
admin.initializeApp({
  projectId: 'demo-inami-map-app',
  // エミュレーター使用時はcredentialを設定しない
});

// Firestoreインスタンスを作成
const db = admin.firestore();

// シードデータを読み込み
const seedDataPath = path.join(__dirname, '..', 'seed', 'seed-data.json');
const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

/**
 * Timestampオブジェクトを変換
 */
function convertTimestamps(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'object') {
    // Timestampの変換
    if (obj._seconds !== undefined && obj._nanoseconds !== undefined) {
      return admin.firestore.Timestamp.fromMillis(obj._seconds * 1000 + obj._nanoseconds / 1000000);
    }

    // GeoPointの変換
    if (obj.latitude !== undefined && obj.longitude !== undefined && Object.keys(obj).length === 2) {
      return new admin.firestore.GeoPoint(obj.latitude, obj.longitude);
    }

    // 配列の処理
    if (Array.isArray(obj)) {
      return obj.map(convertTimestamps);
    }

    // オブジェクトの処理
    const converted = {};
    for (const key of Object.keys(obj)) {
      converted[key] = convertTimestamps(obj[key]);
    }
    return converted;
  }

  return obj;
}

/**
 * コレクションにデータを投入
 */
async function seedCollection(collectionName, documents) {
  console.log(`Seeding ${collectionName}...`);

  const docEntries = Object.entries(documents);
  const BATCH_SIZE = 500; // Firestoreのバッチ制限

  // バッチサイズごとに分割して処理
  for (let i = 0; i < docEntries.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const batchEntries = docEntries.slice(i, i + BATCH_SIZE);

    for (const [docId, docData] of batchEntries) {
      try {
        const docRef = db.collection(collectionName).doc(docId);
        const convertedData = convertTimestamps(docData);
        batch.set(docRef, convertedData);
        console.log(`  - ${docId}`);
      } catch (error) {
        console.error(`  [ERROR] Failed to prepare document ${docId}:`, error.message);
        throw error;
      }
    }

    try {
      console.log(`  Committing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
      await batch.commit();
      console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} committed successfully`);
    } catch (error) {
      console.error(`  [ERROR] Failed to commit batch:`, error);
      throw error;
    }
  }

  console.log(`  Done: ${docEntries.length} documents`);
}

/**
 * メイン処理
 */
async function main() {
  console.log('='.repeat(50));
  console.log('Firestore Emulator Seed Script');
  console.log('='.repeat(50));
  console.log(`Emulator Host: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  console.log('');

  try {
    // Firestore接続テスト
    console.log('Testing Firestore connection...');
    const testRef = db.collection('_test').doc('connection');
    await testRef.set({ test: true });
    await testRef.delete();
    console.log('Connection test successful!\n');

    // 各コレクションにデータを投入
    for (const [collectionName, documents] of Object.entries(seedData)) {
      try {
        await seedCollection(collectionName, documents);
        console.log('');
      } catch (error) {
        console.error(`\n[ERROR] Failed to seed collection ${collectionName}:`, error);
        console.error('Stack:', error.stack);
        throw error;
      }
    }

    console.log('='.repeat(50));
    console.log('Seed completed successfully!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n[FATAL ERROR] Error seeding data:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
    process.exit(1);
  }

  process.exit(0);
}

main();
