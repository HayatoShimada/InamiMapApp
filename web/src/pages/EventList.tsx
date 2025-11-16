import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  Fab,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Event,
  Edit,
  Add,
  Schedule,
  LocationOn,
  Store,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  PlayArrow,
  Stop,
} from '@mui/icons-material';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreEvent } from '../types/firebase';
import { EVENT_PROGRESS_LABELS, APPROVAL_STATUS_LABELS } from '../types/firebase';
import { EVENT_PROGRESS_STATUS, EVENT_APPROVAL_STATUS } from '../../../shared/constants';
import AppNavigation from '../components/AppNavigation';

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

export default function EventList() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [progressFilter, setProgressFilter] = useState<string>('all');

  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    fetchEvents();
  }, [currentUser, tabValue]);

  const fetchEvents = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      let eventsQuery;
      
      if (isAdmin) {
        if (tabValue === 0) {
          // 管理者: 承認待ちイベント
          eventsQuery = query(
            collection(db, 'events'),
            where('approvalStatus', '==', EVENT_APPROVAL_STATUS.PENDING),
            orderBy('createdAt', 'desc')
          );
        } else if (tabValue === 1) {
          // 管理者: 全イベント
          eventsQuery = query(
            collection(db, 'events'),
            orderBy('eventTimeStart', 'desc')
          );
        }
      } else {
        // 一般ユーザー: 自分のイベントのみ
        eventsQuery = query(
          collection(db, 'events'),
          where('ownerUserId', '==', currentUser.uid),
          orderBy('eventTimeStart', 'desc')
        );
      }

      if (eventsQuery) {
        const querySnapshot = await getDocs(eventsQuery);
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirestoreEvent[];

        setEvents(eventsData);
      }
    } catch (error: any) {
      console.error('イベント一覧取得エラー:', error);
      setError('イベント一覧の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  const getProgressIcon = (progress: string) => {
    switch (progress) {
      case EVENT_PROGRESS_STATUS.SCHEDULED:
        return <HourglassEmpty />;
      case EVENT_PROGRESS_STATUS.ONGOING:
        return <PlayArrow />;
      case EVENT_PROGRESS_STATUS.FINISHED:
        return <Stop />;
      case EVENT_PROGRESS_STATUS.CANCELLED:
        return <Cancel />;
      default:
        return <Event />;
    }
  };

  const getProgressChipColor = (progress: string) => {
    switch (progress) {
      case EVENT_PROGRESS_STATUS.SCHEDULED:
        return 'primary';
      case EVENT_PROGRESS_STATUS.ONGOING:
        return 'success';
      case EVENT_PROGRESS_STATUS.FINISHED:
        return 'default';
      case EVENT_PROGRESS_STATUS.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getApprovalChipColor = (status: string) => {
    switch (status) {
      case EVENT_APPROVAL_STATUS.APPROVED:
        return 'success';
      case EVENT_APPROVAL_STATUS.PENDING:
        return 'warning';
      case EVENT_APPROVAL_STATUS.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getDefaultImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0Y1RjVGNSIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTZweCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuOCpOODmeODs+ODiOeUu+WDjzwvdGV4dD4KPC9zdmc+';
  };

  // 進行状況でフィルタリング
  const filteredEvents = events.filter(event => {
    if (progressFilter === 'all') return true;
    return event.eventProgress === progressFilter;
  });

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppNavigation />
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
          <Typography>読み込み中...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppNavigation />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Event sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            イベント管理
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 管理者用タブ */}
        {isAdmin && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="承認待ち" />
              <Tab label="全イベント" />
            </Tabs>
          </Box>
        )}

        {/* 進行状況フィルター */}
        {(!isAdmin || tabValue === 1) && (
          <Box sx={{ mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>進行状況で絞り込み</InputLabel>
              <Select
                value={progressFilter}
                label="進行状況で絞り込み"
                onChange={(e) => setProgressFilter(e.target.value)}
              >
                <MenuItem value="all">すべて表示</MenuItem>
                <MenuItem value={EVENT_PROGRESS_STATUS.SCHEDULED}>
                  {EVENT_PROGRESS_LABELS.scheduled}
                </MenuItem>
                <MenuItem value={EVENT_PROGRESS_STATUS.ONGOING}>
                  {EVENT_PROGRESS_LABELS.ongoing}
                </MenuItem>
                <MenuItem value={EVENT_PROGRESS_STATUS.FINISHED}>
                  {EVENT_PROGRESS_LABELS.finished}
                </MenuItem>
                <MenuItem value={EVENT_PROGRESS_STATUS.CANCELLED}>
                  {EVENT_PROGRESS_LABELS.cancelled}
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* 管理者用承認待ちタブ */}
        <TabPanel value={tabValue} index={0}>
          {filteredEvents.length === 0 ? (
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
              {filteredEvents.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <EventCard event={event} isAdmin={isAdmin} navigate={navigate} />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* 全イベント表示 */}
        <TabPanel value={tabValue} index={isAdmin ? 1 : 0}>
          {filteredEvents.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <Event sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {progressFilter === 'all' 
                    ? 'イベントが登録されていません' 
                    : '該当するイベントがありません'
                  }
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  新しいイベントを登録しましょう
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/event/new')}
                  sx={{ mt: 2 }}
                >
                  イベントを追加
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredEvents.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <EventCard event={event} isAdmin={isAdmin} navigate={navigate} />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* フローティングアクションボタン */}
        <Fab
          color="primary"
          aria-label="add event"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => navigate('/event/new')}
        >
          <Add />
        </Fab>
      </Container>
    </Box>
  );
}

// イベントカードコンポーネント
interface EventCardProps {
  event: FirestoreEvent;
  isAdmin: boolean;
  navigate: (path: string) => void;
}

function EventCard({ event, isAdmin, navigate }: EventCardProps) {
  const { currentUser } = useAuth();
  
  const getProgressIcon = (progress: string) => {
    switch (progress) {
      case EVENT_PROGRESS_STATUS.SCHEDULED:
        return <HourglassEmpty />;
      case EVENT_PROGRESS_STATUS.ONGOING:
        return <PlayArrow />;
      case EVENT_PROGRESS_STATUS.FINISHED:
        return <Stop />;
      case EVENT_PROGRESS_STATUS.CANCELLED:
        return <Cancel />;
      default:
        return <Event />;
    }
  };

  const getProgressChipColor = (progress: string) => {
    switch (progress) {
      case EVENT_PROGRESS_STATUS.SCHEDULED:
        return 'primary';
      case EVENT_PROGRESS_STATUS.ONGOING:
        return 'success';
      case EVENT_PROGRESS_STATUS.FINISHED:
        return 'default';
      case EVENT_PROGRESS_STATUS.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getApprovalChipColor = (status: string) => {
    switch (status) {
      case EVENT_APPROVAL_STATUS.APPROVED:
        return 'success';
      case EVENT_APPROVAL_STATUS.PENDING:
        return 'warning';
      case EVENT_APPROVAL_STATUS.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getDefaultImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0Y1RjVGNSIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTZweCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuOCpOODmeODs+ODiOeUu+WDjzwvdGV4dD4KPC9zdmc+';
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

  const canEdit = event.ownerUserId === currentUser?.uid || isAdmin;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={event.images && event.images.length > 0 ? event.images[0] : getDefaultImage()}
        alt={event.eventName}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {event.eventName}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
          {event.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Schedule sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            {formatDate(event.eventTimeStart)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            {event.location}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          <Chip 
            label={APPROVAL_STATUS_LABELS[event.approvalStatus]}
            size="small"
            color={getApprovalChipColor(event.approvalStatus)}
          />
          <Chip 
            icon={getProgressIcon(event.eventProgress)}
            label={EVENT_PROGRESS_LABELS[event.eventProgress]}
            size="small"
            color={getProgressChipColor(event.eventProgress)}
          />
        </Box>

        {isAdmin && (
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={`投稿者: ${event.ownerUserId.substring(0, 8)}...`}
              size="small"
              variant="outlined"
              color="secondary"
            />
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {formatDate(event.createdAt)}
        </Typography>
        {canEdit && (
          <Button 
            size="small" 
            startIcon={<Edit />}
            onClick={() => navigate(`/event/${event.id}`)}
          >
            編集
          </Button>
        )}
      </CardActions>
    </Card>
  );
}