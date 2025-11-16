"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageProcessing = exports.enforceImageLimit = exports.processEventImage = exports.processShopImage = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sharp = require("sharp");
const storage_1 = require("firebase-admin/storage");
// 画像リサイズの設定
const IMAGE_SIZES = {
    thumbnail: { width: 150, height: 150 }, // サムネイル
    small: { width: 400, height: 300 }, // 小画像
    medium: { width: 800, height: 600 }, // 中画像
    large: { width: 1200, height: 900 }, // 大画像
};
// 対応する画像形式
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
/**
 * 画像をリサイズして複数サイズを生成
 */
async function resizeImage(inputBuffer, originalName, basePath) {
    var _a;
    const bucket = (0, storage_1.getStorage)().bucket();
    const uploadedUrls = [];
    // 元の拡張子を取得
    const fileExtension = ((_a = originalName.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'jpg';
    // 各サイズでリサイズ・アップロード
    for (const [sizeName, dimensions] of Object.entries(IMAGE_SIZES)) {
        try {
            // Sharp でリサイズ
            const resizedBuffer = await sharp(inputBuffer)
                .resize(dimensions.width, dimensions.height, {
                fit: 'cover', // 縦横比を維持しつつクロップ
                position: 'center'
            })
                .jpeg({ quality: 85 }) // JPEG品質85%
                .toBuffer();
            // ファイル名生成
            const fileName = `${basePath}_${sizeName}.${fileExtension}`;
            const file = bucket.file(fileName);
            // アップロード
            await file.save(resizedBuffer, {
                metadata: {
                    contentType: 'image/jpeg',
                    metadata: {
                        originalName: originalName,
                        size: sizeName,
                        processedAt: new Date().toISOString(),
                    }
                }
            });
            // 公開URLを取得
            await file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            uploadedUrls.push(publicUrl);
            functions.logger.info(`リサイズ完了: ${sizeName} - ${fileName}`);
        }
        catch (error) {
            functions.logger.error(`リサイズエラー (${sizeName}):`, error);
        }
    }
    return uploadedUrls;
}
/**
 * 店舗画像の処理
 */
exports.processShopImage = functions.storage.object().onFinalize(async (object) => {
    var _a;
    const filePath = object.name;
    const contentType = object.contentType;
    // 店舗画像のパスかチェック
    if (!(filePath === null || filePath === void 0 ? void 0 : filePath.startsWith('shops/')) || !contentType || !SUPPORTED_FORMATS.includes(contentType)) {
        return;
    }
    // 既にリサイズ済みの画像は処理しない
    if (filePath.includes('_thumbnail') || filePath.includes('_small') ||
        filePath.includes('_medium') || filePath.includes('_large')) {
        return;
    }
    try {
        const bucket = (0, storage_1.getStorage)().bucket(object.bucket);
        const file = bucket.file(filePath);
        // 画像データをダウンロード
        const [imageBuffer] = await file.download();
        // ベースパス生成（拡張子除去）
        const pathWithoutExt = filePath.replace(/\.[^/.]+$/, "");
        // リサイズ処理
        const resizedUrls = await resizeImage(imageBuffer, filePath, pathWithoutExt);
        // Firestore の shops ドキュメントを更新
        const shopId = filePath.split('/')[1];
        if (shopId && resizedUrls.length > 0) {
            const db = admin.firestore();
            const shopRef = db.collection('shops').doc(shopId);
            // 既存の画像URLを取得
            const shopDoc = await shopRef.get();
            const existingImages = ((_a = shopDoc.data()) === null || _a === void 0 ? void 0 : _a.images) || [];
            // リサイズ画像URLを追加
            const updatedImages = [...existingImages, ...resizedUrls];
            await shopRef.update({
                images: updatedImages.slice(0, 20), // 最大20枚に制限
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            functions.logger.info(`店舗画像処理完了: ${shopId}, 追加URL数: ${resizedUrls.length}`);
        }
    }
    catch (error) {
        functions.logger.error('店舗画像処理エラー:', error);
    }
});
/**
 * イベント画像の処理
 */
exports.processEventImage = functions.storage.object().onFinalize(async (object) => {
    var _a;
    const filePath = object.name;
    const contentType = object.contentType;
    // イベント画像のパスかチェック
    if (!(filePath === null || filePath === void 0 ? void 0 : filePath.startsWith('events/')) || !contentType || !SUPPORTED_FORMATS.includes(contentType)) {
        return;
    }
    // 既にリサイズ済みの画像は処理しない
    if (filePath.includes('_thumbnail') || filePath.includes('_small') ||
        filePath.includes('_medium') || filePath.includes('_large')) {
        return;
    }
    try {
        const bucket = (0, storage_1.getStorage)().bucket(object.bucket);
        const file = bucket.file(filePath);
        // 画像データをダウンロード
        const [imageBuffer] = await file.download();
        // ベースパス生成（拡張子除去）
        const pathWithoutExt = filePath.replace(/\.[^/.]+$/, "");
        // リサイズ処理
        const resizedUrls = await resizeImage(imageBuffer, filePath, pathWithoutExt);
        // Firestore の events ドキュメントを更新
        const eventId = filePath.split('/')[1];
        if (eventId && resizedUrls.length > 0) {
            const db = admin.firestore();
            const eventRef = db.collection('events').doc(eventId);
            // 既存の画像URLを取得
            const eventDoc = await eventRef.get();
            const existingImages = ((_a = eventDoc.data()) === null || _a === void 0 ? void 0 : _a.images) || [];
            // リサイズ画像URLを追加
            const updatedImages = [...existingImages, ...resizedUrls];
            await eventRef.update({
                images: updatedImages.slice(0, 20), // 最大20枚に制限
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            functions.logger.info(`イベント画像処理完了: ${eventId}, 追加URL数: ${resizedUrls.length}`);
        }
    }
    catch (error) {
        functions.logger.error('イベント画像処理エラー:', error);
    }
});
/**
 * 画像制限チェック（5枚制限の実装）
 */
exports.enforceImageLimit = functions.storage.object().onFinalize(async (object) => {
    var _a;
    const filePath = object.name;
    if (!(filePath === null || filePath === void 0 ? void 0 : filePath.startsWith('shops/')) && !(filePath === null || filePath === void 0 ? void 0 : filePath.startsWith('events/'))) {
        return;
    }
    try {
        const pathParts = filePath.split('/');
        const collection = pathParts[0]; // 'shops' or 'events'
        const documentId = pathParts[1];
        const db = admin.firestore();
        const docRef = db.collection(collection).doc(documentId);
        const doc = await docRef.get();
        if (!doc.exists) {
            return;
        }
        const images = ((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.images) || [];
        // 5枚を超える場合、古い画像を削除
        if (images.length > 5) {
            functions.logger.warn(`画像制限超過: ${collection}/${documentId}, 現在: ${images.length}枚`);
            // 最新5枚のみ残す
            const imagesToKeep = images.slice(-5);
            const imagesToDelete = images.slice(0, -5);
            // Storageから古い画像を削除
            const bucket = (0, storage_1.getStorage)().bucket();
            for (const imageUrl of imagesToDelete) {
                try {
                    // URLからファイルパスを抽出
                    const fileName = imageUrl.split('/').pop();
                    if (fileName) {
                        const fileToDelete = bucket.file(`${collection}/${documentId}/${fileName}`);
                        await fileToDelete.delete();
                        functions.logger.info(`削除済み画像: ${fileName}`);
                    }
                }
                catch (deleteError) {
                    functions.logger.error('画像削除エラー:', deleteError);
                }
            }
            // Firestoreを更新
            await docRef.update({
                images: imagesToKeep,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            functions.logger.info(`画像制限適用: ${collection}/${documentId}, 残存: ${imagesToKeep.length}枚`);
        }
    }
    catch (error) {
        functions.logger.error('画像制限チェックエラー:', error);
    }
});
exports.imageProcessing = {
    processShopImage: exports.processShopImage,
    processEventImage: exports.processEventImage,
    enforceImageLimit: exports.enforceImageLimit,
};
//# sourceMappingURL=imageProcessing.js.map