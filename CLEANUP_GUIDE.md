# Firebase プロジェクト・アプリ削除手順

## 🗑️ 削除したいものを特定

### 現在のプロジェクト状況
- **現在使用中**: `inami-map-app-prod`
- **古い問題のあるプロジェクト**: `carelink-2b33a`

## 🔧 削除方法

### 1. Firebase プロジェクト全体を削除

#### Firebase Console から削除
1. **[Firebase Console](https://console.firebase.google.com/)** にアクセス
2. **削除したいプロジェクト** を選択
3. **プロジェクト設定** (⚙️ 歯車アイコン)
4. **全般** タブ
5. **プロジェクトを削除** をクリック
6. **プロジェクト名を入力** して確認
7. **プロジェクトを削除** をクリック

#### 削除推奨プロジェクト
- `carelink-2b33a` (権限エラーの原因)
- 使用していない古いプロジェクト

### 2. プロジェクト内のWebアプリのみ削除

#### 特定のアプリを削除
1. **Firebase Console** > 該当プロジェクト
2. **プロジェクト設定** > **全般**
3. **マイアプリ** セクション
4. **削除したいアプリ** の **⋮** メニュー
5. **アプリを削除**
6. **アプリ名を入力** して確認

### 3. ローカル設定のクリーンアップ

#### Firebase CLI 設定リセット
```bash
# 現在の設定確認
firebase projects:list

# 古い設定ファイル削除
rm -f .firebaserc

# プロジェクト再設定
firebase use --add inami-map-app-prod
```

#### ローカルキャッシュクリア
```bash
# Firebase CLI キャッシュクリア
firebase logout
firebase login

# npm キャッシュクリア
npm cache clean --force
```

## 🎯 推奨削除対象

### 削除すべきもの
1. **`carelink-2b33a` プロジェクト全体**
   - 権限エラーの原因
   - アクセス権限がない

2. **古い開発・テスト用プロジェクト**
   - demo- で始まるプロジェクト
   - 使用していないプロジェクト

### 保持すべきもの
- **`inami-map-app-prod`**: 本番用として使用中

## ⚠️ 削除前の注意事項

### データバックアップ
削除前に必要なデータがあれば：

1. **Firestore データ**:
   ```bash
   # データエクスポート（必要な場合）
   gcloud firestore export gs://your-bucket/backup
   ```

2. **Storage ファイル**:
   - Firebase Console > Storage からダウンロード

3. **Functions コード**:
   - ローカルにコードがあることを確認

### 課金の停止
1. **Google Cloud Console** > **Billing**
2. **プロジェクトと課金の関連付けを削除**

## 🚀 削除後の手順

### 1. プロジェクト削除後
```bash
# 設定確認
firebase projects:list

# 正しいプロジェクトに設定
firebase use inami-map-app-prod

# デプロイテスト
firebase deploy --only hosting
```

### 2. 新しい環境での確認
1. **Firebase Console** で `inami-map-app-prod` のみ表示されることを確認
2. **ローカル開発環境** が正常に動作することを確認
3. **デプロイ** が正常に実行できることを確認

## 📞 削除でエラーが発生した場合

### よくあるエラー
1. **権限不足**:
   - プロジェクトオーナーに削除を依頼
   - Google Cloud Console から削除を試行

2. **課金アカウントが関連付けられている**:
   - 先に課金を停止
   - 数時間後に再試行

3. **API が有効になっている**:
   - Google Cloud Console でAPI を無効化
   - その後プロジェクト削除

### サポート
- **Firebase サポート**: https://firebase.google.com/support/
- **Google Cloud サポート**: https://cloud.google.com/support/

## ✅ 完了チェックリスト

- [ ] 不要なプロジェクト削除完了
- [ ] `inami-map-app-prod` のみ残存確認
- [ ] ローカル設定クリア完了
- [ ] Firebase CLI 再設定完了
- [ ] デプロイテスト成功

削除作業は慎重に行い、必要なデータは必ずバックアップしてください！