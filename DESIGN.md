承知いたしました。一人での開発、Firebase活用、バックエンド/フロント分離、店主によるイベント登録（Webから）という具体的な要件に基づき、開発ToDoと更新版の仕様書を作成します。

-----

## 開発 ToDo リスト (1人開発 + Firebase)

### フェーズ 0: 環境構築と設計 (1〜2日)

1.  **Firebase プロジェクト作成**
      * Firebaseコンソールで新規プロジェクトを作成。
      * 料金プランを選択 (初期は Sparkプラン、リリース時にBlazeプランを検討)。
2.  **クロスプラットフォーム環境構築**
      * **Flutter** または **React Native** を選択し、開発環境を構築。
      * (Flutter推奨: Firebaseとの親和性が高く、Google Mapsも統合しやすいため)
3.  **VS Code 環境整備**
      * Firebase Extensions (公式) をインストール。
      * 選択したクロスプラットフォーム技術の拡張機能 (Flutter, Dartなど) をインストール。
4.  **Firebase Emulators 設定**
      * `firebase.json` を設定し、Authentication, Firestore, Storage, Functions のエミュレータを使えるようにする。
      * (Cloud Codeの機能を利用し、ローカルでの実行・デバッグ環境を整える)
5.  **Firestore データモデル設計 (詳細化)**
      * `users` (店主), `shops` (店舗), `events` (イベント) のコレクション構造を決定する (後述の仕様書参照)。

-----

### フェーズ 1: バックエンド基盤 (Firebase) (2〜3日)

1.  **Firebase Authentication 設定**
      * 店主用Web管理画面のため、「メール/パスワード」認証を有効化。
2.  **Firestore 設定**
      * データモデルに基づき、初期コレクションを作成 (手動 or スクリプト)。
3.  **Cloud Storage 設定**
      * バケットを作成。
      * フォルダ構成を決定 (例: `shops/`, `events/`)。
4.  **Firebase セキュリティルール (初期設定)**
      * **Firestore**:
          * `users`: 自分のドキュメントのみ読み書き可。
          * `shops`: 認証ユーザーのみ読み取り可、自分の `shop` のみ書き込み可。
          * `events`: 認証ユーザーのみ読み取り可、自分の `event` のみ書き込み可。
      * **Storage**:
          * 認証ユーザーのみ書き込み可。
          * (ファイルサイズやタイプの制限も設定)

-----

### フェーズ 2: 店主用 Web管理画面 (フロントエンド Web) (5〜7日)

  * (React, Vue, または Angular を選択し、Firebase Hosting でホスティング)

<!-- end list -->

1.  **Webプロジェクトセットアップ**
      * `firebase init hosting` で Firebase Hosting をセットアップ。
      * 選択したWebフレームワークを導入。
2.  **認証機能**
      * 店主の新規登録 (Auth) と、`users` コレクションへの情報保存 (Firestore)。
      * ログイン、ログアウト機能。
      * ログイン状態の永続化。
3.  **店舗情報管理**
      * ログインユーザーに紐づく `shops` ドキュメントの登録・編集フォームを作成。
      * (店舗画像も Storage へアップロード)
4.  **イベント管理機能 (最重要)**
      * **イベント登録フォーム**:
          * 入力項目: イベント名, 日時 (開始/終了), 場所 (住所 or 地図選択)。
          * **画像アップロード**: 複数ファイル選択、**5枚までの制限**をフロントエンドでチェック。
          * アップロード処理 (Cloud Storage へ保存)。
      * **登録処理**:
          * フォーム内容と、アップロードした画像のURL (配列) を `events` コレクションに保存。
          * **重要**: `events` ドキュメントに、ログイン中の `userId` と `shopId` を必ず含める。
      * イベント一覧表示 (自分が登録したもののみ)。
      * イベント編集・削除機能。
5.  **デプロイ**
      * `firebase deploy --only hosting` でWeb管理画面をデプロイ。

-----

### フェーズ 3: ユーザー用アプリ (フロントエンド クロスプラットフォーム) (7〜10日)

1.  **Firebase プロジェクト連携**
      * iOS / Android それぞれに Firebase をセットアップ (`GoogleService-Info.plist` / `google-services.json`)。
2.  **Google Maps Platform 連携**
      * APIキーを取得し、アプリに設定。
      * 地図表示コンポーネントを実装。
3.  **データ表示機能**
      * **マップ連携**: `shops` コレクションを Firestore から取得し、地図上にピンとして表示。
      * **店舗詳細**: ピンをタップすると、店舗詳細情報を表示。
      * **イベント一覧**: `events` コレクションを Firestore から取得 (日付順ソート) し、一覧表示。
      * **イベント詳細**: イベントの画像 (5枚) や詳細情報を表示。
4.  **お気に入り機能**
      * (簡易版) アプリ内のローカルストレージ (SQLite, SharedPreferencesなど) に保存。
      * (Firebase版) 匿名認証などでユーザーを識別し、Firestore に保存。

-----

### フェーズ 4: バックエンド処理 (Cloud Functions) (2〜3日)

1.  **Functions 環境セットアップ**
      * `firebase init functions` (TypeScript推奨)。
2.  **画像アップロード制限 (サーバーサイド)**
      * Storageトリガー (onFinalize) を使用。
      * `events/{eventId}/` パスに画像がアップロードされた時、
      * メタデータ (カスタムメタデータに `userId` を含めると尚良い) を確認し、その `eventId` に紐づく画像が既に5枚ある場合は、新しい画像を削除する (またはフロントのチェックを信頼し、ここではリサイズのみ行う)。
