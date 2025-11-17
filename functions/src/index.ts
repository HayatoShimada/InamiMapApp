import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { imageProcessing } from "./imageProcessing";
import { notificationHandlers } from "./notifications";

// Firebase Admin SDK初期化（一度だけ）
if (!admin.apps.length) {
  admin.initializeApp();
}

// 画像処理関連のCloud Functions
export const processShopImage = imageProcessing.processShopImage;
export const processEventImage = imageProcessing.processEventImage;

// 通知関連のCloud Functions
export const onEventStatusChange = notificationHandlers.onEventStatusChange;
export const onEventApprovalChange = notificationHandlers.onEventApprovalChange;
export const onNewShopRegistration = notificationHandlers.onNewShopRegistration;
export const onNewEventSubmission = notificationHandlers.onNewEventSubmission;

// ヘルスチェック用のHTTPS関数
export const healthCheck = functions.https.onRequest((req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "InamiMapApp Cloud Functions",
    version: "1.0.0"
  });
});