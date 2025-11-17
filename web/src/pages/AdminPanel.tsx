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
} from '@mui/material';
import {
  AdminPanelSettings,
  CheckCircle,
  Cancel,
  Event,
  Visibility,
} from '@mui/icons-material';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreEvent } from '../types/firebase';
import { EVENT_PROGRESS_LABELS, APPROVAL_STATUS_LABELS } from '../types/firebase';
import { EVENT_APPROVAL_STATUS } from '../../../shared/constants';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<FirestoreEvent | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

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
    fetchEvents();
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
          where('approvalStatus', '==', EVENT_APPROVAL_STATUS.PENDING),
          orderBy('createdAt', 'desc')
        );
      } else if (tabValue === 1) {
        // 承認済みイベント
        eventsQuery = query(
          collection(db, 'events'),
          where('approvalStatus', '==', EVENT_APPROVAL_STATUS.APPROVED),
          orderBy('createdAt', 'desc')
        );
      } else {
        // 却下されたイベント
        eventsQuery = query(
          collection(db, 'events'),
          where('approvalStatus', '==', EVENT_APPROVAL_STATUS.REJECTED),
          orderBy('createdAt', 'desc')
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
            <Tab label="承認待ち" />
            <Tab label="承認済み" />
            <Tab label="却下済み" />
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
    </Container>
  );
}