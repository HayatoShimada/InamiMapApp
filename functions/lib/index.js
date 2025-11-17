"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.onNewEventSubmission = exports.onNewShopRegistration = exports.onEventApprovalChange = exports.onEventStatusChange = exports.processEventImage = exports.processShopImage = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const imageProcessing_1 = require("./imageProcessing");
const notifications_1 = require("./notifications");
// Firebase Admin SDK初期化（一度だけ）
if (!admin.apps.length) {
    admin.initializeApp();
}
// 画像処理関連のCloud Functions
exports.processShopImage = imageProcessing_1.imageProcessing.processShopImage;
exports.processEventImage = imageProcessing_1.imageProcessing.processEventImage;
// 通知関連のCloud Functions
exports.onEventStatusChange = notifications_1.notificationHandlers.onEventStatusChange;
exports.onEventApprovalChange = notifications_1.notificationHandlers.onEventApprovalChange;
exports.onNewShopRegistration = notifications_1.notificationHandlers.onNewShopRegistration;
exports.onNewEventSubmission = notifications_1.notificationHandlers.onNewEventSubmission;
// ヘルスチェック用のHTTPS関数
exports.healthCheck = functions.https.onRequest((req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "InamiMapApp Cloud Functions",
        version: "1.0.0"
    });
});
//# sourceMappingURL=index.js.map