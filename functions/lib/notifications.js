"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationHandlers = exports.onNewEventSubmission = exports.onNewShopRegistration = exports.onEventStatusChange = exports.onEventApprovalChange = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
// Firebase Admin SDK初期化チェック
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// メール送信用の設定（環境変数から取得）
const createTransporter = () => {
    var _a, _b;
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: ((_a = functions.config().email) === null || _a === void 0 ? void 0 : _a.user) || process.env.EMAIL_USER,
            pass: ((_b = functions.config().email) === null || _b === void 0 ? void 0 : _b.password) || process.env.EMAIL_PASSWORD,
        },
    });
};
/**
 * イベント承認状況変更時の通知
 */
exports.onEventApprovalChange = functions.firestore
    .document('events/{eventId}')
    .onUpdate(async (change, context) => {
    var _a, _b, _c, _d, _e, _f;
    const before = change.before.data();
    const after = change.after.data();
    const eventId = context.params.eventId;
    // 承認状況が変更された場合のみ処理
    if (before.approvalStatus === after.approvalStatus) {
        return;
    }
    try {
        // イベント作成者の情報を取得
        const userDoc = await db.collection('users').doc(after.createdBy).get();
        const userEmail = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.email;
        const userName = ((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.displayName) || 'ユーザー';
        if (!userEmail) {
            functions.logger.warn(`ユーザーのメールアドレスが見つかりません: ${after.createdBy}`);
            return;
        }
        let subject = '';
        let message = '';
        switch (after.approvalStatus) {
            case 'approved':
                subject = 'イベントが承認されました';
                message = `
            こんにちは ${userName} さん、
            
            あなたが投稿したイベント「${after.title}」が管理者により承認されました。
            イベントは公開され、参加者に表示されます。
            
            イベント詳細:
            - タイトル: ${after.title}
            - 日時: ${((_e = (_d = (_c = after.eventDate) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c)) === null || _e === void 0 ? void 0 : _e.toLocaleDateString()) || after.eventDate}
            - 場所: ${after.location}
            
            稲美町マップアプリ
          `;
                break;
            case 'rejected':
                subject = 'イベントが承認されませんでした';
                message = `
            こんにちは ${userName} さん、
            
            あなたが投稿したイベント「${after.title}」は承認されませんでした。
            
            承認されなかった理由:
            ${after.rejectionReason || '管理者より詳細な理由は提供されていません。'}
            
            修正後に再度投稿いただけます。
            
            稲美町マップアプリ
          `;
                break;
            default:
                return;
        }
        // メール送信
        const transporter = createTransporter();
        await transporter.sendMail({
            from: ((_f = functions.config().email) === null || _f === void 0 ? void 0 : _f.from) || process.env.EMAIL_FROM || 'noreply@inamimapapp.com',
            to: userEmail,
            subject: subject,
            text: message,
        });
        functions.logger.info(`イベント承認通知送信完了: ${eventId} -> ${userEmail}`);
    }
    catch (error) {
        functions.logger.error('イベント承認通知送信エラー:', error);
    }
});
/**
 * イベントステータス変更時の通知
 */
exports.onEventStatusChange = functions.firestore
    .document('events/{eventId}')
    .onUpdate(async (change, context) => {
    var _a, _b, _c, _d, _e, _f;
    const before = change.before.data();
    const after = change.after.data();
    const eventId = context.params.eventId;
    // イベント進行状況が変更された場合のみ処理
    if (before.eventProgress === after.eventProgress) {
        return;
    }
    // 承認されたイベントのみ通知
    if (after.approvalStatus !== 'approved') {
        return;
    }
    try {
        // イベント参加者（今回は店舗オーナーのみ）に通知
        const userDoc = await db.collection('users').doc(after.createdBy).get();
        const userEmail = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.email;
        const userName = ((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.displayName) || 'ユーザー';
        if (!userEmail) {
            return;
        }
        let subject = '';
        let message = '';
        switch (after.eventProgress) {
            case 'ongoing':
                subject = 'イベントが開催中です';
                message = `
            こんにちは ${userName} さん、
            
            イベント「${after.title}」が開催中になりました。
            
            イベント詳細:
            - タイトル: ${after.title}
            - 日時: ${((_e = (_d = (_c = after.eventDate) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c)) === null || _e === void 0 ? void 0 : _e.toLocaleDateString()) || after.eventDate}
            - 場所: ${after.location}
            
            参加者の皆様に楽しんでいただけるよう、よろしくお願いします。
            
            稲美町マップアプリ
          `;
                break;
            case 'cancelled':
                subject = 'イベントが中止されました';
                message = `
            こんにちは ${userName} さん、
            
            イベント「${after.title}」が中止されました。
            
            中止理由:
            ${after.cancellationReason || '詳細な理由は提供されていません。'}
            
            ご迷惑をおかけして申し訳ございません。
            
            稲美町マップアプリ
          `;
                break;
            case 'finished':
                subject = 'イベントが終了しました';
                message = `
            こんにちは ${userName} さん、
            
            イベント「${after.title}」が終了しました。
            ご参加いただきありがとうございました。
            
            また次回のイベントもよろしくお願いします。
            
            稲美町マップアプリ
          `;
                break;
            default:
                return;
        }
        // メール送信
        const transporter = createTransporter();
        await transporter.sendMail({
            from: ((_f = functions.config().email) === null || _f === void 0 ? void 0 : _f.from) || process.env.EMAIL_FROM || 'noreply@inamimapapp.com',
            to: userEmail,
            subject: subject,
            text: message,
        });
        functions.logger.info(`イベントステータス通知送信完了: ${eventId} -> ${userEmail}`);
    }
    catch (error) {
        functions.logger.error('イベントステータス通知送信エラー:', error);
    }
});
/**
 * 新規店舗登録通知（管理者へ）
 */
exports.onNewShopRegistration = functions.firestore
    .document('shops/{shopId}')
    .onCreate(async (snap, context) => {
    var _a, _b;
    const shopData = snap.data();
    const shopId = context.params.shopId;
    try {
        // 管理者のメールアドレスを取得
        const adminEmail = ((_a = functions.config().admin) === null || _a === void 0 ? void 0 : _a.email) || process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            functions.logger.warn('管理者のメールアドレスが設定されていません');
            return;
        }
        const subject = '新しい店舗が登録されました';
        const message = `
        新しい店舗が登録されました。
        
        店舗情報:
        - 店舗名: ${shopData.name}
        - オーナー: ${shopData.ownerName}
        - カテゴリ: ${shopData.category}
        - 住所: ${shopData.address}
        - 登録日時: ${new Date().toLocaleString('ja-JP')}
        
        管理画面で詳細をご確認ください。
        
        稲美町マップアプリ
      `;
        // メール送信
        const transporter = createTransporter();
        await transporter.sendMail({
            from: ((_b = functions.config().email) === null || _b === void 0 ? void 0 : _b.from) || process.env.EMAIL_FROM || 'noreply@inamimapapp.com',
            to: adminEmail,
            subject: subject,
            text: message,
        });
        functions.logger.info(`新規店舗登録通知送信完了: ${shopId} -> ${adminEmail}`);
    }
    catch (error) {
        functions.logger.error('新規店舗登録通知送信エラー:', error);
    }
});
/**
 * 新規イベント投稿通知（管理者へ）
 */
exports.onNewEventSubmission = functions.firestore
    .document('events/{eventId}')
    .onCreate(async (snap, context) => {
    var _a, _b, _c, _d, _e;
    const eventData = snap.data();
    const eventId = context.params.eventId;
    try {
        // 管理者のメールアドレスを取得
        const adminEmail = ((_a = functions.config().admin) === null || _a === void 0 ? void 0 : _a.email) || process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            functions.logger.warn('管理者のメールアドレスが設定されていません');
            return;
        }
        const subject = '新しいイベントが投稿されました（承認待ち）';
        const message = `
        新しいイベントが投稿され、承認を待っています。
        
        イベント情報:
        - タイトル: ${eventData.title}
        - 投稿者: ${eventData.createdBy}
        - 日時: ${((_d = (_c = (_b = eventData.eventDate) === null || _b === void 0 ? void 0 : _b.toDate) === null || _c === void 0 ? void 0 : _c.call(_b)) === null || _d === void 0 ? void 0 : _d.toLocaleDateString()) || eventData.eventDate}
        - 場所: ${eventData.location}
        - 説明: ${eventData.description}
        - 投稿日時: ${new Date().toLocaleString('ja-JP')}
        
        管理画面で承認・却下をご判断ください。
        
        稲美町マップアプリ
      `;
        // メール送信
        const transporter = createTransporter();
        await transporter.sendMail({
            from: ((_e = functions.config().email) === null || _e === void 0 ? void 0 : _e.from) || process.env.EMAIL_FROM || 'noreply@inamimapapp.com',
            to: adminEmail,
            subject: subject,
            text: message,
        });
        functions.logger.info(`新規イベント投稿通知送信完了: ${eventId} -> ${adminEmail}`);
    }
    catch (error) {
        functions.logger.error('新規イベント投稿通知送信エラー:', error);
    }
});
exports.notificationHandlers = {
    onEventApprovalChange: exports.onEventApprovalChange,
    onEventStatusChange: exports.onEventStatusChange,
    onNewShopRegistration: exports.onNewShopRegistration,
    onNewEventSubmission: exports.onNewEventSubmission,
};
//# sourceMappingURL=notifications.js.map