import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Google } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { currentUser, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 既にログイン済みの場合はダッシュボードにリダイレクト
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error('ログインエラー:', error);
      setError('ログインに失敗しました。しばらく時間をおいて再試行してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" gutterBottom>
              井波マップアプリ
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              店主管理画面
            </Typography>
            <Typography variant="body1" color="text.secondary">
              店舗情報とイベントを管理するための管理画面です
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <Google />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              backgroundColor: '#4285f4',
              '&:hover': {
                backgroundColor: '#3367d6',
              },
            }}
          >
            {loading ? 'ログイン中...' : 'Googleでログイン'}
          </Button>

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              <strong>注意:</strong> この管理画面は店主会メンバー専用です。
              <br />
              一般のお客様は専用アプリをダウンロードしてご利用ください。
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}