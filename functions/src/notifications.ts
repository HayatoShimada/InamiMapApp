import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

// Firebase Admin SDK初期化チェック
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// メール送信用の設定（環境変数から取得）
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: functions.config().email?.user || process.env.EMAIL_USER,
      pass: functions.config().email?.password || process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * イベント承認状況変更時の通知
 */
export const onEventApprovalChange = functions.firestore
  .document('events/{eventId}')
  .onUpdate(async (change, context) => {
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
      const userEmail = userDoc.data()?.email;
      const userName = userDoc.data()?.displayName || 'ユーザー';

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
            - 日時: ${after.eventDate?.toDate?.()?.toLocaleDateString() || after.eventDate}
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
        from: functions.config().email?.from || process.env.EMAIL_FROM || 'noreply@inamimapapp.com',
        to: userEmail,
        subject: subject,
        text: message,
      });

      functions.logger.info(`イベント承認通知送信完了: ${eventId} -> ${userEmail}`);

    } catch (error) {
      functions.logger.error('イベント承認通知送信エラー:', error);
    }
  });

/**
 * イベントステータス変更時の通知
 */
export const onEventStatusChange = functions.firestore
  .document('events/{eventId}')
  .onUpdate(async (change, context) => {
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
      const userEmail = userDoc.data()?.email;
      const userName = userDoc.data()?.displayName || 'ユーザー';

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
            - 日時: ${after.eventDate?.toDate?.()?.toLocaleDateString() || after.eventDate}
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
        from: functions.config().email?.from || process.env.EMAIL_FROM || 'noreply@inamimapapp.com',
        to: userEmail,
        subject: subject,
        text: message,
      });

      functions.logger.info(`イベントステータス通知送信完了: ${eventId} -> ${userEmail}`);

    } catch (error) {
      functions.logger.error('イベントステータス通知送信エラー:', error);
    }
  });

/**
 * 新規店舗登録通知（管理者へ）
 */
export const onNewShopRegistration = functions.firestore
  .document('shops/{shopId}')
  .onCreate(async (snap, context) => {
    const shopData = snap.data();
    const shopId = context.params.shopId;

    try {
      // 管理者のメールアドレスを取得
      const adminEmail = functions.config().admin?.email || process.env.ADMIN_EMAIL;
      
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
        from: functions.config().email?.from || process.env.EMAIL_FROM || 'noreply@inamimapapp.com',
        to: adminEmail,
        subject: subject,
        text: message,
      });

      functions.logger.info(`新規店舗登録通知送信完了: ${shopId} -> ${adminEmail}`);

    } catch (error) {
      functions.logger.error('新規店舗登録通知送信エラー:', error);
    }
  });

/**
 * 新規イベント投稿通知（管理者へ）
 */
export const onNewEventSubmission = functions.firestore
  .document('events/{eventId}')
  .onCreate(async (snap, context) => {
    const eventData = snap.data();
    const eventId = context.params.eventId;

    try {
      // 管理者のメールアドレスを取得
      const adminEmail = functions.config().admin?.email || process.env.ADMIN_EMAIL;
      
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
        - 日時: ${eventData.eventDate?.toDate?.()?.toLocaleDateString() || eventData.eventDate}
        - 場所: ${eventData.location}
        - 説明: ${eventData.description}
        - 投稿日時: ${new Date().toLocaleString('ja-JP')}
        
        管理画面で承認・却下をご判断ください。
        
        稲美町マップアプリ
      `;

      // メール送信
      const transporter = createTransporter();
      await transporter.sendMail({
        from: functions.config().email?.from || process.env.EMAIL_FROM || 'noreply@inamimapapp.com',
        to: adminEmail,
        subject: subject,
        text: message,
      });

      functions.logger.info(`新規イベント投稿通知送信完了: ${eventId} -> ${adminEmail}`);

    } catch (error) {
      functions.logger.error('新規イベント投稿通知送信エラー:', error);
    }
  });

export const notificationHandlers = {
  onEventApprovalChange,
  onEventStatusChange,
  onNewShopRegistration,
  onNewEventSubmission,
};