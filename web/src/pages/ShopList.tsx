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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Store,
  Edit,
  Visibility,
  Add,
  LocationOn,
} from '@mui/icons-material';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreShop } from '../types/firebase';
import ShopPreview from '../components/ShopPreview';

export default function ShopList() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [shops, setShops] = useState<FirestoreShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [previewShop, setPreviewShop] = useState<FirestoreShop | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetchShops();
  }, [currentUser]);

  const fetchShops = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      let shopsQuery;
      if (userData?.role === 'admin') {
        // 管理者は全店舗を表示
        shopsQuery = query(
          collection(db, 'shops'),
          orderBy('createdAt', 'desc')
        );
      } else {
        // 一般ユーザーは自分の店舗のみ表示
        shopsQuery = query(
          collection(db, 'shops'),
          where('ownerUserId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(shopsQuery);
      const shopsData = querySnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return { id: doc.id, ...data } as FirestoreShop;
      });

      setShops(shopsData);
    } catch (error: any) {
      console.error('店舗一覧取得エラー:', error);
      setError('店舗一覧の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ja-JP');
  };

  const handlePreviewShop = (shop: FirestoreShop) => {
    setPreviewShop(shop);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewShop(null);
  };

  const getDefaultImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0Y1RjVGNSIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTZweCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuW6l+iIl+eUu+WDjzwvdGV4dD4KPC9zdmc+';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>読み込み中...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Store sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            店舗管理
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {shops.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <Store sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                店舗が登録されていません
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                最初の店舗を登録しましょう
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/shop/new')}
                sx={{ mt: 2 }}
              >
                店舗を追加
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {shops.map((shop) => (
              <Grid item xs={12} sm={6} md={4} key={shop.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={shop.images && shop.images.length > 0 ? shop.images[0] : getDefaultImage()}
                    alt={shop.shopName}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {shop.shopName}
                      </Typography>
                      <Chip 
                        label={shop.shopCategory} 
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                      {shop.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {shop.address}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      登録日: {formatDate(shop.createdAt)}
                    </Typography>

                    {userData?.role === 'admin' && (
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={`オーナー: ${shop.ownerUserId}`} 
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      </Box>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        startIcon={<Visibility />}
                        onClick={() => handlePreviewShop(shop)}
                      >
                        プレビュー
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<LocationOn />}
                        onClick={() => window.open(shop.googleMapUrl || `https://maps.google.com/?q=${shop.address}`, '_blank')}
                      >
                        地図
                      </Button>
                    </Box>
                    {(currentUser?.uid === shop.ownerUserId || userData?.role === 'admin') && (
                      <Button 
                        size="small" 
                        startIcon={<Edit />}
                        onClick={() => navigate(`/shop/${shop.id}`)}
                      >
                        編集
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* フローティングアクションボタン */}
        <Fab
          color="primary"
          aria-label="add shop"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => navigate('/shop/new')}
        >
          <Add />
        </Fab>

        {/* プレビューダイアログ */}
        <Dialog
          open={previewOpen}
          onClose={handleClosePreview}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            店舗プレビュー
          </DialogTitle>
          <DialogContent>
            {previewShop && (
              <ShopPreview shop={previewShop} compact={false} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreview}>
              閉じる
            </Button>
          </DialogActions>
        </Dialog>
    </Container>
  );
}