# 🔧 Firebase Console 設定が必要

Storage権限の修正は完了しましたが、まだFirebase Authenticationの設定が必要です。

## 🚨 緊急対応が必要な設定

### 1. Firebase Authentication 有効化

**必須作業**: [Firebase Console](https://console.firebase.google.com/project/inami-map-app-prod/authentication) で以下を実行:

1. **Authentication** ページにアクセス
2. **「始める」** ボタンをクリック
3. **Sign-in method** タブを選択
4. **Google** をクリックして有効化
5. **プロジェクトのサポートメール**を設定: `info@85-store.com`
6. **保存** をクリック

### 2. Google OAuth 設定

**必須作業**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=inami-map-app-prod) で以下を実行:

#### OAuth 2.0 Client IDs の設定
1. **認証情報** ページにアクセス
2. **OAuth 2.0 Client IDs** をクリック
3. **承認済みの JavaScript 生成元** に追加:
   ```
   https://inami-map-app-prod.web.app
   https://inami-map-app-prod.firebaseapp.com
   ```

4. **承認済みのリダイレクト URI** に追加:
   ```
   https://inami-map-app-prod.firebaseapp.com/__/auth/handler
   ```

#### OAuth 同意画面の設定
1. **OAuth 同意画面** ページにアクセス
2. **User Type**: **External** を選択
3. **アプリ情報** を入力:
   - **アプリ名**: 井波町マップアプリ
   - **ユーザーサポートメール**: info@85-store.com
   - **承認済みドメイン**: `inami-map-app-prod.web.app`
   - **デベロッパーの連絡先情報**: info@85-store.com

## ✅ 修正済み項目

### Storage Rules
- ✅ 一時アップロード用パス (`/shops/temp/`, `/events/temp/`) を追加
- ✅ 認証済みユーザーによる画像アップロード許可
- ✅ 管理者権限の追加

### 修正内容
```javascript
// 一時アップロード用（認証済みユーザーのみ）
match /shops/temp/{allPaths=**} {
  allow read, write: if request.auth != null;
}

match /events/temp/{allPaths=**} {
  allow read, write: if request.auth != null;
}
```

## 🎯 設定完了後の確認手順

1. **本番サイトアクセス**: https://inami-map-app-prod.web.app
2. **Google認証テスト**: ログインボタンをクリック
3. **画像アップロードテスト**: 店舗登録で画像アップロード
4. **データ作成テスト**: 店舗・イベント情報の登録

## 📞 設定サポート

**手順でご不明な点があれば**:
1. Firebase Console: https://console.firebase.google.com/project/inami-map-app-prod
2. Google Cloud Console: https://console.cloud.google.com/?project=inami-map-app-prod

**設定完了後**:
井波町マップアプリがフル機能で動作開始します！

---

## ⚡ 最優先作業
**Firebase Authentication の有効化** を最初に行ってください。この設定なしではログイン機能が動作しません。