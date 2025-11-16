# 本番環境デプロイ手順

## 1. Firebase プロジェクトの作成

### 1.1 Firebase Console でプロジェクト作成
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: `inami-map-app-prod` (または任意の名前)
4. Google Analytics を有効化（推奨）
5. プロジェクトを作成

### 1.2 Firebase サービスの有効化

#### Authentication の設定
1. Firebase Console > Authentication > 「始める」
2. Sign-in method タブ > Google を有効化
3. プロジェクトのサポートメールを設定
4. 「保存」をクリック

#### Firestore Database の設定
1. Firebase Console > Firestore Database > 「データベースの作成」
2. セキュリティルール: 「本番環境モードで開始」を選択
3. ロケーション: `asia-northeast1` (東京) を推奨
4. 「完了」をクリック

#### Cloud Storage の設定
1. Firebase Console > Storage > 「始める」
2. セキュリティルール: 「本番環境モードで開始」
3. ロケーション: `asia-northeast1` を選択
4. 「完了」をクリック

#### Cloud Functions の設定
1. Firebase Console > Functions
2. 「始める」をクリック
3. 料金プラン: Blaze (従量課金) にアップグレード

### 1.3 Web アプリの登録
1. Firebase Console > プロジェクト設定
2. 「アプリを追加」> Web アイコンを選択
3. アプリ名: `井波町マップアプリ`
4. Firebase Hosting を設定: チェック
5. 「アプリを登録」

## 2. 環境設定ファイルの作成

### 2.1 本番用環境変数ファイル
```bash
# web/.env.production を作成
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=https://your-project-id.web.app
```

### 2.2 Firebase CLI 認証
```bash
firebase login
firebase use --add your-project-id
```

## 3. セキュリティルールのデプロイ

### 3.1 Firestore セキュリティルール
```bash
firebase deploy --only firestore:rules
```

### 3.2 Storage セキュリティルール
```bash
firebase deploy --only storage
```

## 4. Cloud Functions のデプロイ

### 4.1 Functions の依存関係インストール
```bash
cd functions
npm install
```

### 4.2 環境変数の設定
```bash
# メール送信用の設定
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"
firebase functions:config:set email.from="noreply@city.nanto.toyama.jp"
firebase functions:config:set admin.email="admin@city.nanto.toyama.jp"
```

### 4.3 Functions のデプロイ
```bash
firebase deploy --only functions
```

## 5. Web アプリのデプロイ

### 5.1 本番ビルド
```bash
cd web
npm run build
```

### 5.2 Hosting にデプロイ
```bash
firebase deploy --only hosting
```

## 6. Google OAuth 認証の設定

### 6.1 Google Cloud Console での設定
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択 (Firebase と同じプロジェクト)
3. APIs & Services > Credentials
4. OAuth 2.0 Client IDs を設定:
   - 承認済みの JavaScript 生成元: `https://your-project-id.web.app`
   - 承認済みのリダイレクト URI: `https://your-project-id.firebaseapp.com/__/auth/handler`

### 6.2 OAuth 同意画面の設定
1. OAuth consent screen
2. User Type: External
3. アプリ情報を入力:
   - アプリ名: 井波町マップアプリ
   - ユーザー サポートメール
   - デベロッパーの連絡先情報
4. スコープ: email, profile
5. テストユーザーを追加（公開前）

## 7. 初期データの投入

### 7.1 管理者ユーザーの設定
```bash
# Firebase Console > Firestore > users コレクション
# 管理者ユーザーの role を 'admin' に設定
```

### 7.2 初期店舗データ（オプション）
```javascript
// サンプル店舗データをFirestoreに追加
```

## 8. 監視とログの設定

### 8.1 Firebase Analytics
- Firebase Console > Analytics で確認

### 8.2 Cloud Functions ログ
```bash
firebase functions:log
```

### 8.3 エラー監視
- Firebase Console > Crashlytics (オプション)

## 9. 本番環境URL

デプロイ完了後のアクセスURL:
- **Webアプリ**: https://your-project-id.web.app
- **Firebase Console**: https://console.firebase.google.com/project/your-project-id

## 10. 継続的デプロイ (CI/CD)

### GitHub Actions の設定 (オプション)
```yaml
# .github/workflows/firebase-hosting-merge.yml
name: Deploy to Firebase Hosting on merge
on:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

## 注意事項

1. **セキュリティ**:
   - 本番環境では必ずセキュリティルールを適切に設定
   - API キーは環境変数で管理
   - 管理者権限は慎重に付与

2. **パフォーマンス**:
   - 画像最適化の実装
   - Firestore インデックスの設定
   - CDN の利用検討

3. **監視**:
   - ログ監視の設定
   - エラー通知の設定
   - 利用状況の監視

4. **バックアップ**:
   - Firestore の自動バックアップ設定
   - 定期的なデータエクスポート