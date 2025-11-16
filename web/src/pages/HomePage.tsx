import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Map as MapIcon,
  Store as StoreIcon,
  Event as EventIcon,
  Security as SecurityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="lg">
      {/* ヘッダーセクション */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          井波町マップアプリ
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          富山県南砺市井波の店舗・イベント情報を一元管理する公式プラットフォーム
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={handleLoginClick}
          sx={{ mt: 2, px: 4, py: 1.5 }}
        >
          ログイン・店舗管理を開始
        </Button>
      </Box>

      {/* アプリの特徴セクション */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 4 }}>
          アプリの特徴
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <StoreIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  店舗情報管理
                </Typography>
                <Typography color="text.secondary">
                  井波町内の店舗オーナーが自分の店舗情報を登録・更新できます。営業時間、連絡先、店舗画像などを管理可能です。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <EventIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  イベント投稿
                </Typography>
                <Typography color="text.secondary">
                  地域のイベントを投稿できます。投稿されたイベントは管理者の承認後に公開され、住民に情報を提供します。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  安全な認証
                </Typography>
                <Typography color="text.secondary">
                  Google アカウントによる安全な認証システムを採用。個人情報の保護とセキュリティを重視しています。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* サービス詳細セクション */}
      <Box sx={{ py: 6 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            サービス詳細
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                店舗オーナー向け機能
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="店舗基本情報の登録・編集" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="店舗画像のアップロード（最大5枚）" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="営業時間・定休日の設定" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="イベント情報の投稿" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                管理者機能
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="イベント投稿の承認・却下" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="店舗情報の監視・管理" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="システム全体の運用管理" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* プライバシーとセキュリティ */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom align="center">
          プライバシーとセキュリティ
        </Typography>
        <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
          <Typography variant="body1" paragraph>
            井波町マップアプリは、ユーザーの個人情報保護を最優先に考えています。
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Google認証による安全なログイン"
                secondary="Googleアカウントを使用した認証により、パスワード管理の負担を軽減し、セキュリティを向上させています。"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="最小限の情報収集"
                secondary="サービス提供に必要な最小限の情報のみを収集し、適切に管理しています。"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Firebase による安全なデータ管理"
                secondary="Google Firebase プラットフォームを使用し、企業レベルのセキュリティでデータを保護しています。"
              />
            </ListItem>
          </List>
        </Paper>
      </Box>

      {/* お問い合わせセクション */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom align="center">
          お問い合わせ
        </Typography>
        <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={2}>
                <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">南砺市役所井波庁舎</Typography>
                  <Typography color="text.secondary">
                    〒932-0231<br />
                    富山県南砺市山見1739-2
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={2}>
                <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">電話番号</Typography>
                  <Typography color="text.secondary">
                    0763-23-2003（井波庁舎代表）
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">メールアドレス</Typography>
                  <Typography color="text.secondary">
                    info@city.nanto.toyama.jp
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* フッター */}
      <Divider sx={{ my: 4 }} />
      <Box sx={{ pb: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © 2024 南砺市. すべての権利を保有します。
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          このアプリは南砺市井波の公式サービスです。
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;