import React from 'react';
import { 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button,
  Alert,
} from '@mui/material';
import { 
  HourglassEmpty,
  CheckCircle, 
  Cancel,
  ExitToApp 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function PendingApproval() {
  const { currentUser, userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const getStatusContent = () => {
    if (!userData?.approvalStatus || userData.approvalStatus === 'pending') {
      return {
        icon: <HourglassEmpty sx={{ fontSize: 64, color: 'orange' }} />,
        title: 'アカウント承認待ち',
        message: 'あなたのアカウントは現在管理者による承認待ちです。承認されるまでしばらくお待ちください。',
        color: 'warning',
      };
    } else if (userData.approvalStatus === 'approved') {
      return {
        icon: <CheckCircle sx={{ fontSize: 64, color: 'green' }} />,
        title: 'アカウントが承認されました',
        message: 'おめでとうございます！あなたのアカウントが承認されました。',
        color: 'success',
      };
    } else if (userData.approvalStatus === 'rejected') {
      return {
        icon: <Cancel sx={{ fontSize: 64, color: 'red' }} />,
        title: 'アカウントが却下されました',
        message: userData.rejectionReason || 'アカウントの承認が却下されました。詳細については管理者にお問い合わせください。',
        color: 'error',
      };
    }
  };

  const content = getStatusContent();

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          {content?.icon}
          
          <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
            {content?.title}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {content?.message}
          </Typography>

          {userData?.approvalStatus === 'pending' && (
            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>承認プロセスについて:</strong><br />
                • 新規ユーザーは管理者による承認が必要です<br />
                • 承認までには通常1-2営業日かかります<br />
                • 承認後、店舗・イベント管理機能をご利用いただけます
              </Typography>
            </Alert>
          )}

          {userData?.approvalStatus === 'rejected' && (
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>お問い合わせ:</strong><br />
                承認が却下された場合は、85-Storeまでお気軽にお問い合わせください。<br />
                Email: info@85-store.com<br />
                住所: 富山県南砺市本町四丁目100番地
              </Typography>
            </Alert>
          )}

          <Box sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              sx={{ mr: 2 }}
            >
              ログアウト
            </Button>
            
            {userData?.approvalStatus === 'approved' && (
              <Button
                variant="contained"
                onClick={() => window.location.href = '/dashboard'}
              >
                ダッシュボードへ
              </Button>
            )}
          </Box>

          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #eee' }}>
            <Typography variant="body2" color="text.secondary">
              アカウント情報
            </Typography>
            <Typography variant="body2">
              メール: {currentUser?.email}
            </Typography>
            <Typography variant="body2">
              表示名: {userData?.displayName || '未設定'}
            </Typography>
            {userData?.approvalStatus && (
              <Typography variant="body2">
                ステータス: {
                  userData.approvalStatus === 'pending' ? '承認待ち' :
                  userData.approvalStatus === 'approved' ? '承認済み' : '却下'
                }
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}