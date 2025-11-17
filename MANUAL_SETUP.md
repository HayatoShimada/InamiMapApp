# 手動セットアップ手順

Firebase CLI でエラーが発生しているため、手動でセットアップを行います。

## 🔧 Step 1: Firebase Console でプロジェクト作成

### 1.1 プロジェクト作成
1. **[Firebase Console](https://console.firebase.google.com/)** にアクセス
2. **「プロジェクトを追加」** をクリック
3. **プロジェクト名**: `inami-map-app` (または `inami-town-map`)
4. **Google Analytics**: 有効化
5. **プロジェクト作成** をクリック

### 1.2 サービス有効化

#### Authentication
1. **Authentication** → **「始める」**
2. **Sign-in method** → **Google** を有効化
3. **保存**

#### Firestore Database  
1. **Firestore Database** → **「データベースの作成」**
2. **本番環境モード** を選択
3. **ロケーション**: `asia-northeast1` (東京)
4. **完了**

#### Cloud Storage
1. **Storage** → **「始める」**
2. **本番環境モード** を選択
3. **ロケーション**: 同じリージョン
4. **完了**

#### Cloud Functions
1. **Functions** → **「始める」**
2. **Blazeプランにアップグレード** (課金が必要)
3. **続行**

## 🔧 Step 2: Web アプリ登録

### 2.1 アプリ追加
1. **プロジェクト設定** (歯車アイコン)
2. **「アプリを追加」** → **</> (Web)**
3. **アプリ名**: `井波町マップアプリ`
4. **Firebase Hosting**: ✓ チェック
5. **アプリを登録**

### 2.2 設定情報をコピー
表示される設定をメモ:

```javascript
// 例 - 実際の値は異なります
const firebaseConfig = {
  apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO2Pq",
  authDomain: "inami-map-app.firebaseapp.com",
  projectId: "inami-map-app",
  storageBucket: "inami-map-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789"
};
```

## 🔧 Step 3: ローカル設定

### 3.1 環境変数ファイル更新

`/Users/hayatoshimada/Documents/Code/InamiMapApp/web/.env.production` を編集:

```bash
# Step2 で取得した実際の値に置き換え
VITE_FIREBASE_API_KEY=AIzaSyDOCAbC123dEf456GhI789jKl01-MnO2Pq
VITE_FIREBASE_AUTH_DOMAIN=inami-map-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=inami-map-app
VITE_FIREBASE_STORAGE_BUCKET=inami-map-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789
VITE_API_BASE_URL=https://inami-map-app.web.app
```

### 3.2 Firebase CLI 再設定

```bash
# プロジェクトディレクトリに移動
cd /Users/hayatoshimada/Documents/Code/InamiMapApp

# 再ログイン
firebase login

# プロジェクトIDを指定 (Step1で作成したプロジェクトID)
firebase use --add inami-map-app

# 確認
firebase projects:list
```

## 🚀 Step 4: デプロイ

### 4.1 Firebase設定ファイル作成

```bash
# 手動で .firebaserc 作成
echo '{
  "projects": {
    "default": "inami-map-app"
  }
}' > .firebaserc
```

### 4.2 セキュリティルールデプロイ

```bash
# Firestore ルール
firebase deploy --only firestore:rules

# Storage ルール  
firebase deploy --only storage
```

### 4.3 Cloud Functions デプロイ

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### 4.4 Web アプリ デプロイ

```bash
cd ../web
npm run build
firebase deploy --only hosting
```

## 🔍 Step 5: Google OAuth 設定

### 5.1 Google Cloud Console
1. **[Google Cloud Console](https://console.cloud.google.com/)** にアクセス
2. **同じプロジェクト** を選択
3. **APIs & Services** → **Credentials**
4. **OAuth 2.0 Client IDs** をクリック

### 5.2 認証設定
**承認済みの JavaScript 生成元**:
- `https://inami-map-app.web.app`
- `https://inami-map-app.firebaseapp.com`

**承認済みのリダイレクト URI**:
- `https://inami-map-app.firebaseapp.com/__/auth/handler`

### 5.3 OAuth 同意画面
1. **OAuth consent screen**
2. **External** 選択
3. **アプリ情報入力**:
   - アプリ名: 井波町マップアプリ
   - ユーザーサポートメール: info@85-store.com
   - 承認済みドメイン: inami-map-app.web.app

## ✅ Step 6: 完了確認

1. **アクセステスト**: `https://inami-map-app.web.app`
2. **ログインテスト**: Google認証を実行
3. **機能テスト**: 店舗登録、イベント作成をテスト

## 🚨 トラブルシューティング

### Firebase CLI エラーの場合
```bash
# キャッシュクリア
npm cache clean --force
npm install -g firebase-tools

# 再ログイン
firebase logout
firebase login
```

### ビルドエラーの場合
```bash
# TypeScript エラーを無視してビルド
cd web
npm run build -- --mode production
```

### 認証エラーの場合
- Google Cloud Console でドメイン設定を再確認
- Firebase Console で認証設定を確認

## 📞 サポート情報

- **Firebase Console**: https://console.firebase.google.com/
- **Google Cloud Console**: https://console.cloud.google.com/
- **Firebase ドキュメント**: https://firebase.google.com/docs

この手順に従って本番環境をセットアップしてください！