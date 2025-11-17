

## アプリ仕様書 (更新版 V3)

### 1\. 概要

富山県南砺市井波の「個人店」「店舗無し団体」「イベント」「公共施設」を発見し、**外から来た人が井波を堪能するための街歩き支援アプリ**。

ユーザーはアプリ（クロスプラットフォーム）で情報を閲覧し、店主はWeb管理画面から店舗やイベントの情報を発信。店主会（Admin）が情報の承認管理を行うことで、信頼性の高い情報を提供する。

### 2\. アーキテクチャ

  * **バックエンド**: Firebase (BaaS)
  * **フロントエンド (アプリ)**: クロスプラットフォーム (Flutter推奨)
  * **フロントエンド (管理画面)**: Web (React, Vueなど)

### 3\. 使用技術スタック

  * **バックエンド**:
      * **Database**: Cloud Firestore
      * **Authentication**: Firebase Authentication (**メール/パスワード** 及び **Google認証**)
      * **Storage**: Cloud Storage for Firebase
      * **Serverless**: Cloud Functions for Firebase
      * **Hosting**: Firebase Hosting (店主用Web)
  * **フロントエンド (アプリ)**:
      * Flutter (推奨)
      * Google Maps Platform (SDK)
  * **開発ツール**:
      * VS Code (Cloud Code)
      * Firebase CLI
      * Firebase Emulators

### 4\. 機能仕様

#### 4.1. 一般ユーザー向けアプリ (クロスプラットフォーム)

  * **マップ機能 (最重要)**
      * Google Mapsをベースに、`shops` (店舗) と `maps` (公共施設、歴史的場所、トイレ、駐車場) の情報をピンで同時表示。
      * カテゴリ（例: 「カフェ」「駐車場」「歴史」）での絞り込み表示。
      * 現在地表示、目的地までの**ルート案内**（Google Mapsアプリ連携）。
  * **情報詳細表示**
      * 店舗詳細（説明、SNSリンク、画像最大5枚）。
      * イベント詳細（日時、概要、主催者、参加ショップ一覧、場所、画像最大5枚）。
      * 公共施設詳細。
  * **お気に入り機能**
      * 店舗とイベントに「行きたい！」マークを付けることができる。
      * お気に入り一覧（`users-favorite`）で管理。
  * **履歴機能**
      * 訪問した店舗やイベントを履歴として閲覧可能（`users-history-*`）。
      * （※自動記録は難易度が高いため、初期は「訪問済み」ボタンによる手動記録を推奨）
  * **認証 (オプション)**
      * お気に入り・履歴機能を利用する場合のみ、ユーザー認証（Google認証など）を要求する。閲覧のみは認証不要。

#### 4.2. 店主・管理者向け管理画面 (Web)

  * **共通認証機能**
      * Firebase Authentication (メール/パスワード または Google認証) を使用。
      * ログインユーザーの権限 (`role: 'admin'` or `'shop_member'`) に応じて表示するメニューを変更。
  * **店主機能 (`shop_member` ロール)**
      * **店舗情報管理**: 自身の `shops` 情報を登録・編集（SNS情報、位置、説明、カテゴリ、画像5枚）。
      * **イベント申請**: イベント情報を登録（日時、概要、主催者、**参加ショップ一覧**、場所、画像5枚）。
          * 登録時、`status` は自動的に `pending` (承認待ち) となる。
      * **店舗なしユーザー**: 店舗情報を持たないユーザーもイベント申請が可能。
  * **管理者機能 (`admin` ロール)**
      * **イベント承認**: `status` が `pending` のイベントを一覧表示し、「承認 (`approved`)」または「否認 (`rejected`)」する。承認されたイベントのみがアプリに公開される。
      * **カテゴリ管理**: `shopCategory`（店舗カテゴリ）と `eventCategory`（イベントカテゴリ）のマスターデータを登録・編集・削除できる。
      * **公共施設管理**: `maps` コレクション（トイレ、駐車場、歴史的場所）の情報を登録・編集・削除できる。
      * **ユーザー管理**: `users` コレクションの `role` を変更（例: 一般店主を 'admin' に昇格）。

