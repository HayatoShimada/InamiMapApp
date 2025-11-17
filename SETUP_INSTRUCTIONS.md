# Firebase Console 設定手順

## 📋 手動設定が必要な項目

### 1. Firebase Console での設定
https://console.firebase.google.com/

1. **プロジェクト作成**:
   - プロジェクト名: `inami-map-app`
   - Google Analytics: 有効化

2. **Authentication 設定**:
   - Authentication > 始める
   - Sign-in method > Google を有効化
   - 承認済みドメイン: 後で追加

3. **Firestore Database**:
   - Firestore Database > データベース作成
   - 本番環境モード
   - ロケーション: asia-northeast1 (東京)

4. **Cloud Storage**:
   - Storage > 始める  
   - 本番環境モード
   - 同じロケーション

5. **Functions**:
   - Functions > 始める
   - Blazeプラン (従量課金) にアップグレード

### 2. Web アプリ登録

プロジェクト設定 > アプリを追加 > Web:
```
アプリ名: 井波町マップアプリ
Firebase Hosting: ✓ チェック
```

### 3. 設定情報のコピー

Web アプリの設定から以下の情報をコピー:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

### 4. 環境変数ファイル更新

`web/.env.production` を以下のように更新:

```env
VITE_FIREBASE_API_KEY=AIzaSy...  # ← 実際の値に置換
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
VITE_API_BASE_URL=https://your-project-id.web.app
```

### 5. Firebase CLI 設定

ターミナルで実行:

```bash
# プロジェクトディレクトリに移動
cd /Users/hayatoshimada/Documents/Code/InamiMapApp

# Firebase ログイン（ブラウザが開きます）
firebase login

# プロジェクトを選択
firebase use your-project-id

# プロジェクト確認
firebase projects:list
```

### 6. セキュリティルールのデプロイ

```bash
# Firestore ルール
firebase deploy --only firestore:rules

# Storage ルール  
firebase deploy --only storage
```

### 7. Cloud Functions デプロイ

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### 8. Web アプリ デプロイ

```bash
cd web
npm run build
firebase deploy --only hosting
```

## 🔍 Google OAuth 設定

### Google Cloud Console
https://console.cloud.google.com/

1. **APIs & Services > Credentials**
2. **OAuth 2.0 Client IDs** を編集
3. **承認済みの JavaScript 生成元**:
   - `https://your-project-id.web.app`
   - `https://your-project-id.firebaseapp.com`

4. **承認済みのリダイレクト URI**:
   - `https://your-project-id.firebaseapp.com/__/auth/handler`

### OAuth 同意画面
1. **OAuth consent screen**
2. **External** を選択
3. **アプリ情報**:
   - アプリ名: 井波町マップアプリ
   - ユーザーサポートメール: info@85-store.com
   - 承認済みドメイン: your-project-id.web.app

## ✅ 完了確認

デプロイ完了後:
1. `https://your-project-id.web.app` にアクセス
2. Google認証でログインテスト
3. 管理機能の動作確認

## 🚨 重要な注意事項

1. **API キー**: 環境変数ファイルには実際の値を設定
2. **セキュリティルール**: 本番環境では適切に設定済み
3. **料金**: Cloud Functions使用にはBlazeプランが必要
4. **監視**: Firebase Consoleで使用状況を定期確認

## 📞 サポート

設定でご不明な点があれば、Firebase Consoleのドキュメントを参照するか、設定画面のヘルプをご利用ください。