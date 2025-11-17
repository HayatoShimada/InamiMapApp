import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import {
  AdminPanelSettings,
  CheckCircle,
  Cancel,
  Event,
  Visibility,
  Business,
  Add,
} from '@mui/icons-material';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreEvent, FirestorePublicFacility, FirestoreShop } from '../types/firebase';
import { EVENT_PROGRESS_LABELS, APPROVAL_STATUS_LABELS, SERVICE_ICONS } from '../types/firebase';
import { EVENT_APPROVAL_STATUS } from '../../../shared/constants';
import UserManagement from './UserManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPanel() {
  const { userData } = useAuth();
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [shops, setShops] = useState<FirestoreShop[]>([]);
  const [facilities, setFacilities] = useState<FirestorePublicFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<FirestoreEvent | null>(null);
  const [selectedShop, setSelectedShop] = useState<FirestoreShop | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [shopApprovalDialog, setShopApprovalDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [migratingShops, setMigratingShops] = useState(false);

  // 管理者権限チェック
  if (userData?.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          管理者権限が必要です。
        </Alert>
      </Container>
    );
  }

  useEffect(() => {
    if (tabValue < 3) {
      fetchEvents();
    } else if (tabValue === 3) {
      // ユーザー管理タブ - UserManagementコンポーネントが独自に処理
    } else if (tabValue === 4) {
      fetchShops();
    } else if (tabValue === 5) {
      fetchFacilities();
    }
  }, [tabValue]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      let eventsQuery;
      
      if (tabValue === 0) {
        // 承認待ちイベント
        eventsQuery = query(
          collection(db, 'events'),
          where('approvalStatus', '==', EVENT_APPROVAL_STATUS.PENDING)
        );
      } else if (tabValue === 1) {
        // 承認済みイベント
        eventsQuery = query(
          collection(db, 'events'),
          where('approvalStatus', '==', EVENT_APPROVAL_STATUS.APPROVED)
        );
      } else {
        // 却下されたイベント
        eventsQuery = query(
          collection(db, 'events'),
          where('approvalStatus', '==', EVENT_APPROVAL_STATUS.REJECTED)
        );
      }

      const querySnapshot = await getDocs(eventsQuery);
      const eventsData = querySnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return { id: doc.id, ...data } as FirestoreEvent;
      });

      setEvents(eventsData);
    } catch (error: any) {
      console.error('イベント取得エラー:', error);
      setError('イベントの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      setLoading(true);
      setError('');

      // 全店舗を取得してクライアント側でフィルタリング
      // approvalStatusがないものも承認待ちとして扱う
      const shopsQuery = query(collection(db, 'shops'));
      const querySnapshot = await getDocs(shopsQuery);
      const shopsData = querySnapshot.docs.map(doc => {
        const data = doc.data() as any;
        
        // approvalStatusがない場合はpendingとして扱う
        if (!data.approvalStatus) {
          data.approvalStatus = 'pending';
        }
        
        return { id: doc.id, ...data } as FirestoreShop;
      }).filter(shop => shop.approvalStatus === 'pending'); // pending のみフィルタ

      setShops(shopsData);
    } catch (error: any) {
      console.error('店舗取得エラー:', error);
      setError('店舗の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError('');

      const facilitiesQuery = query(collection(db, 'publicFacilities'));
      const querySnapshot = await getDocs(facilitiesQuery);
      const facilitiesData = querySnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return { id: doc.id, ...data } as FirestorePublicFacility;
      });

      setFacilities(facilitiesData);
    } catch (error: any) {
      console.error('公共施設取得エラー:', error);
      setError('公共施設の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const toggleFacilityStatus = async (facilityId: string, currentStatus: boolean) => {
    try {
      const facilityRef = doc(db, 'publicFacilities', facilityId);
      await updateDoc(facilityRef, {
        isActive: !currentStatus,
      });

      // リストを更新
      await fetchFacilities();
    } catch (error: any) {
      console.error('公共施設ステータス更新エラー:', error);
      setError('公共施設のステータス更新に失敗しました。');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApproveEvent = async (eventId: string) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        approvalStatus: EVENT_APPROVAL_STATUS.APPROVED,
        approvedAt: new Date(),
      });

      // リストを更新
      await fetchEvents();
      setApprovalDialog(false);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error('承認エラー:', error);
      setError('イベントの承認に失敗しました。');
    }
  };

  const handleRejectEvent = async (eventId: string, reason: string) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        approvalStatus: EVENT_APPROVAL_STATUS.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: reason,
      });

      // リストを更新
      await fetchEvents();
      setApprovalDialog(false);
      setSelectedEvent(null);
      setRejectionReason('');
    } catch (error: any) {
      console.error('却下エラー:', error);
      setError('イベントの却下に失敗しました。');
    }
  };

  const handleApproveShop = async (shopId: string) => {
    try {
      const shopRef = doc(db, 'shops', shopId);
      await updateDoc(shopRef, {
        approvalStatus: 'approved',
        approvedAt: new Date(),
      });

      // UIを更新
      fetchShops();
    } catch (error: any) {
      console.error('店舗承認エラー:', error);
      setError('店舗の承認に失敗しました。');
    }
  };

  const handleRejectShop = async (shopId: string, reason: string) => {
    try {
      const shopRef = doc(db, 'shops', shopId);
      await updateDoc(shopRef, {
        approvalStatus: 'rejected',
        rejectionReason: reason || '理由なし',
        rejectedAt: new Date(),
      });

      // UIを更新
      fetchShops();
      setShopApprovalDialog(false);
      setRejectionReason('');
      setSelectedShop(null);
    } catch (error: any) {
      console.error('店舗却下エラー:', error);
      setError('店舗の却下に失敗しました。');
    }
  };

  // 既存店舗のapprovalStatusを一括でpendingに設定するマイグレーション
  const migrateExistingShops = async () => {
    try {
      setMigratingShops(true);
      setError('');
      
      // 全店舗を取得
      const shopsQuery = query(collection(db, 'shops'));
      const querySnapshot = await getDocs(shopsQuery);
      
      const batch = writeBatch(db);
      let updatedCount = 0;
      
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (!data.approvalStatus) {
          const shopRef = doc.ref;
          batch.update(shopRef, {
            approvalStatus: 'pending',
            updatedAt: new Date(),
          });
          updatedCount++;
        }
      });
      
      if (updatedCount > 0) {
        await batch.commit();
        console.log(`${updatedCount}件の店舗のapprovalStatusをpendingに設定しました`);
        
        // UIを更新
        await fetchShops();
        
        alert(`${updatedCount}件の既存店舗を承認待ちリストに追加しました。`);
      } else {
        alert('マイグレーションが必要な店舗はありませんでした。');
      }
    } catch (error: any) {
      console.error('店舗マイグレーションエラー:', error);
      setError('店舗の一括更新に失敗しました。');
    } finally {
      setMigratingShops(false);
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

  const getDefaultImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0Y1RjVGNSIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTZweCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuOCpOODmeODs+ODiOeUu+WDjzwvdGV4dD4KPC9zdmc+';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <AdminPanelSettings sx={{ mr: 1, fontSize: 32, color: 'secondary.main' }} />
          <Typography variant="h4" component="h1">
            管理者パネル
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* タブ */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="イベント承認待ち" />
            <Tab label="承認済みイベント" />
            <Tab label="却下イベント" />
            <Tab label="ユーザー管理" />
            <Tab label="店舗承認待ち" />
            <Tab label="公共施設管理" />
          </Tabs>
        </Box>

        {/* 承認待ちタブ */}
        <TabPanel value={tabValue} index={0}>
          {events.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  承認待ちのイベントはありません
                </Typography>
                <Typography color="text.secondary">
                  現在承認が必要なイベントはありません
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} key={event.id}>
                  <Card>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                          <Box
                            component="img"
                            sx={{
                              height: 150,
                              width: '100%',
                              objectFit: 'cover',
                              borderRadius: 1,
                            }}
                            src={event.images && event.images.length > 0 ? event.images[0] : getDefaultImage()}
                            alt={event.eventName}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>
                            {event.eventName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {event.description}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>開催日時:</strong> {formatDate(event.eventTimeStart)} 〜 {formatDate(event.eventTimeEnd)}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>開催場所:</strong> {event.location}
                          </Typography>
                          <Typography variant="body2">
                            <strong>投稿者:</strong> {event.ownerUserId}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Chip 
                              label={EVENT_PROGRESS_LABELS[event.eventProgress]}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              label={`投稿日: ${formatDate(event.createdAt)}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleApproveEvent(event.id)}
                              fullWidth
                            >
                              承認
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => {
                                setSelectedEvent(event);
                                setApprovalDialog(true);
                              }}
                              fullWidth
                            >
                              却下
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<Visibility />}
                              onClick={() => {
                                setSelectedEvent(event);
                                // プレビュー機能をここに実装可能
                              }}
                              fullWidth
                            >
                              詳細
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* 承認済みタブ */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} md={6} key={event.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {event.eventName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {formatDate(event.eventTimeStart)}
                    </Typography>
                    <Chip 
                      label="承認済み"
                      color="success"
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* 却下済みタブ */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} md={6} key={event.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {event.eventName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {formatDate(event.eventTimeStart)}
                    </Typography>
                    <Chip 
                      label="却下済み"
                      color="error"
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* ユーザー管理タブ */}
        <TabPanel value={tabValue} index={3}>
          <UserManagement />
        </TabPanel>

        {/* 店舗承認待ちタブ */}
        <TabPanel value={tabValue} index={4}>
          {/* マイグレーション機能 */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h2">
              店舗承認管理
            </Typography>
            <Button
              variant="outlined"
              onClick={migrateExistingShops}
              disabled={migratingShops}
              startIcon={migratingShops ? <CircularProgress size={20} /> : <Business />}
            >
              {migratingShops ? 'マイグレーション中...' : '既存店舗を承認待ちに追加'}
            </Button>
          </Box>
          
          {loading && <CircularProgress />}
          {shops.length === 0 && !loading ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  承認待ちの店舗はありません
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  現在承認が必要な店舗はありません
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  既存の店舗がある場合は、上の「既存店舗を承認待ちに追加」ボタンで一括追加できます。
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {shops.map((shop) => (
                <Grid item xs={12} md={6} key={shop.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {shop.shopName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        カテゴリ: {shop.shopCategory}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        住所: {shop.address}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {shop.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        こだわりポイント: {shop.maniacPoint}
                      </Typography>
                      
                      {/* 提供サービス */}
                      {shop.services && shop.services.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="primary" fontWeight="bold" display="block" sx={{ mb: 1 }}>
                            提供サービス ({shop.services.length}件)
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {shop.services.slice(0, 6).map((service) => (
                              <Chip
                                key={service}
                                label={`${SERVICE_ICONS[service] || '⭐'} ${service}`}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                            {shop.services.length > 6 && (
                              <Chip
                                label={`+${shop.services.length - 6}`}
                                size="small"
                                variant="outlined"
                                color="default"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                      
                      <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleApproveShop(shop.id)}
                              fullWidth
                            >
                              承認
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => {
                                setSelectedShop(shop);
                                setShopApprovalDialog(true);
                              }}
                              fullWidth
                            >
                              却下
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* 公共施設管理タブ */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h2">
              公共施設管理
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => window.location.href = '/admin/facility/new'}
            >
              新規公共施設追加
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : facilities.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <Business sx={{ fontSize: 64, color: 'action.active', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  公共施設が登録されていません
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  新規公共施設を追加してください
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => window.location.href = '/admin/facility/new'}
                >
                  新規追加
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {facilities.map((facility) => (
                <Grid item xs={12} md={6} key={facility.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {facility.name}
                        </Typography>
                        <Chip
                          label={facility.isActive ? '表示中' : '非表示'}
                          color={facility.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {facility.facilityType}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {facility.description}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        <strong>住所:</strong> {facility.address}
                      </Typography>
                      
                      {facility.phone && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          <strong>電話:</strong> {facility.phone}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.location.href = `/admin/facility/${facility.id}`}
                        >
                          編集
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color={facility.isActive ? 'error' : 'success'}
                          onClick={() => toggleFacilityStatus(facility.id, facility.isActive)}
                        >
                          {facility.isActive ? '非表示にする' : '表示する'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* 却下理由入力ダイアログ */}
        <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>イベント却下</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              「{selectedEvent?.eventName}」を却下しますか？
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="却下理由（任意）"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApprovalDialog(false)}>
              キャンセル
            </Button>
            <Button 
              onClick={() => selectedEvent && handleRejectEvent(selectedEvent.id, rejectionReason)}
              color="error"
              variant="contained"
            >
              却下
            </Button>
          </DialogActions>
        </Dialog>

        {/* 店舗却下理由入力ダイアログ */}
        <Dialog open={shopApprovalDialog} onClose={() => setShopApprovalDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>店舗却下</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              「{selectedShop?.shopName}」を却下しますか？
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="却下理由（任意）"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShopApprovalDialog(false)}>
              キャンセル
            </Button>
            <Button 
              onClick={() => selectedShop && handleRejectShop(selectedShop.id, rejectionReason)}
              color="error"
              variant="contained"
            >
              却下
            </Button>
          </DialogActions>
        </Dialog>
    </Container>
  );
}