### 5\. データベース設計 (Cloud Firestore)

ご提示いただいた「テーブル構造」を基に、Firestoreのコレクションとして再定義しました。

```
// ユーザー (店主・管理者・一般ユーザー)
/users/{userId}
  - email: "user@example.com"
  - displayName: "ユーザー名"
  - role: "admin" | "shop_member" | "general" (権限)
  - createdAt: Timestamp
  // サブコレクション (一般ユーザー向け)
  /users-favorite/{docId} (お気に入り: shopId or eventId)
  /users-history-events/{eventId} (イベント履歴)
  /users-history-shops/{shopId} (店舗履歴)

// 店舗情報
/shops/{shopId}
  - ownerUserId: "{userId}" (usersへの参照)
  - shopName: "店舗名"
  - description: "説明文"
  - snsLinks: { instagram: "...", x: "..." }
  - location: GeoPoint
  - category: "shopCategoryId" (カテゴリマスターへの参照)
  - images: ["url1", ..., "url5"] (最大5枚)
  - shopRole: "member" (店主会所属などの区分)

// イベント情報
/events/{eventId}
  - ownerUserId: "{userId}" (申請者)
  - eventName: "イベント名"
  - description: "概要"
  - eventTimeStart: Timestamp
  - eventTimeEnd: Timestamp
  - organizer: "主催者名"
  - participatingShops: ["shopId1", "shopId2"] (参加ショップ一覧)
  - locations: [{ name: "会場A", location: GeoPoint }, ...] (複数場所対応)
  - images: ["url1", ..., "url5"] (最大5枚)
  - category: "eventCategoryId"
  - status: "pending" | "approved" | "rejected" (承認ステータス)

// 公共施設・ロケーション情報
/maps/{mapId}
  - name: "井波別院 瑞泉寺"
  - description: "..."
  - location: GeoPoint
  - category: "mapCategoryId" (カテゴリマスターへの参照)
  - images: ["url1", ...]

// マスターデータ (AdminがWeb管理画面で編集)
/masterData/shopCategories
  - categories: [{ id: "cafe", name: "カフェ" }, ...]
/masterData/eventCategories
  - categories: [{ id: "market", name: "マーケット" }, ...]
/masterData/mapCategories
  - categories: [{ id: "toilet", name: "トイレ" }, { id: "history", name: "歴史" }, ...]
```

### 6\. ストレージ設計 (Cloud Storage)

  * `/shops/{shopId}/image_1.jpg` (最大5枚)
  * `/events/{eventId}/image_1.jpg` (最大5枚)
  * `/maps/{mapId}/image_1.jpg`

### 7\. セキュリティルール (概要)

  * **Firestore**:
      * `users/{userId}`: 認証ユーザーは自身のドキュメント及びサブコレクションのみ読み書き可。
      * `shops`: 全ユーザー読み取り可。書き込みは `ownerUserId` が自身のUIDと一致する場合のみ。
      * `events`: `status == "approved"` のドキュメントのみ全ユーザー読み取り可。書き込みは `ownerUserId` が自身のUIDと一致する（`status` は `pending` のみ）、または `role == "admin"` の場合許可。
      * `maps` / `masterData`: 全ユーザー読み取り可。書き込みは `role == "admin"` のみ許可。
  * **Storage**:
      * 全ファイル: 全ユーザー読み取り可。
      * 書き込み: 認証ユーザー (`request.auth != null`) のみ。パスとUIDを照合。

-----

## 開発 ToDo リスト (1人開発 / V3仕様対応版)

### フェーズ 0: 環境構築と設計 (1〜2日)

1.  **Firebase プロジェクト作成** (Blazeプラン推奨)
2.  **クロスプラットフォーム環境構築** (Flutter推奨)
3.  **VS Code (Cloud Code) 環境整備**
4.  **Firebase Emulators 設定** (Auth, Firestore, Storage, Functions)
5.  **Firestore データモデル設計 (確定)**
      * 上記「5. データベース設計」に基づき、初期データ投入スクリプト（特に `masterData`）を準備。

