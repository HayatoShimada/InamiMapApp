承知いたしました。
認証方法を「Google認証のみ」に絞り込むことで、店主（ユーザー）側の利便性が向上し、開発（特に認証周り）の工数を削減できます。非常に合理的な判断です。

この変更を反映した「開発ToDoリスト」と「更新版仕様書」を作成します。

-----

## 開発 ToDo リスト (1人開発 / Google認証版)

### フェーズ 0: 環境構築と設計 (1〜2日)

1.  **Firebase プロジェクト作成**
      * Firebaseコンソールで新規プロジェクトを作成。
2.  **クロスプラットフォーム環境構築**
      * Flutter（またはReact Native）の開発環境をローカルに構築。
3.  **VS Code 環境整備**
      * **Cloud Code (Google Cloud)**: Google Cloud APIへのアクセスやデバッグ支援に活用。
      * **Firebase Extensions (公式)**: Firebase機能の管理支援。
      * Flutter / Dart の拡張機能。
4.  **Firebase Emulators 設定**
      * `firebase init emulators` を実行。
      * `firebase.json` を設定し、**Auth, Firestore, Storage, Functions** のエミュレータを使えるようにする。
      * （Cloud Codeからエミュレータを起動・管理できるように設定）
5.  **Firestore データモデル設計**
      * `users` (店主), `shops` (店舗), `events` (イベント) のコレクション構造を決定。（仕様書参照）

-----

### フェーズ 1: バックエンド基盤 (Firebase) (1〜2日)

1.  **Firebase Authentication 設定 (変更)**
      * プロバイダとして **「Google」を有効化** する。
      * （メール/パスワード認証は無効化）
2.  **Firestore / Storage 初期設定**
      * データベースとストレージバケットを作成。（リージョン選択）
3.  **Firebase セキュリティルール (初期設定)**
      * **Firestore**:
          * `users`: 自分のドキュメントのみ読み書き可。
          * `shops` / `events`: **認証ユーザーのみ読み取り可**、自分のデータのみ書き込み可。
      * **Storage**:
          * **認証ユーザーのみ書き込み可**。

-----

### フェーズ 2: 店主用 Web管理画面 (フロントエンド Web) (5〜7日)

  * （技術選定: React / Vue / Angularなど。Firebase Hostingでホスティング）

<!-- end list -->

1.  **Webプロジェクトセットアップ**
      * `firebase init hosting` で Firebase Hosting をセットアップ。
      * 選択したWebフレームワークを導入。
2.  **認証機能 (最重要・変更点)**
      * **「Googleでログイン」ボタン**を実装。
      * Firebase Auth SDK の `signInWithPopup` または `signInWithRedirect` (Googleプロバイダ指定) を使用。
      * **初回ログイン処理**:
          * 認証成功後、取得したGoogleアカウント情報 (UID, Email, DisplayName, PhotoURL) を Firestore の `users` コレクションに保存するロジックを実装。
      * ログアウト機能。
      * ログイン状態の永続化と自動リダイレクト。
3.  **店舗情報管理**
      * ログインユーザー (`auth.uid`) に紐づく `shops` ドキュメントの登録・編集フォームを作成。
4.  **イベント管理機能**
      * **イベント登録フォーム**:
          * 項目: イベント名, 日時 (開始/終了), 場所。
          * **画像アップロード**: ファイル選択UI。**5枚までの制限**をフロントエンドでチェック。
      * **登録処理**:
          * 画像を Cloud Storage にアップロード。
          * フォーム内容 + 画像URL(配列) + `ownerUserId` (ログインUID) + `shopId` (紐づく店舗ID) を `events` コレクションに保存。
      * イベント一覧表示 (自分が登録したもののみ)。
      * イベント編集・削除機能。
5.  **デプロイ**
      * `firebase deploy --only hosting` でWeb管理画面をデプロイ。
      * デプロイしたURLを Firebase Authentication の「承認済みドメイン」に追加。

-----

### フェーズ 3: ユーザー用アプリ (フロントエンド クロスプラットフォーム) (7〜10日)

1.  **Firebase プロジェクト連携**
      * iOS / Android それぞれに Firebase をセットアップ (`GoogleService-Info.plist` / `google-services.json`)。
2.  **Google Maps Platform 連携**
      * APIキーを取得し、アプリ (iOS/Android) に設定。
      * マップ表示コンポーネントを実装。
3.  **データ表示機能 (Firestore連携)**
      * **マップ連携**: `shops` コレクションを Firestore から取得し、地図上にピンとして表示。
      * **店舗詳細**: ピンタップで詳細情報を表示。
      * **イベント一覧**: `events` コレクションを Firestore から取得 (日付順ソート) し、一覧表示。
      * **イベント詳細**: イベントの画像 (5枚) や詳細情報を表示。
4.  **お気に入り機能**
      * （要件になかったため初期リリースでは除外、またはローカル保存のみ実装）

-----

### フェーズ 4: バックエンド処理 (Cloud Functions) (2〜3日)

1.  **Functions 環境セットアップ**
      * `firebase init functions` (TypeScript推奨)。
2.  **画像アップロード制限 (サーバーサイド・保険)**
      * **Storageトリガー (onFinalize)** を使用。
      * `events/{eventId}/` パスに画像がアップロードされた時、
      * Firestoreの `events/{eventId}` ドキュメントをチェックし、既に `images` 配列が5件ある場合は、6枚目以降の Storage オブジェクトを削除する。
3.  **(推奨) 画像リサイズ**
      * Storageトリガーで、アップロードされた画像を自動リサイズ (サムネイル作成) し、アプリの表示速度を改善。
4.  **デプロイ**
      * `firebase deploy --only functions`

-----

### フェーズ 5: テストとリリース

