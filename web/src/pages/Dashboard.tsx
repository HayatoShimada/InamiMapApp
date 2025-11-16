import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
} from '@mui/material';
import {
  Store,
  Event,
  Add,
  Edit,
  Visibility,
} from '@mui/icons-material';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreEvent, FirestoreShop } from '../types/firebase';
import { EVENT_PROGRESS_LABELS, APPROVAL_STATUS_LABELS } from '../types/firebase';
import AppNavigation from '../components/AppNavigation';

export default function Dashboard() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState<FirestoreShop[]>([]);
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      // 自分の店舗を取得
      const shopsQuery = query(
        collection(db, 'shops'),
        where('ownerUserId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const shopsSnapshot = await getDocs(shopsQuery);
      const shopsData = shopsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreShop[];
      setShops(shopsData);

      // 自分のイベントを取得
      const eventsQuery = query(
        collection(db, 'events'),
        where('ownerUserId', '==', currentUser.uid),
        orderBy('eventTimeStart', 'desc')
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreEvent[];
      setEvents(eventsData);

    } catch (error: any) {
      console.error('データ取得エラー:', error);
      setError('データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressChipColor = (progress: string) => {
    switch (progress) {
      case 'scheduled': return 'primary';
      case 'ongoing': return 'success';
      case 'finished': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getApprovalChipColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppNavigation />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* ウェルカムメッセージ */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            こんにちは、{userData?.displayName}さん
          </Typography>
          <Typography variant="body1" color="text.secondary">
            店舗情報とイベントを管理できます
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* 店舗管理セクション */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    <Store sx={{ mr: 1, verticalAlign: 'middle' }} />
                    店舗管理
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/shop/new')}
                  >
                    新規店舗追加
                  </Button>
                </Box>

                {shops.length === 0 ? (
                  <Typography color="text.secondary">
                    店舗が登録されていません。最初に店舗情報を登録してください。
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {shops.map((shop) => (
                      <Grid item xs={12} md={6} key={shop.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {shop.shopName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {shop.description}
                            </Typography>
                            <Chip 
                              label={shop.shopCategory} 
                              size="small" 
                              sx={{ mt: 1 }}
                            />
                          </CardContent>
                          <CardActions>
                            <Button 
                              size="small" 
                              startIcon={<Edit />}
                              onClick={() => navigate(`/shop/${shop.id}`)}
                            >
                              編集
                            </Button>
                            <Button 
                              size="small" 
                              startIcon={<Visibility />}
                            >
                              表示
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* イベント管理セクション */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    <Event sx={{ mr: 1, verticalAlign: 'middle' }} />
                    イベント管理
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/event/new')}
                    disabled={shops.length === 0}
                  >
                    新規イベント追加
                  </Button>
                </Box>

                {shops.length === 0 ? (
                  <Alert severity="info">
                    イベントを追加するには、まず店舗情報を登録してください。
                  </Alert>
                ) : events.length === 0 ? (
                  <Typography color="text.secondary">
                    イベントが登録されていません。
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {events.map((event) => (
                      <Grid item xs={12} md={6} key={event.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {event.eventName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {formatDate(event.eventTimeStart)}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              {event.description}
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                              <Chip 
                                label={APPROVAL_STATUS_LABELS[event.approvalStatus]}
                                color={getApprovalChipColor(event.approvalStatus)}
                                size="small"
                              />
                              <Chip 
                                label={EVENT_PROGRESS_LABELS[event.eventProgress]}
                                color={getProgressChipColor(event.eventProgress)}
                                size="small"
                              />
                            </Box>
                          </CardContent>
                          <CardActions>
                            <Button 
                              size="small" 
                              startIcon={<Edit />}
                              onClick={() => navigate(`/event/${event.id}`)}
                            >
                              編集
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}