-----

### フェーズ 1: バックエンド基盤 (Firebase) (3〜4日)

1.  **Firebase Authentication 設定**
      * 「メール/パスワード」と「Google」の両方を有効化。
2.  **Firestore 設定と初期データ投入**
      * `masterData` コレクションにカテゴリ（カフェ、トイレ、駐車場など）の初期データを投入。
3.  **Cloud Storage 設定**
4.  **Firebase セキュリティルール (初期設定)**
      * `role` ベース (`admin` / `shop_member`) のアクセス制御ルールを記述。
5.  **Cloud Functions (初期設定)**
      * ユーザー新規登録時 (Authトリガー) に、自動で `users` コレクションにドキュメントを作成し、デフォルト `role: 'shop_member'` を設定する（または `general` にし、Adminが手動昇格）。

-----

### フェーズ 2: 店主・管理者用 Web管理画面 (7〜10日)

1.  **Webプロジェクトセットアップ** (React/Vue + Firebase Hosting)
2.  **認証機能**
      * メール/パスワード登録、Googleログイン、ログアウト機能。
      * ログイン後、`users` コレクションの `role` に応じてリダイレクト。
3.  **店主 (`shop_member`) 機能**
      * 店舗情報（`shops`）登録・編集フォーム（SNS、画像5枚、マップでの位置選択）。
      * イベント（`events`）**申請**フォーム（ステータスは `pending` で固定）。
          * 「参加ショップ一覧」を選択できるUI。
4.  **管理者 (`admin`) 機能 (最重要)**
      * **イベント承認ダッシュボード**: `status == "pending"` の `events` を一覧表示し、「承認」「否認」できる機能。
      * **公共施設 (`maps`) 管理**: トイレ、駐車場、歴史的場所を登録・編集・削除できるCRUD機能。
      * **マスターデータ管理**: `shopCategories`, `eventCategories` などを管理するCRUD機能。
      * (オプション) ユーザー管理: ユーザー一覧と `role` 変更機能。
5.  **デプロイ**
      * `firebase deploy --only hosting, functions`

-----

### フェーズ 3: ユーザー用アプリ (フロントエンド クロスプラットフォーム) (10〜14日)

1.  **Firebase プロジェクト連携** (iOS / Android)
2.  **Google Maps Platform 連携**
3.  **データ表示機能**
      * **マップ表示**: `shops` と `maps` の両コレクションからデータを取得し、カテゴリ別アイコンでピン表示。`events` は `status == "approved"` のみ取得。
      * **カテゴリ絞り込み**: Firestore の `where` クエリを使用して絞り込み。
      * **詳細画面**: 店舗、イベント、公共施設の詳細画面を作成。
4.  **お気に入り・履歴機能**
      * (オプション) 匿名認証またはGoogle認証でユーザーを識別。
      * 「行きたい！」ボタンで `users-favorite` サブコレクションに書き込み。
      * マイページで `users-favorite` と `users-history-*` を一覧表示。
5.  **ルート案内**
      * 選択したピンの緯度経度を Google Maps アプリに渡して起動。

-----

### フェーズ 4: バックエンド処理 (Cloud Functions) (3〜5日)

1.  **画像リサイズ** (Storageトリガー)
      * `shops`, `events`, `maps` にアップロードされた画像を自動リサイズし、サムネイルを作成。（必須）
2.  **データクリーンアップ** (Functionsトリガー)
      * (オプション) 店舗やユーザーが削除された場合、関連するイベントや画像も削除する。
      * (オプション) 終了したイベントを自動で非表示にするバッチ処理（Pub/Sub）。
3.  **画像枚数制限 (サーバーサイド)**
      * (オプション) Storageトリガーで、5枚を超える画像アップロードを検知し削除。

-----

### フェーズ 5: テストとリリース

1.  **セキュリティルール強化**
      * 本番リリースに向け、スキーマバリデーション（例: `images` 配列は5件まで）を追加。
2.  **テスト** (Firebase Emulators, Test Lab)
3.  **リリース** (App Store Connect / Google Play Console)