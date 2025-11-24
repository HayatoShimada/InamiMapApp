# 井波町マップアプリ

富山県南砺市井波の店舗・イベント情報を管理するための街歩き支援アプリケーションです。

外から来た人が井波を堪能するために、「個人店舗」「イベント」「公共施設」を発見できます。

## ドキュメント

| ドキュメント | 説明 |
|:---|:---|
| [DEVELOPMENT.md](DEVELOPMENT.md) | **開発環境セットアップガイド（Docker/Emulator）** |
| [DESIGN.md](DESIGN.md) | 設計書（アーキテクチャ、機能仕様、データベース設計） |
| [TABLE.md](TABLE.md) | データベーステーブル構造 |
| [TODO.md](TODO.md) | 開発フェーズとToDoリスト |

### その他のドキュメント

| ドキュメント | 説明 |
|:---|:---|
| [DEPLOYMENT.md](DEPLOYMENT.md) | 本番環境デプロイ手順 |
| [CLAUDE.md](CLAUDE.md) | Claude Code用開発ガイド |

## プロジェクト構成

```
InamiMapApp/
├── web/              # 店主向けWeb管理画面 (React/Vite/TypeScript)
│   ├── src/          # Reactコンポーネント・ページ
│   ├── public/       # 静的アセット
│   └── package.json
├── mobile/           # ユーザー向けFlutterアプリ
│   ├── lib/          # Dartソースコード
│   ├── android/      # Androidプラットフォームファイル
│   ├── ios/          # iOSプラットフォームファイル
│   └── pubspec.yaml  # Flutter依存関係
├── backend/          # レガシーNode.jsバックエンド（Firebase移行中）
├── shared/           # 共有TypeScript型・ユーティリティ
└── firebase/         # Firebase設定・ルール
```

## 技術スタック

- **バックエンド**: Firebase (BaaS)
  - Cloud Firestore（データベース）
  - Firebase Authentication（Google認証）
  - Cloud Storage（画像保存）
  - Cloud Functions（サーバーレス処理）
  - Firebase Hosting（Webホスティング）
- **Webフロントエンド**: React 18 + TypeScript + Material-UI + Vite
- **モバイルアプリ**: Flutter + Firebase SDK
- **地図**: Google Maps JavaScript API / Google Maps SDK

## クイックスタート

### 必要条件

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) 18以上
- [Flutter SDK](https://flutter.dev/) 3.0以上

### セットアップ（Docker使用・推奨）

Firebase認証情報なしで開発を始められます：

**Windows:**
```cmd
git clone https://github.com/HayatoShimada/InamiMapApp.git
cd InamiMapApp
scripts\start-dev.bat --seed --web
```

**macOS / Linux:**
```bash
git clone https://github.com/HayatoShimada/InamiMapApp.git
cd InamiMapApp
./scripts/start-dev.sh --seed --web
```

これにより：
- Firebase Emulatorsが起動（http://localhost:4000）
- シードデータが投入
- Web管理画面が起動（http://localhost:5173）

### モバイルアプリの起動

```bash
cd mobile
flutter pub get
flutter run
```

詳細は [DEVELOPMENT.md](DEVELOPMENT.md) を参照してください。

## 主な機能

### ユーザー向けモバイルアプリ
- Google Mapsで店舗・イベント・公共施設を表示
- 店舗詳細（営業時間、SNSリンク、画像）
- イベント一覧・詳細表示
- お気に入り機能
- 経路案内（Google Maps連携）

### 店主向けWeb管理画面
- Google認証でログイン
- 店舗情報の登録・編集（画像最大5枚）
- イベントの申請・管理
- 営業時間・臨時休業の設定

### 管理者機能
- ユーザー承認管理
- 店舗承認管理
- イベント承認管理
- 公共施設の登録・管理

## 運営・お問い合わせ

**運営**: 85-Store
- 住所: 富山県南砺市井波3110-1
- 電話: 0763-82-5850
- Email: info@85-store.com

## ライセンス

MIT License（予定）

---

詳細な設計・開発情報は [DESIGN.md](DESIGN.md) を参照してください。
