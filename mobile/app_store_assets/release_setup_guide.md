# アプリストア公開準備ガイド

## Android (Google Play Store) 準備

### 1. アプリ署名の設定

#### キーストアファイルの作成
```bash
# Android Studioまたはコマンドラインで実行
keytool -genkey -v -keystore ~/inami-map-app-release-key.keystore \
  -alias inami-map-app \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# 以下の情報を入力：
# - キーストアパスワード（安全な場所に保存）
# - エイリアスパスワード  
# - 名前: Inami Map App
# - 組織: Inami Town
# - 市区町村: Nanto
# - 都道府県: Toyama
# - 国コード: JP
```

#### key.propertiesファイルの作成
```properties
# android/key.properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD  
keyAlias=inami-map-app
storeFile=../inami-map-app-release-key.keystore
```

#### build.gradleの更新
android/app/build.gradleに署名設定を追加：

```gradle
android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 2. リリースビルドの作成
```bash
flutter build apk --release
flutter build appbundle --release  # 推奨形式
```

### 3. Google Play Console セットアップ

#### 必要な素材
- **アプリアイコン**: 512×512px（PNG）
- **スクリーンショット**: 
  - 電話: 最低2枚、最大8枚（1080×1920px推奨）
  - タブレット: 最低1枚（1200×1920px推奨）
- **フィーチャーグラフィック**: 1024×500px
- **短い説明**: 80文字以内
- **詳細説明**: 4000文字以内

#### ストアリスティング情報
- **アプリ名**: 井波マップアプリ
- **カテゴリ**: マップ・ナビゲーション
- **対象年齢**: 3歳以上
- **コンテンツレーティング**: Everyone

## iOS (App Store) 準備

### 1. Apple Developer アカウント
- Apple Developer Program (年額11,800円) への登録が必要
- App Store Connect へのアクセス

### 2. アプリ署名とプロビジョニング
- Xcode での自動署名設定
- Distribution Certificate の作成
- App Store Distribution Provisioning Profile

### 3. App Store Connect セットアップ

#### 必要な素材
- **アプリアイコン**: 1024×1024px（PNG、角丸なし）
- **スクリーンショット**:
  - iPhone: 1290×2796px (iPhone 14 Pro)
  - iPad: 2048×2732px (12.9インチ iPad Pro)
- **アプリプレビュー**: 最大3本（15-30秒）

#### App Information
- **アプリ名**: 井波マップアプリ  
- **サブタイトル**: 井波町の店舗・イベント探索
- **カテゴリ**: ナビゲーション
- **コンテンツレーティング**: 4+

### 4. 共通設定

#### バージョン管理
```yaml
# pubspec.yaml
version: 1.0.0+1  # 1.0.0はバージョン名、1はビルド番号
```

#### アプリ権限の説明
- **位置情報**: 地図表示と店舗検索のため
- **インターネット**: 店舗・イベント情報の取得
- **ストレージ**: お気に入り情報の保存

## セキュリティチェックリスト

### コード署名
- ✅ リリース用証明書の設定
- ✅ ProGuard/R8 による難読化
- ✅ デバッグ情報の除去

### APIキー管理  
- ✅ Firebase設定ファイルの確認
- ✅ 本番環境用API制限の設定
- ✅ 不要なデバッグコードの削除

### プライバシー
- ✅ プライバシーポリシーの設置
- ✅ 個人情報の適切な取り扱い
- ✅ 権限使用理由の明記

## リリース前最終チェック

### 機能テスト
- ✅ すべての主要機能の動作確認
- ✅ 異なる画面サイズでのテスト
- ✅ ネットワーク接続エラーハンドリング
- ✅ ログイン/ログアウト機能

### パフォーマンス
- ✅ アプリ起動時間の最適化
- ✅ メモリ使用量の確認
- ✅ バッテリー消費の確認

### ユーザビリティ
- ✅ 直感的なUI/UX
- ✅ エラーメッセージの分かりやすさ
- ✅ ローディング状態の表示