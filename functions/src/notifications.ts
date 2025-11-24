import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

// Firebase Admin SDK初期化チェック
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// 管理者メールアドレス取得
const getAdminEmail = (): string | undefined => {
  return functions.config().admin?.email || process.env.ADMIN_EMAIL;
};

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

// 送信元メールアドレス
const getFromEmail = (): string => {
  return functions.config().email?.from || process.env.EMAIL_FROM || 'noreply@tokotoko-inami.com';
};

// アプリ名
const APP_NAME = 'とことこ井波マップ';

/**
 * ユーザー承認状況変更時の通知
 * - pending: 管理者へ通知
 * - approved: ユーザーへ通知
 * - rejected: ユーザーへ通知
 */
export const onUserApprovalChange = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;

    if (!after) {
      // ドキュメント削除時は何もしない
      return;
    }

    const beforeStatus = before?.approvalStatus;
    const afterStatus = after.approvalStatus;

    // 承認状況が変更されていない場合はスキップ
    if (beforeStatus === afterStatus) {
      return;
    }

    const userEmail = after.email;
    const userName = after.displayName || 'ユーザー';
    const adminEmail = getAdminEmail();

    try {
      const transporter = createTransporter();

      // 新規ユーザー登録時（pending）-> 管理者へ通知
      if (afterStatus === 'pending' && !beforeStatus) {
        if (!adminEmail) {
          functions.logger.warn('管理者のメールアドレスが設定されていません');
          return;
        }

        const subject = `【${APP_NAME}】新規ユーザー登録 - 承認待ち`;
        const message = `
新規ユーザーが登録され、承認を待っています。

ユーザー情報:
- 名前: ${userName}
- メールアドレス: ${userEmail}
- 登録日時: ${new Date().toLocaleString('ja-JP')}

管理画面で承認・却下をご判断ください。
https://inami-map-app-prod.web.app/admin/users

---
${APP_NAME} 管理システム
        `.trim();

        await transporter.sendMail({
          from: getFromEmail(),
          to: adminEmail,
          subject: subject,
          text: message,
        });

        functions.logger.info(`新規ユーザー登録通知送信完了: ${userId} -> ${adminEmail}`);
      }

      // 承認完了 -> ユーザーへ通知
      if (afterStatus === 'approved' && beforeStatus === 'pending') {
        if (!userEmail) {
          functions.logger.warn(`ユーザーのメールアドレスが見つかりません: ${userId}`);
          return;
        }

        const subject = `【${APP_NAME}】アカウントが承認されました`;
        const message = `
${userName} 様

${APP_NAME}へのご登録ありがとうございます。

お客様のアカウントが承認されました。
これより店舗情報の登録・編集、イベントの投稿が可能になります。

管理画面にログインして、店舗情報を登録してください。
https://inami-map-app-prod.web.app/dashboard

ご不明点がございましたら、お気軽にお問い合わせください。

---
${APP_NAME}
運営: 85-Store
Email: info@85-store.com
        `.trim();

        await transporter.sendMail({
          from: getFromEmail(),
          to: userEmail,
          subject: subject,
          text: message,
        });

        functions.logger.info(`ユーザー承認通知送信完了: ${userId} -> ${userEmail}`);
      }

      // 却下 -> ユーザーへ通知
      if (afterStatus === 'rejected') {
        if (!userEmail) {
          functions.logger.warn(`ユーザーのメールアドレスが見つかりません: ${userId}`);
          return;
        }

        const subject = `【${APP_NAME}】アカウント登録について`;
        const message = `
${userName} 様

${APP_NAME}へのご登録申請ありがとうございました。

申し訳ございませんが、今回のご登録は承認されませんでした。

${after.rejectionReason ? `理由: ${after.rejectionReason}` : ''}

ご不明点がございましたら、下記までお問い合わせください。

---
${APP_NAME}
運営: 85-Store
Email: info@85-store.com
        `.trim();

        await transporter.sendMail({
          from: getFromEmail(),
          to: userEmail,
          subject: subject,
          text: message,
        });

        functions.logger.info(`ユーザー却下通知送信完了: ${userId} -> ${userEmail}`);
      }

    } catch (error) {
      functions.logger.error('ユーザー承認通知送信エラー:', error);
    }
  });

/**
 * 店舗承認状況変更時の通知
 * - pending: 管理者へ通知
 * - approved: オーナーへ通知
 * - rejected: オーナーへ通知
 */
