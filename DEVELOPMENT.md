# 開発環境セットアップガイド

このドキュメントでは、InamiMapAppの開発環境をセットアップする方法を説明します。

Firebase の認証情報がなくても、Docker経由でFirebase Emulatorsを使用してローカル開発が可能です。

## 目次

- [必要なソフトウェア](#必要なソフトウェア)
- [クイックスタート](#クイックスタート)
- [詳細セットアップ](#詳細セットアップ)
  - [1. リポジトリのクローン](#1-リポジトリのクローン)
  - [2. Firebase Emulatorsの起動](#2-firebase-emulatorsの起動)
  - [3. シードデータの投入](#3-シードデータの投入)
  - [4. Web管理画面の起動](#4-web管理画面の起動)
  - [5. モバイルアプリの起動](#5-モバイルアプリの起動)
- [開発環境のポート一覧](#開発環境のポート一覧)
- [シードデータについて](#シードデータについて)
- [トラブルシューティング](#トラブルシューティング)
- [本番環境へのデプロイ](#本番環境へのデプロイ)

---

## 必要なソフトウェア

開発を始める前に、以下のソフトウェアをインストールしてください：

| ソフトウェア | バージョン | 用途 |
|:---|:---|:---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 最新版 | Firebase Emulatorsの実行 |
| [Node.js](https://nodejs.org/) | 18以上 | Web管理画面・スクリプト |
| [Flutter SDK](https://flutter.dev/docs/get-started/install) | 3.0以上 | モバイルアプリ |
| [Git](https://git-scm.com/) | 最新版 | バージョン管理 |

### オプション（推奨）

- [VS Code](https://code.visualstudio.com/) - 推奨エディタ
  - Flutter拡張機能
  - Docker拡張機能
- [Android Studio](https://developer.android.com/studio) - Androidエミュレータ
- [Xcode](https://developer.apple.com/xcode/) (macOSのみ) - iOSシミュレータ

---

## クイックスタート

最も簡単に開発環境を起動する方法：

### Windows

```cmd
git clone https://github.com/HayatoShimada/InamiMapApp.git
cd InamiMapApp
scripts\start-dev.bat --seed --web
```

### macOS / Linux

```bash
git clone https://github.com/HayatoShimada/InamiMapApp.git
cd InamiMapApp
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh --seed --web
```

これにより：
1. Firebase Emulatorsが起動します
2. シードデータが投入されます
3. Web管理画面が http://localhost:5173 で起動します

---

## 詳細セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/HayatoShimada/InamiMapApp.git
cd InamiMapApp
```

### 2. Firebase Emulatorsの起動

Docker Composeを使用してFirebase Emulatorsを起動します：

```bash
docker compose up -d
```

起動を確認：

```bash
# エミュレータUIにアクセス
open http://localhost:4000  # macOS
start http://localhost:4000 # Windows
```

### 3. シードデータの投入

開発用のサンプルデータを投入します：

```bash
cd scripts
npm install
npm run seed
cd ..
```

シードデータには以下が含まれます：
- 管理者ユーザー（admin@example.com）
- 店主ユーザー2名
- サンプル店舗3件
- サンプルイベント3件
- 公共施設3件

### 4. Web管理画面の起動

```bash
cd web
npm install
npm run dev
```

ブラウザで http://localhost:5173 にアクセスします。

#### ローカル開発時の認証

Firebase Emulatorでは、実際のGoogleアカウントなしでテスト用の認証が可能です：

1. Emulator UI (http://localhost:4000) にアクセス
2. 「Authentication」タブを選択
3. 「Add user」でテストユーザーを作成
4. または、シードデータの管理者アカウントを使用

### 5. モバイルアプリの起動

```bash
cd mobile
flutter pub get
flutter run
```

#### エミュレータ接続の設定

モバイルアプリはデフォルトでFirebase Emulatorsに接続します。

**Androidエミュレータの場合:**
- エミュレータホスト: `10.0.2.2`（自動設定）

**iOSシミュレータの場合:**
- エミュレータホスト: `localhost`

環境変数で変更可能：

```bash
# iOSシミュレータ用
flutter run --dart-define=EMULATOR_HOST=localhost

# 本番環境用（エミュレータを使用しない）
flutter run --dart-define=USE_EMULATOR=false
```

---

## 開発環境のポート一覧

| サービス | ポート | 説明 |
|:---|:---|:---|
| Emulator UI | 4000 | Firebase Emulatorの管理画面 |
| Firestore | 8080 | Firestoreエミュレータ |
| Authentication | 9099 | 認証エミュレータ |
| Storage | 9199 | Cloud Storageエミュレータ |
| Functions | 5001 | Cloud Functionsエミュレータ |
| Web Admin | 5173 | Web管理画面（Vite dev server） |

---

## シードデータについて

シードデータは `seed/seed-data.json` に定義されています。

### データ構造

```
seed/
└── seed-data.json    # シードデータ（JSON形式）
```

### 含まれるデータ

| コレクション | 件数 | 説明 |
|:---|:---|:---|
| users | 3 | 管理者1名、店主2名 |
| shops | 3 | サンプル店舗（承認済み2、申請中1） |
| events | 3 | サンプルイベント（承認済み2、申請中1） |
| publicFacilities | 3 | 公共施設 |
| categories | 2 | 店舗・イベントカテゴリ |

### シードデータのカスタマイズ

`seed/seed-data.json` を編集して、独自のテストデータを追加できます。

編集後、再度シードスクリプトを実行：

```bash
cd scripts
npm run seed
```

---

## トラブルシューティング

### Docker関連

#### エミュレータが起動しない

```bash
# ログを確認
docker compose logs -f

# コンテナを再起動
docker compose down
docker compose up -d
```

#### ポートが使用中

他のプロセスがポートを使用している場合：

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8080
kill -9 <PID>
```

### Web管理画面

#### エミュレータに接続できない

1. Docker コンテナが起動していることを確認
2. `web/src/firebase/config.ts` でエミュレータ接続が有効になっていることを確認
3. ブラウザのコンソールでエラーを確認

### モバイルアプリ

#### Androidエミュレータから接続できない

Androidエミュレータからは `localhost` ではなく `10.0.2.2` を使用する必要があります。
これは `mobile/lib/main.dart` で自動的に設定されます。

#### iOSシミュレータから接続できない

iOSシミュレータからは `localhost` を使用します：

```bash
flutter run --dart-define=EMULATOR_HOST=localhost
```

---

## 本番環境へのデプロイ

本番環境にデプロイする場合は、実際のFirebaseプロジェクトの設定が必要です。

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Firestore, Authentication, Storage を有効化
3. Google認証プロバイダを設定

### 2. 環境変数の設定

**Web管理画面:**

`web/.env` ファイルを作成：

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_USE_FIREBASE_EMULATOR=false
```

**モバイルアプリ:**

```bash
# FlutterFire CLIを使用してfirebase_options.dartを生成
dart pub global activate flutterfire_cli
flutterfire configure
```

### 3. デプロイ

```bash
# Firebase CLIでデプロイ
firebase deploy
```

詳細は [DEPLOYMENT.md](DEPLOYMENT.md) を参照してください。

---

## 開発コマンドリファレンス

### 起動スクリプト

```bash
# エミュレータのみ起動
scripts/start-dev.sh

# シードデータを投入して起動
scripts/start-dev.sh --seed

# Web管理画面も起動
scripts/start-dev.sh --web

# データをクリアして再起動
scripts/start-dev.sh --clean

# 全てのオプションを組み合わせ
scripts/start-dev.sh --clean --seed --web
```

### Docker

```bash
# エミュレータを起動
docker compose up -d

# ログを確認
docker compose logs -f

# エミュレータを停止
docker compose down

# データを含めて完全にクリア
docker compose down -v
```

### Web管理画面

```bash
cd web
npm install        # 依存関係インストール
npm run dev        # 開発サーバー起動
npm run build      # 本番ビルド
npm run lint       # コードチェック
```

### モバイルアプリ

```bash
cd mobile
flutter pub get    # 依存関係インストール
flutter run        # アプリ起動
flutter build apk  # Android APKビルド
flutter build ios  # iOSビルド
flutter test       # テスト実行
```

### シードスクリプト

```bash
cd scripts
npm install        # 依存関係インストール
npm run seed       # シードデータ投入
```

---

## 関連ドキュメント

- [README.md](README.md) - プロジェクト概要
- [DESIGN.md](DESIGN.md) - 設計書
- [TABLE.md](TABLE.md) - データベース設計
- [TODO.md](TODO.md) - 開発フェーズ
- [DEPLOYMENT.md](DEPLOYMENT.md) - デプロイ手順
