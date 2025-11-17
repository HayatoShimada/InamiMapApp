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
  Schedule,
} from '@mui/icons-material';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { FirestoreEvent, FirestoreShop } from '../types/firebase';
import { EVENT_PROGRESS_LABELS, APPROVAL_STATUS_LABELS } from '../types/firebase';
import QuickTemporaryStatusModal from '../components/QuickTemporaryStatusModal';

export default function Dashboard() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState<FirestoreShop[]>([]);
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [temporaryStatusModal, setTemporaryStatusModal] = useState<{
    open: boolean;
    shopId?: string;
    shopName?: string;
    currentStatus?: FirestoreShop['temporaryStatus'];
  }>({ open: false });

  const { updateDocument } = useFirestore<FirestoreShop>('shops');

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) {
      console.log('ダッシュボード: ユーザーが認証されていません');
      return;
    }

    console.log('ダッシュボード: データ取得開始, ユーザーUID:', currentUser.uid);

    try {
      setLoading(true);
      setError('');

      // 自分の店舗を取得 (orderByを削除してテスト)
      const shopsQuery = query(
        collection(db, 'shops'),
        where('ownerUserId', '==', currentUser.uid)
      );
      console.log('ダッシュボード: 店舗クエリ実行中...');
      const shopsSnapshot = await getDocs(shopsQuery);
      console.log('ダッシュボード: 店舗クエリ結果:', shopsSnapshot.size, '件');
      
      const shopsData = shopsSnapshot.docs.map(doc => {
        const data = doc.data() as any;
        console.log('ダッシュボード: 店舗データ:', doc.id, data);
        
        // approvalStatusが存在しない場合のデフォルト値設定
        if (!data.approvalStatus) {
          console.log('approvalStatusが未設定の店舗を検出:', doc.id);
          // 既存店舗はデフォルトで承認待ちとする
          data.approvalStatus = 'pending';
        }
        
        return { id: doc.id, ...data } as FirestoreShop;
      });
      console.log('ダッシュボード: 変換後の店舗データ:', shopsData);
      setShops(shopsData);

      // 自分のイベントを取得 (orderByなしでシンプルに)
      console.log('ダッシュボード: イベント取得開始...');
      const eventsQuery = query(
        collection(db, 'events'),
        where('ownerUserId', '==', currentUser.uid)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      console.log('ダッシュボード: イベントクエリ結果:', eventsSnapshot.size, '件');
      
      const eventsData = eventsSnapshot.docs.map(doc => {
        const data = doc.data() as any;
        console.log('ダッシュボード: イベントデータ:', doc.id, data);
        return { id: doc.id, ...data } as FirestoreEvent;
      });
      console.log('ダッシュボード: 変換後のイベントデータ:', eventsData);
      setEvents(eventsData);

    } catch (error: any) {
      console.error('ダッシュボード: データ取得エラー:', error);
      console.error('ダッシュボード: エラー詳細:', error.code, error.message);
      setError(`データの取得に失敗しました: ${error.message || error.toString()}`);
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

  const handleTemporaryStatusSave = async (data: {
    isTemporaryClosed: boolean;
    isReducedHours: boolean;
    startDate?: Date;
    endDate?: Date;
    message?: string;
  }) => {
    if (!temporaryStatusModal.shopId) return;

    try {
      const temporaryStatus = (data.isTemporaryClosed || data.isReducedHours) ? {
        isTemporaryClosed: data.isTemporaryClosed,
        isReducedHours: data.isReducedHours,
        startDate: data.startDate ? Timestamp.fromDate(data.startDate) : undefined,
        endDate: data.endDate ? Timestamp.fromDate(data.endDate) : undefined,
        message: data.message,
      } : undefined;

      await updateDocument(temporaryStatusModal.shopId, { temporaryStatus });
      
      // 店舗リストを更新
      fetchData();
      
      setTemporaryStatusModal({ open: false });
    } catch (error) {
      console.error('時短営業設定の保存エラー:', error);
      setError('時短営業設定の保存に失敗しました');
    }
  };

  const openTemporaryStatusModal = (shop: FirestoreShop) => {
    setTemporaryStatusModal({
      open: true,
      shopId: shop.id,
      shopName: shop.shopName,
      currentStatus: shop.temporaryStatus,
    });
  };

  return (
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
                            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={shop.shopCategory} 
                                size="small"
                              />
                              <Chip 
                                label={
                                  shop.approvalStatus === 'approved' ? '承認済み' :
                                  shop.approvalStatus === 'pending' ? '承認待ち' :
                                  shop.approvalStatus === 'rejected' ? '却下' : '承認待ち'
                                }
                                size="small"
                                color={
                                  shop.approvalStatus === 'approved' ? 'success' :
                                  shop.approvalStatus === 'pending' ? 'warning' :
                                  shop.approvalStatus === 'rejected' ? 'error' : 'warning'
                                }
                              />
                              {shop.temporaryStatus?.isTemporaryClosed && (
                                <Chip 
                                  label="臨時休業中" 
                                  size="small"
                                  color="error"
                                />
                              )}
                              {shop.temporaryStatus?.isReducedHours && (
                                <Chip 
                                  label="時短営業中" 
                                  size="small"
                                  color="warning"
                                />
                              )}
                            </Box>
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
                              onClick={() => navigate(`/shop/${shop.id}`)}
                            >
                              表示
                            </Button>
                            {shop.approvalStatus === 'approved' && (
                              <Button 
                                size="small" 
                                startIcon={<Schedule />}
                                onClick={() => openTemporaryStatusModal(shop)}
                                color="secondary"
                              >
                                時短営業設定
                              </Button>
                            )}
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
                            {event.eventCategory && (
                              <Chip 
                                label={event.eventCategory} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 1 }}
                              />
                            )}
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

        {/* 時短営業設定モーダル */}
        <QuickTemporaryStatusModal
          open={temporaryStatusModal.open}
          onClose={() => setTemporaryStatusModal({ open: false })}
          onSave={handleTemporaryStatusSave}
          shopName={temporaryStatusModal.shopName || ''}
          currentStatus={temporaryStatusModal.currentStatus}
        />
    </Container>
  );
}