3.  **(推奨) 画像リサイズ**
      * Storageトリガーで、アップロードされた画像をリサイズ (サムネイル作成) し、別のパスに保存。アプリでの表示速度を改善。
4.  **デプロイ**
      * `firebase deploy --only functions`

-----

### フェーズ 5: テストとリリース

1.  **セキュリティルール強化**
      * 本番リリースに向け、Firestore と Storage のルールを厳格化。
2.  **テスト**
      * Firebase Emulators を使ったローカルテスト。
      * Firebase Test Lab (オプション) を使った実機テスト。
3.  **リリース**
      * App Store Connect / Google Play Console への申請準備とストア公開。

-----

-----

## アプリ仕様書 (更新版)

### 1\. 概要

富山県南砺市井波の「マニアックな店」と「イベント」を発見するための街歩きアプリ。
ユーザーはアプリ（クロスプラットフォーム）で情報を閲覧し、店主はWeb管理画面からイベント情報を発信する。

### 2\. アーキテクチャ

  * **バックエンド**: Firebase (BaaS)
  * **フロントエンド (アプリ)**: クロスプラットフォーム (Flutter / React Native)
  * **フロントエンド (管理画面)**: Web (React / Vue など)

### 3\. 使用技術スタック

  * **バックエンド**:
      * **Database**: Cloud Firestore
      * **Authentication**: Firebase Authentication (メール/パスワード)
      * **Storage**: Cloud Storage for Firebase
      * **Serverless**: Cloud Functions for Firebase
      * **Hosting**: Firebase Hosting (店主用Web)
  * **フロントエンド (アプリ)**:
      * Flutter (推奨) または React Native
      * Google Maps Platform (SDK)
  * **開発ツール**:
      * VS Code
      * Firebase CLI
      * Firebase Emulators

### 4\. 機能仕様

#### 4.1. ユーザー向けアプリ (クロスプラットフォーム)

  * **マップ機能**:
      * Google Maps をベースに、Firestore の `shops` 情報をピンで表示。
      * 現在地表示、店舗までのルート案内 (Google Mapsアプリ連携)。
  * **店舗情報**:
      * `shops` コレクションから情報を取得し、詳細（写真、こだわりポイント）を表示。
  * **イベント情報**:
      * `events` コレクションから情報を取得 (日付順)。
      * イベント詳細（日時、場所、画像最大5枚）を表示。
  * **お気に入り**:
      * 店舗やイベントをローカルに保存。

#### 4.2. 店主向け管理画面 (Web)

  * **プラットフォーム**: Webブラウザからのみアクセス可能。(Firebase Hostingで提供)
  * **認証**:
      * Firebase Authentication (メール/パスワード) を使用。
      * 新規店主登録、ログイン、ログアウト。
      * 認証情報は `users` コレクションに紐づく。
  * **店舗情報管理**:
      * ログイン後、自身がオーナーである `shops` 情報を登録・編集できる。
  * **イベント情報管理**:
      * **作成**:
          * 必須項目: イベント名 (String), 日時 (Timestamp), 場所 (String)。
          * 画像: **最大5枚**までアップロード可能。
      * **処理**:
          * 画像は Cloud Storage (`events/{eventId}/{imageName}`) に保存。
          * イベント情報は `events` コレクションに保存。
          * データには必ず `ownerUserId` (AuthのUID) と `shopId` (紐づく店舗ID) を含める。
      * **一覧・編集**:
          * 自分が登録したイベントのみ一覧表示、編集、削除が可能。

### 5\. データベース設計 (Cloud Firestore)

```
/users/{userId}
  - email: "shop_owner@example.com"
  - displayName: "店主名"
  - createdAt: Timestamp

/shops/{shopId}
  - ownerUserId: "{userId}" (usersコレクションへの参照)
  - shopName: "マニアックな店A"
  - description: "..."
  - maniacPoint: "..."
  - location: GeoPoint
  - images: ["url1", "url2"]

/events/{eventId}
  - ownerUserId: "{userId}" (usersコレクションへの参照)
  - shopId: "{shopId}" (shopsコレクションへの参照)
  - eventName: "週末限定ワークショップ"
  - eventTime: Timestamp (開催日時)
  - location: "店舗と同じ"
  - description: "..."
  - images: [
      "url_to_storage_image_1",
      "url_to_storage_image_2",
      "url_to_storage_image_3",
      "url_to_storage_image_4",
      "url_to_storage_image_5"
    ] (最大5件の配列)
```

### 6\. ストレージ設計 (Cloud Storage)

  * `/shops/{shopId}/profile.jpg` (店舗のメイン画像)
  * `/events/{eventId}/image_1.jpg` (イベント画像1)
  * `/events/{eventId}/image_2.jpg` (イベント画像2)
  * ... (最大5枚)

### 7\. セキュリティルール (概要)

  * **Firestore**:
      * `users/{userId}`: 認証ユーザーは自身のドキュメントのみ読み書き可 (`request.auth.uid == userId`)。
      * `shops`: 全ユーザー読み取り可。書き込みは `ownerUserId` が自身のUIDと一致する場合のみ許可。
      * `events`: 全ユーザー読み取り可。書き込みは `ownerUserId` が自身のUIDと一致する場合のみ許可。
  * **Storage**:
      * `/shops/{shopId}/*`: 認証ユーザー (`request.auth != null`) のみ書き込み可。
      * `/events/{eventId}/*`: 認証ユーザーのみ書き込み可。
      * (Cloud Functions と連携し、5枚を超えるアップロードをサーバー側で拒否または削除するロジックを推奨)