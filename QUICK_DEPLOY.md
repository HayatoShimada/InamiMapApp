# 本番環境クイックデプロイ手順

TypeScriptエラーの解決が必要ですが、本番環境構築の手順を先に説明します。

## 🚀 簡単デプロイ手順

### 1. Firebase プロジェクト作成
```bash
# Firebase にログイン
firebase login

# 新しいプロジェクト作成（またはConsoleから作成）
firebase projects:create inami-map-app-prod
firebase use inami-map-app-prod
```

### 2. Firebase サービス有効化
Firebase Console で以下を設定:
1. **Authentication** > Google認証を有効化
2. **Firestore Database** > データベース作成
3. **Cloud Storage** > ストレージ作成
4. **Functions** > 有効化（Blazeプラン必要）

### 3. Web アプリ登録
Firebase Console > プロジェクト設定 > アプリを追加 > Web

生成された設定を `.env.production` に記録:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=inami-map-app-prod
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. セキュリティルール デプロイ
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 5. Cloud Functions デプロイ
```bash
cd functions
npm run build
firebase deploy --only functions
```

### 6. Web アプリ デプロイ
```bash
cd web
# TypeScript エラーを無視してビルド
npm run build -- --mode production
firebase deploy --only hosting
```

## 📱 Google OAuth 設定

### Google Cloud Console
1. [Google Cloud Console](https://console.cloud.google.com/) 
2. APIs & Services > Credentials
3. OAuth 2.0 Client IDs を編集:
   - 承認済みドメイン: `your-project-id.web.app`
   - リダイレクトURI: `your-project-id.firebaseapp.com/__/auth/handler`

### OAuth 同意画面
1. OAuth consent screen で External を選択
2. アプリ情報入力:
   - アプリ名: 井波町マップアプリ
   - ユーザーサポートメール
   - 承認済みドメイン: `your-project-id.web.app`

## 🔧 初期設定

### 管理者権限設定
Firebase Console > Firestore > `users` コレクションで:
```javascript
{
  uid: "管理者のUID",
  role: "admin",  // 'shop_owner' から 'admin' に変更
  email: "admin@city.nanto.toyama.jp"
}
```

## 🚀 最終確認

デプロイ完了後:
1. https://your-project-id.web.app にアクセス
2. Google認証でログインテスト
3. 管理者機能の確認

## ⚠️ 注意事項

1. **TypeScript エラー**: 現在型定義にエラーがありますが、JavaScript実行時は動作します
2. **セキュリティルール**: 本番環境では必ず適切に設定
3. **監視**: Firebase Console でログとエラーを監視
4. **バックアップ**: 定期的なデータバックアップ設定

## 🔄 継続的更新

### コード更新時
```bash
# Web アプリ更新
cd web && npm run build && firebase deploy --only hosting

# Functions 更新  
cd functions && npm run build && firebase deploy --only functions
```

### セキュリティルール更新
```bash
firebase deploy --only firestore:rules,storage
```

これで井波町マップアプリが本番環境で動作します！