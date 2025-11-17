import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Store,
  Event,
  AdminPanelSettings,
  ExitToApp,
  Person,
  Map,
} from '@mui/icons-material';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreShop, FirestoreEvent } from '../types/firebase';

export default function AppNavigation() {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mapPreviewOpen, setMapPreviewOpen] = useState(false);
  const [shops, setShops] = useState<FirestoreShop[]>([]);
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [loadingMapData, setLoadingMapData] = useState(false);
  const [mapError, setMapError] = useState<string>('');

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
    handleMenuClose();
  };

  const fetchMapData = async () => {
    if (!currentUser) return;

    try {
      setLoadingMapData(true);
      setMapError('');

      // 管理者は全データ、一般ユーザーは自分のデータのみ
      let shopsQuery, eventsQuery;

      if (userData?.role === 'admin') {
        shopsQuery = query(
          collection(db, 'shops'),
          orderBy('createdAt', 'desc')
        );
        eventsQuery = query(
          collection(db, 'events'),
          orderBy('createdAt', 'desc')
        );
      } else {
        shopsQuery = query(
          collection(db, 'shops'),
          where('ownerUserId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        eventsQuery = query(
          collection(db, 'events'),
          where('ownerUserId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
      }

      const [shopsSnapshot, eventsSnapshot] = await Promise.all([
        getDocs(shopsQuery),
        getDocs(eventsQuery)
      ]);

      const shopsData = shopsSnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return { id: doc.id, ...data } as FirestoreShop;
      });

      const eventsData = eventsSnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return { id: doc.id, ...data } as FirestoreEvent;
      });

      setShops(shopsData);
      setEvents(eventsData);
    } catch (error: any) {
      console.error('マップデータ取得エラー:', error);
      setMapError('データの取得に失敗しました。');
    } finally {
      setLoadingMapData(false);
    }
  };

  const handleMapPreview = () => {
    setMapPreviewOpen(true);
    fetchMapData();
  };

  const handleCloseMapPreview = () => {
    setMapPreviewOpen(false);
    setShops([]);
    setEvents([]);
    setMapError('');
  };

  const generateMapUrl = () => {
    const markers: string[] = [];

    // 店舗マーカーを追加
    shops.forEach((shop, index) => {
      if (shop.location?.latitude && shop.location?.longitude) {
        markers.push(`${shop.location.latitude},${shop.location.longitude}`);
      }
    });

    // イベントマーカーを追加（承認済みのみ）
    events.forEach((event, index) => {
      if (event.approvalStatus === 'approved' && event.location) {
        // イベントの場所が住所文字列の場合は、店舗の座標を参照するか、geocodingが必要
        // 簡易実装として、イベントに参加店舗がある場合はその店舗の座標を使用
        if (event.participatingShops && event.participatingShops.length > 0) {
          const participatingShop = shops.find(shop => 
            event.participatingShops?.includes(shop.id)
          );
          if (participatingShop?.location?.latitude && participatingShop?.location?.longitude) {
            markers.push(`${participatingShop.location.latitude},${participatingShop.location.longitude}`);
          }
        }
      }
    });

    if (markers.length === 0) {
      // デフォルト位置（井波）
      return 'https://www.google.com/maps/@36.5569,136.9628,15z';
    }

    // 複数マーカーがある場合は最初のマーカーを中心とした地図
    const centerMarker = markers[0];
    let mapUrl = `https://www.google.com/maps/@${centerMarker},15z`;

    // すべてのマーカーを表示するには、Google Maps Embed APIやDirections APIが必要
    // 簡易実装として、最初のマーカー位置を中心とした地図を表示
    return mapUrl;
  };

  const navigationItems = [
    { path: '/dashboard', label: 'ダッシュボード', icon: <Store /> },
    { path: '/shops', label: '店舗管理', icon: <Store /> },
    { path: '/events', label: 'イベント管理', icon: <Event /> },
    ...(userData?.role === 'admin' ? [
      { path: '/admin', label: '管理者画面', icon: <AdminPanelSettings /> },
    ] : []),
  ];

  if (!currentUser) {
    return null;
  }

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          井波マップ管理画面
        </Typography>

        {/* ナビゲーションボタン */}
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              variant={location.pathname === item.path ? 'outlined' : 'text'}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              {item.label}
            </Button>
          ))}
          
          {/* マッププレビューボタン */}
          <Button
            color="inherit"
            startIcon={<Map />}
            onClick={handleMapPreview}
            variant="text"
          >
            マップ
          </Button>
        </Box>

        {/* ユーザー情報とメニュー */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {userData?.role === 'admin' && (
            <Chip
              label="管理者"
              size="small"
              color="secondary"
              sx={{ color: 'white', backgroundColor: 'secondary.main' }}
            />
          )}
          
          <Button
            color="inherit"
            onClick={handleMenuClick}
            startIcon={
              <Avatar
                src={currentUser.photoURL || ''}
                sx={{ width: 32, height: 32 }}
              >
                <Person />
              </Avatar>
            }
          >
            {userData?.displayName || currentUser.email}
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2">
                  {userData?.displayName || 'ユーザー'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentUser.email}
                </Typography>
              </Box>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 2 }} />
              ログアウト
            </MenuItem>
          </Menu>
        </Box>

        {/* マッププレビューダイアログ */}
        <Dialog
          open={mapPreviewOpen}
          onClose={handleCloseMapPreview}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            マッププレビュー - 登録済み店舗・イベント
          </DialogTitle>
          <DialogContent>
            {loadingMapData ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>データを取得中...</Typography>
              </Box>
            ) : mapError ? (
              <Alert severity="error">{mapError}</Alert>
            ) : (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  登録されている店舗: {shops.length}件, イベント: {events.length}件
                </Typography>
                
                {shops.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>店舗一覧:</Typography>
                    {shops.map((shop, index) => (
                      <Typography key={shop.id} variant="body2" sx={{ ml: 2 }}>
                        • {shop.shopName} ({shop.shopCategory})
                        {shop.location?.latitude && shop.location?.longitude && (
                          <span style={{ color: 'green', marginLeft: 8 }}>
                            📍 座標: {shop.location.latitude.toFixed(4)}, {shop.location.longitude.toFixed(4)}
                          </span>
                        )}
                      </Typography>
                    ))}
                  </Box>
                )}

                {events.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>イベント一覧:</Typography>
                    {events.map((event, index) => (
                      <Typography key={event.id} variant="body2" sx={{ ml: 2 }}>
                        • {event.eventName} 
                        <span style={{ 
                          color: event.approvalStatus === 'approved' ? 'green' : 
                                 event.approvalStatus === 'pending' ? 'orange' : 'red',
                          marginLeft: 8 
                        }}>
                          ({event.approvalStatus === 'approved' ? '承認済み' : 
                            event.approvalStatus === 'pending' ? '承認待ち' : '却下'})
                        </span>
                      </Typography>
                    ))}
                  </Box>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Map />}
                  onClick={() => window.open(generateMapUrl(), '_blank')}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Googleマップで表示
                </Button>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMapPreview}>
              閉じる
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
}