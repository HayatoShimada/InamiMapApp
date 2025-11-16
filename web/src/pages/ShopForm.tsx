import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Save, Cancel, Store } from '@mui/icons-material';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { FirestoreShop, ShopFormData } from '../types/firebase';
import AppNavigation from '../components/AppNavigation';
import ImageUpload from '../components/ImageUpload';

// デモ用のカテゴリ（実際の実装では管理者が管理するカテゴリから取得）
const SHOP_CATEGORIES = [
  '伝統工芸',
  '木彫',
  '飲食店',
  'カフェ',
  '雑貨店',
  'ギャラリー',
  'その他'
];

export default function ShopForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [shopData, setShopData] = useState<FirestoreShop | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const { getDocument, addDocument, updateDocument } = useFirestore<FirestoreShop>('shops');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShopFormData>({
    defaultValues: {
      shopName: '',
      description: '',
      maniacPoint: '',
      address: '',
      shopCategory: '',
      location: {
        latitude: 36.5569, // 井波の中心座標
        longitude: 136.9628,
      },
      images: [],
    },
  });

  const isEditMode = !!id;

  // 既存店舗データの取得
  useEffect(() => {
    if (isEditMode && id) {
      loadShopData(id);
    }
  }, [id, isEditMode]);

  const loadShopData = async (shopId: string) => {
    try {
      setLoading(true);
      const shop = await getDocument(shopId);
      
      if (!shop) {
        setError('店舗が見つかりません。');
        return;
      }

      // オーナーチェック
      if (shop.ownerUserId !== currentUser?.uid) {
        setError('この店舗を編集する権限がありません。');
        return;
      }

      setShopData(shop);
      setImageUrls(shop.images || []);
      
      // フォームに既存データを設定
      reset({
        shopName: shop.shopName,
        description: shop.description,
        maniacPoint: shop.maniacPoint,
        address: shop.address,
        shopCategory: shop.shopCategory,
        location: shop.location,
        images: [],
      });
    } catch (error: any) {
      console.error('店舗データ取得エラー:', error);
      setError('店舗データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // フォーム送信
  const onSubmit = async (data: ShopFormData) => {
    if (!currentUser) return;

    try {
      setError('');
      
      const shopPayload = {
        ownerUserId: currentUser.uid,
        shopName: data.shopName,
        description: data.description,
        maniacPoint: data.maniacPoint,
        address: data.address,
        shopCategory: data.shopCategory,
        location: data.location,
        images: imageUrls,
      };

      if (isEditMode && id) {
        // 更新
        await updateDocument(id, shopPayload);
      } else {
        // 新規作成
        await addDocument(shopPayload);
      }

      navigate('/dashboard');
    } catch (error: any) {
      console.error('店舗保存エラー:', error);
      setError('店舗情報の保存に失敗しました。');
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  // 住所から座標を取得（簡易実装、本格的にはGeocoding APIを使用）
  const updateLocationFromAddress = (address: string) => {
    // 井波の範囲内でランダムな座標を生成（デモ用）
    const baseLatitude = 36.5569;
    const baseLongitude = 136.9628;
    const offset = 0.01; // 約1kmの範囲

    const latitude = baseLatitude + (Math.random() - 0.5) * offset;
    const longitude = baseLongitude + (Math.random() - 0.5) * offset;

    return { latitude, longitude };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppNavigation />
      
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Store sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4">
                {isEditMode ? '店舗情報編集' : '新規店舗登録'}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* 基本情報 */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    基本情報
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="shopName"
                    control={control}
                    rules={{ 
                      required: '店舗名は必須です',
                      minLength: { value: 2, message: '店舗名は2文字以上で入力してください' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="店舗名"
                        fullWidth
                        error={!!errors.shopName}
                        helperText={errors.shopName?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="shopCategory"
                    control={control}
                    rules={{ required: 'カテゴリは必須です' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.shopCategory}>
                        <InputLabel>カテゴリ</InputLabel>
                        <Select {...field} label="カテゴリ">
                          {SHOP_CATEGORIES.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.shopCategory && (
                          <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                            {errors.shopCategory.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    rules={{ 
                      required: '店舗説明は必須です',
                      minLength: { value: 10, message: '店舗説明は10文字以上で入力してください' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="店舗説明"
                        multiline
                        rows={3}
                        fullWidth
                        error={!!errors.description}
                        helperText={errors.description?.message || '店舗の特色や雰囲気を説明してください'}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="maniacPoint"
                    control={control}
                    rules={{ 
                      required: 'こだわりポイントは必須です',
                      minLength: { value: 10, message: 'こだわりポイントは10文字以上で入力してください' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="こだわりポイント"
                        multiline
                        rows={3}
                        fullWidth
                        error={!!errors.maniacPoint}
                        helperText={errors.maniacPoint?.message || '店舗独自のこだわりや特別な点を教えてください'}
                      />
                    )}
                  />
                </Grid>

                {/* 住所・位置情報 */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    住所・位置情報
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="address"
                    control={control}
                    rules={{ required: '住所は必須です' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="住所"
                        fullWidth
                        error={!!errors.address}
                        helperText={errors.address?.message || '富山県南砺市井波...'}
                        onChange={(e) => {
                          field.onChange(e);
                          // 住所変更時に座標を更新（簡易実装）
                          if (e.target.value) {
                            const location = updateLocationFromAddress(e.target.value);
                            // 実際の実装では control.setValue を使用
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="location.latitude"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="緯度"
                        type="number"
                        fullWidth
                        inputProps={{ step: 0.000001 }}
                        helperText="Googleマップなどから正確な座標を取得してください"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="location.longitude"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="経度"
                        type="number"
                        fullWidth
                        inputProps={{ step: 0.000001 }}
                        helperText="Googleマップなどから正確な座標を取得してください"
                      />
                    )}
                  />
                </Grid>

                {/* 画像アップロード */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    店舗画像
                  </Typography>
                  <ImageUpload
                    path={`shops/${isEditMode ? id : 'temp'}`}
                    initialImages={imageUrls}
                    onImagesChange={setImageUrls}
                    maxImages={5}
                    disabled={isSubmitting}
                  />
                </Grid>

                {/* アクションボタン */}
                <Grid item xs={12} sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      startIcon={<Cancel />}
                    >
                      キャンセル
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                    >
                      {isSubmitting ? '保存中...' : '保存'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}