export const onShopApprovalChange = functions.firestore
  .document('shops/{shopId}')
  .onWrite(async (change, context) => {
    const shopId = context.params.shopId;
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;

    if (!after) {
      return;
    }

    const beforeStatus = before?.approvalStatus;
    const afterStatus = after.approvalStatus;
    const shopName = after.shopName || '店舗';
    const ownerUserId = after.ownerUserId;

    // 承認状況が変更されていない場合はスキップ
    if (beforeStatus === afterStatus) {
      return;
    }

    const adminEmail = getAdminEmail();

    try {
      const transporter = createTransporter();

      // オーナー情報を取得
      let ownerEmail: string | undefined;
      let ownerName = 'オーナー';
      if (ownerUserId) {
        const ownerDoc = await db.collection('users').doc(ownerUserId).get();
        if (ownerDoc.exists) {
          ownerEmail = ownerDoc.data()?.email;
          ownerName = ownerDoc.data()?.displayName || 'オーナー';
        }
      }

      // 新規店舗登録時（pending）-> 管理者へ通知
      if (afterStatus === 'pending' && !beforeStatus) {
        if (!adminEmail) {
          functions.logger.warn('管理者のメールアドレスが設定されていません');
          return;
        }

        const subject = `【${APP_NAME}】新規店舗登録 - 承認待ち`;
        const message = `
新しい店舗が登録され、承認を待っています。

店舗情報:
- 店舗名: ${shopName}
- オーナー: ${ownerName}
- カテゴリ: ${after.shopCategory || '未設定'}
- 住所: ${after.address || '未設定'}
- 登録日時: ${new Date().toLocaleString('ja-JP')}

管理画面で承認・却下をご判断ください。
https://inami-map-app-prod.web.app/admin/shops

---
${APP_NAME} 管理システム
        `.trim();

        await transporter.sendMail({
          from: getFromEmail(),
          to: adminEmail,
          subject: subject,
          text: message,
        });

        functions.logger.info(`新規店舗登録通知送信完了: ${shopId} -> ${adminEmail}`);
      }

      // 承認完了 -> オーナーへ通知
      if (afterStatus === 'approved' && beforeStatus === 'pending') {
        if (!ownerEmail) {
          functions.logger.warn(`オーナーのメールアドレスが見つかりません: ${ownerUserId}`);
          return;
        }

        const subject = `【${APP_NAME}】店舗「${shopName}」が承認されました`;
        const message = `
${ownerName} 様

お待たせいたしました。
「${shopName}」の店舗登録が承認されました。

これより、アプリ上で店舗情報が公開されます。
店舗情報の更新やイベントの投稿は、管理画面から行えます。

管理画面:
https://inami-map-app-prod.web.app/dashboard

今後ともよろしくお願いいたします。

---
${APP_NAME}
運営: 85-Store
Email: info@85-store.com
        `.trim();

        await transporter.sendMail({
          from: getFromEmail(),
          to: ownerEmail,
          subject: subject,
          text: message,
        });

        functions.logger.info(`店舗承認通知送信完了: ${shopId} -> ${ownerEmail}`);
      }

      // 却下 -> オーナーへ通知
      if (afterStatus === 'rejected') {
        if (!ownerEmail) {
          functions.logger.warn(`オーナーのメールアドレスが見つかりません: ${ownerUserId}`);
          return;
        }

        const subject = `【${APP_NAME}】店舗登録について`;
        const message = `
${ownerName} 様

「${shopName}」の店舗登録申請ありがとうございました。

申し訳ございませんが、今回のご登録は承認されませんでした。

${after.rejectionReason ? `理由: ${after.rejectionReason}` : ''}

内容を修正の上、再度ご登録いただくことも可能です。
ご不明点がございましたら、下記までお問い合わせください。

---
${APP_NAME}
運営: 85-Store
Email: info@85-store.com
        `.trim();

        await transporter.sendMail({
          from: getFromEmail(),
          to: ownerEmail,
          subject: subject,
          text: message,
        });

        functions.logger.info(`店舗却下通知送信完了: ${shopId} -> ${ownerEmail}`);
      }

    } catch (error) {
      functions.logger.error('店舗承認通知送信エラー:', error);
    }
  });

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
      const userDoc = await db.collection('users').doc(after.ownerUserId).get();
      const userEmail = userDoc.data()?.email;
      const userName = userDoc.data()?.displayName || 'ユーザー';
      const eventName = after.eventName || 'イベント';

      if (!userEmail) {
        functions.logger.warn(`ユーザーのメールアドレスが見つかりません: ${after.ownerUserId}`);
        return;
      }

      let subject = '';
      let message = '';

      switch (after.approvalStatus) {
        case 'approved':
          subject = `【${APP_NAME}】イベント「${eventName}」が承認されました`;
          message = `
${userName} 様

お待たせいたしました。
イベント「${eventName}」が承認されました。

イベント詳細:
- タイトル: ${eventName}
- 開催日: ${after.eventTimeStart?.toDate?.()?.toLocaleDateString('ja-JP') || '未設定'}
- 場所: ${after.location || '未設定'}

イベントはアプリ上で公開されます。
多くの方にご参加いただけることを願っております。

---
${APP_NAME}
運営: 85-Store
Email: info@85-store.com
          `.trim();
          break;

        case 'rejected':
          subject = `【${APP_NAME}】イベント投稿について`;
          message = `
${userName} 様

イベント「${eventName}」の投稿ありがとうございました。

申し訳ございませんが、今回の投稿は承認されませんでした。

${after.rejectionReason ? `理由: ${after.rejectionReason}` : ''}

内容を修正の上、再度ご投稿いただくことも可能です。
ご不明点がございましたら、下記までお問い合わせください。

---
${APP_NAME}
運営: 85-Store
Email: info@85-store.com
          `.trim();
          break;

        default:
          return;
      }

      // メール送信
      const transporter = createTransporter();
      await transporter.sendMail({
        from: getFromEmail(),
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
      // イベント作成者に通知
      const userDoc = await db.collection('users').doc(after.ownerUserId).get();
      const userEmail = userDoc.data()?.email;
      const userName = userDoc.data()?.displayName || 'ユーザー';
      const eventName = after.eventName || 'イベント';

      if (!userEmail) {
        return;
      }

      let subject = '';
      let message = '';

      switch (after.eventProgress) {
        case 'ongoing':
          subject = `【${APP_NAME}】イベント「${eventName}」が開催中です`;
          message = `
${userName} 様

イベント「${eventName}」が開催中になりました。

イベント詳細:
- タイトル: ${eventName}
- 開催日: ${after.eventTimeStart?.toDate?.()?.toLocaleDateString('ja-JP') || '未設定'}
- 場所: ${after.location || '未設定'}

参加者の皆様に楽しんでいただけるよう、よろしくお願いします。

---
${APP_NAME}
運営: 85-Store
          `.trim();
          break;

        case 'cancelled':
          subject = `【${APP_NAME}】イベント「${eventName}」が中止されました`;
          message = `
${userName} 様

イベント「${eventName}」が中止されました。

${after.cancellationReason ? `中止理由: ${after.cancellationReason}` : ''}

ご迷惑をおかけして申し訳ございません。

---
${APP_NAME}
運営: 85-Store
          `.trim();
          break;

        case 'finished':
          subject = `【${APP_NAME}】イベント「${eventName}」が終了しました`;
          message = `
${userName} 様

イベント「${eventName}」が終了しました。
ご参加いただきありがとうございました。

また次回のイベントもよろしくお願いします。

---
${APP_NAME}
運営: 85-Store
          `.trim();
          break;

        default:
          return;
      }

      // メール送信
      const transporter = createTransporter();
      await transporter.sendMail({
        from: getFromEmail(),
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
 * 新規イベント投稿通知（管理者へ）
 */
export const onNewEventSubmission = functions.firestore
  .document('events/{eventId}')
  .onCreate(async (snap, context) => {
    const eventData = snap.data();
    const eventId = context.params.eventId;

    try {
      const adminEmail = getAdminEmail();

      if (!adminEmail) {
        functions.logger.warn('管理者のメールアドレスが設定されていません');
        return;
      }

      // 投稿者情報を取得
      let ownerName = '不明';
      if (eventData.ownerUserId) {
        const ownerDoc = await db.collection('users').doc(eventData.ownerUserId).get();
        if (ownerDoc.exists) {
          ownerName = ownerDoc.data()?.displayName || '不明';
        }
      }

      const subject = `【${APP_NAME}】新規イベント投稿 - 承認待ち`;
      const message = `
新しいイベントが投稿され、承認を待っています。

イベント情報:
- タイトル: ${eventData.eventName || '未設定'}
- 投稿者: ${ownerName}
- 開催日: ${eventData.eventTimeStart?.toDate?.()?.toLocaleDateString('ja-JP') || '未設定'}
- 場所: ${eventData.location || '未設定'}
- 説明: ${eventData.description || '未設定'}
- 投稿日時: ${new Date().toLocaleString('ja-JP')}

管理画面で承認・却下をご判断ください。
https://inami-map-app-prod.web.app/admin/events

---
${APP_NAME} 管理システム
      `.trim();

      const transporter = createTransporter();
      await transporter.sendMail({
        from: getFromEmail(),
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
  onUserApprovalChange,
  onShopApprovalChange,
  onEventApprovalChange,
  onEventStatusChange,
  onNewEventSubmission,
};