1.  **セキュリティルール強化**
      * 本番リリースに向け、Firestore と Storage のルールを厳格化。（スキーマバリデーション追加）
2.  **テスト**
      * Firebase Emulators を使用したローカルでの統合テスト。
      * Firebase Test Lab (オプション) を使った実機テスト。
3.  **リリース**
      * App Store Connect / Google Play Console への申請と公開。

-----

-----

## アプリ仕様書 (更新版: Google認証対応)

### 1\. 概要

富山県南砺市井波の「マニアックな店」と「イベント」を発見するための街歩きアプリ。
ユーザーはアプリ（クロスプラットフォーム）で情報を閲覧し、店主はWeb管理画面からイベント情報を発信する。

### 2\. アーキテクチャ

  * **バックエンド**: Firebase (BaaS)
  * **フロントエンド (アプリ)**: クロスプラットフォーム (Flutter推奨)
  * **フロントエンド (管理画面)**: Web (React, Vueなど)
  * **開発支援**: VS Code + Cloud Code

### 3\. 使用技術スタック

  * **バックエンド**:
      * **Database**: Cloud Firestore
      * **Authentication**: Firebase Authentication (**Google認証のみ**)
      * **Storage**: Cloud Storage for Firebase
      * **Serverless**: Cloud Functions for Firebase
      * **Hosting**: Firebase Hosting (店主用Web)
  * **フロントエンド (アプリ)**:
      * Flutter (推奨) または React Native
      * Google Maps Platform (SDK)
  * **開発ツール**:
      * VS Code (Cloud Code)
      * Firebase CLI
      * Firebase Emulators

### 4\. 機能仕様

#### 4.1. ユーザー向けアプリ (クロスプラットフォーム)

  * **認証**: **なし**。一般ユーザーは認証不要で全ての情報を閲覧できる。
  * **マップ機能**:
      * Google Maps をベースに、Firestore の `shops` 情報をピンで表示。
      * 現在地表示、店舗までのルート案内 (Google Mapsアプリ連携)。
  * **店舗情報**:
      * `shops` コレクションから情報を取得し、詳細（写真、こだわりポイント）を表示。
  * **イベント情報**:
      * `events` コレクションから情報を取得 (日付順)。
      * イベント詳細（日時、場所、画像最大5枚）を表示。

#### 4.2. 店主向け管理画面 (Web)

  * **プラットフォーム**: **Webブラウザからのみ**アクセス可能。(Firebase Hostingで提供)
  * **認証**:
      * **Google 認証**: Firebase Authentication (Google サインイン) のみを使用。
      * **ログイン処理**: 「Googleでログイン」ボタンをクリックし、ポップアップ経由で認証。
      * **自動ユーザー登録**: 初回ログイン時、Googleアカウントの情報を Firestore の `users` コレクションに自動で保存する。
      * （メール/パスワードによる登録・ログイン機能は提供しない）
  * **店舗情報管理**:
      * ログイン後、自身がオーナーである `shops` 情報を登録・編集できる。（※初回登録時は、管理者が手動で `ownerUserId` を紐付けるか、別途申請フローが必要かを検討）
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
// 店主会・個人事業主のユーザー情報 (Google認証情報)
/users/{userId} (※userIdはGoogle認証のUID)
  - email: "google_account_email@gmail.com" (Googleから取得)
  - displayName: "店主名 (Google名)" (Googleから取得)
  - photoURL: "google_profile_pic_url" (Googleから取得)
  - createdAt: Timestamp (初回ログイン時)

// 店舗情報
/shops/{shopId}
  - ownerUserId: "{userId}" (usersコレクションへの参照)
  - shopName: "マニアックな店A"
  - description: "..."
  - maniacPoint: "こだわりのポイント"
  - location: GeoPoint (地図表示用の緯度経度)
  - address: "富山県南砺市井波..."
  - images: ["url1", "url2"]

// イベント情報
/events/{eventId}
  - ownerUserId: "{userId}" (usersコレクションへの参照)
  - shopId: "{shopId}" (shopsコレクションへの参照)
  - eventName: "週末限定ワークショップ"
  - eventTimeStart: Timestamp (開催開始日時)
  - eventTimeEnd: Timestamp (開催終了日時)
  - location: "店舗と同じ" (または別途住所)
  - description: "イベント詳細..."
  - images: [
      "url_to_storage_image_1",
      "url_to_storage_image_2",
      "url_to_storage_image_3",
      "url_to_storage_image_4",
      "url_to_storage_image_5"
    ] (最大5件のString配列)
```

### 6\. ストレージ設計 (Cloud Storage)

  * `/shops/{shopId}/profile.jpg`
  * `/events/{eventId}/image_1.jpg` (イベント画像1)
  * `/events/{eventId}/image_2.jpg` (イベント画像2)
  * ... (最大5枚)

### 7\. セキュリティルール (概要)

  * **Firestore**:
      * `users/{userId}`: 認証ユーザーは自身のドキュメントのみ読み書き可 (`request.auth.uid == userId`)。
      * `shops`: **全ユーザー読み取り可**。書き込みは `ownerUserId` が自身のUIDと一致する場合のみ許可。
      * `events`: **全ユーザー読み取り可**。書き込みは `ownerUserId` が自身のUIDと一致する場合のみ許可。
  * **Storage**:
      * 全ファイル: **全ユーザー読み取り可**。
      * 書き込み: **認証ユーザー (`request.auth != null`) のみ許可**。
      * （Functionsと連携し、5枚を超えるアップロードをサーバー側で制御）

-----

この仕様書とToDoリストを基に、まずはフェーズ0の環境構築から進めてみてください。

次に、具体的な作業（例えば「FlutterとFirebaseの初期設定手順」や「Web管理画面のGoogle認証の実装コード例」など）についてサポートが必要ですか？
