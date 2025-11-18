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
  Divider,
  InputAdornment,
} from '@mui/material';
import { 
  Save, 
  Cancel, 
  Store, 
  Language, 
  Instagram, 
  Twitter, 
  Facebook, 
  YouTube,
  Phone,
  Email,
  Schedule,
  LocationOn
} from '@mui/icons-material';
import { Timestamp, GeoPoint } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { FirestoreShop, ShopFormData, WeeklyBusinessHours } from '../types/firebase';
import ImageUpload from '../components/ImageUpload';
import BusinessHoursInput from '../components/BusinessHoursInput';
import TemporaryStatusInput from '../components/TemporaryStatusInput';
import ServicesInput from '../components/ServicesInput';
import { toGeoPoint, extractCoordinatesFromGoogleMapsUrl, getInamiCenter } from '../utils/locationUtils';

// デモ用のカテゴリ（実際の実装では管理者が管理するカテゴリから取得）
const SHOP_CATEGORIES = [
  '伝統工芸',
  '木彫',
  '飲食店',
  'カフェ',
  '雑貨店',
  'ギャラリー',
  'お土産',
  '衣料品',
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
  const [extractingCoords, setExtractingCoords] = useState(false);
  const [businessHours, setBusinessHours] = useState<WeeklyBusinessHours>({});
  const [services, setServices] = useState<string[]>([]);
  const [temporaryStatus, setTemporaryStatus] = useState<{
    isTemporaryClosed: boolean;
    isReducedHours: boolean;
    startDate?: Date;
    endDate?: Date;
    message?: string;
    temporaryHours?: WeeklyBusinessHours;
  }>({
    isTemporaryClosed: false,
    isReducedHours: false,
    startDate: undefined,
    endDate: undefined,
    message: '',
    temporaryHours: {},
  });

  const { getDocument, addDocument, updateDocument } = useFirestore<FirestoreShop>('shops');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
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
      googleMapUrl: '',
      website: '',
      onlineStore: '',
      socialMedia: {
        instagram: '',
        twitter: '',
        facebook: '',
        line: '',
        youtube: '',
      },
      phone: '',
      email: '',
      closedDays: '',
      services: [],
    },
  });

  const isEditMode = !!id;

  // 現在のGoogleマップURLを監視
  const currentGoogleMapUrl = watch('googleMapUrl');
  
  // デバッグ: 座標値をリアルタイムで監視
  const watchedLocation = watch('location');
  useEffect(() => {
    console.log('監視中の座標値が変更されました:', watchedLocation);
  }, [watchedLocation]);

  // GoogleマップURLから座標を抽出する関数
  const extractCoordinatesFromUrl = async (url: string) => {
    if (!url) {
      setError('GoogleマップURLを入力してください。');
      return;
    }

    setExtractingCoords(true);
    setError('');

    try {
      // 短縮URL（goo.gl）の場合はCloud Functionで展開
      if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
        try {
          console.log('短縮URL検出、Cloud Functionで展開中...');
          const functions = getFunctions();
          const expandShortUrlFunction = httpsCallable(functions, 'expandShortUrl');
          
          const result = await expandShortUrlFunction({ url });
          const data = result.data as {
            success: boolean;
            expandedUrl?: string;
            coordinates?: { latitude: number; longitude: number };
            error?: string;
          };

          if (data.success && data.coordinates) {
            // 数値ではなく文字列として設定（高精度を保つため）
            setValue('location.latitude' as any, data.coordinates.latitude.toString());
            setValue('location.longitude' as any, data.coordinates.longitude.toString());
            setError('');
            console.log('座標抽出成功（Cloud Function）:', data.coordinates);
            return;
          } else {
            throw new Error(data.error || 'Cloud Functionから座標を取得できませんでした');
          }
        } catch (cloudError) {
          console.error('Cloud Function呼び出しエラー:', cloudError);
          setError('短縮URLの展開に失敗しました。以下の手順で座標を取得してください：\n1. リンクをブラウザで開く\n2. URLバーから完全なURLをコピー\n3. そのURLを貼り付けて再実行');
          return;
        }
      }

      // 通常のURL処理（改善版）
      let lat: number | null = null;
      let lng: number | null = null;

      // まず、!3d...!4d... パターンを探す（最も正確な店舗座標、高精度対応）
      const pinPattern = /!3d(-?\d+\.\d{1,20})!4d(-?\d+\.\d{1,20})/;
      const pinMatch = url.match(pinPattern);

      if (pinMatch) {
        // !3d!4d形式が見つかった場合（店舗のピン位置）
        lat = parseFloat(pinMatch[1]);
        lng = parseFloat(pinMatch[2]);
        console.log('ピンの正確な座標を検出:', { lat, lng });
      } else {
        // !3d!4d形式が見つからない場合は、他のパターンを試す
        
        // パターン1: place座標パターン /place/.../@lat,lng（高精度対応）
        const placePattern = /\/place\/[^\/]+\/@(-?\d+\.\d{1,20}),(-?\d+\.\d{1,20})/;
        const placeMatch = url.match(placePattern);
        
        if (placeMatch) {
          lat = parseFloat(placeMatch[1]);
          lng = parseFloat(placeMatch[2]);
          console.log('place座標を検出:', { lat, lng });
        } else {
          // パターン2: クエリパラメータの座標 ?q=lat,lng（高精度対応）
          const queryPattern = /[?&]q=(-?\d+\.\d{1,20})[,+](-?\d+\.\d{1,20})/;
          const queryMatch = url.match(queryPattern);
          
          if (queryMatch) {
            lat = parseFloat(queryMatch[1]);
            lng = parseFloat(queryMatch[2]);
            console.log('クエリ座標を検出:', { lat, lng });
          } else {
            // パターン3: @座標形式（カメラ位置なので精度は低い、高精度対応）
            const cameraPattern = /@(-?\d+\.\d{1,20}),(-?\d+\.\d{1,20})/;
            const cameraMatch = url.match(cameraPattern);
            
            if (cameraMatch) {
              lat = parseFloat(cameraMatch[1]);
              lng = parseFloat(cameraMatch[2]);
              console.log('カメラ座標を検出（精度注意）:', { lat, lng });
              setError('⚠️ URLから座標を取得しましたが、カメラ位置の可能性があります。より正確な座標を取得するには、下記の「正確な座標の取得方法」をご確認ください。');
            }
          }
        }
      }

      if (lat !== null && lng !== null) {
        // 座標をフォームに設定（文字列として）
        setValue('location.latitude' as any, lat.toString());
        setValue('location.longitude' as any, lng.toString());
        setError('');
        console.log('座標抽出成功:', { lat, lng });
      } else {
        console.log('座標抽出失敗、URL:', url);
        setError('GoogleマップURLから座標を抽出できませんでした。\n\n以下の形式のURLをお試しください：\n• https://www.google.com/maps/@緯度,経度,倍率z\n• https://www.google.com/maps/place/場所名/@緯度,経度,倍率z\n• https://maps.app.goo.gl/短縮コード');
      }
    } catch (err) {
      console.error('座標抽出エラー:', err);
      setError('座標の抽出に失敗しました。');
    } finally {
      setExtractingCoords(false);
    }
  };

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
      setBusinessHours(shop.businessHours || {});
      setServices(shop.services || []);
      
      // 臨時営業変更ステータスを設定
      if (shop.temporaryStatus) {
        setTemporaryStatus({
          isTemporaryClosed: shop.temporaryStatus.isTemporaryClosed || false,
          isReducedHours: shop.temporaryStatus.isReducedHours || false,
          startDate: shop.temporaryStatus.startDate ? new Date(shop.temporaryStatus.startDate.seconds * 1000) : undefined,
          endDate: shop.temporaryStatus.endDate ? new Date(shop.temporaryStatus.endDate.seconds * 1000) : undefined,
          message: shop.temporaryStatus.message || '',
          temporaryHours: shop.temporaryStatus.temporaryHours || {},
        });
      }
      
      // フォームに既存データを設定
      reset({
        shopName: shop.shopName,
        description: shop.description,
        maniacPoint: shop.maniacPoint,
        address: shop.address,
        shopCategory: shop.shopCategory,
        location: shop.location instanceof GeoPoint 
          ? { latitude: shop.location.latitude, longitude: shop.location.longitude }
          : shop.location,
        images: [],
        googleMapUrl: shop.googleMapUrl || '',
        website: shop.website || '',
        onlineStore: shop.onlineStore || '',
        socialMedia: {
          instagram: shop.socialMedia?.instagram || '',
          twitter: shop.socialMedia?.twitter || '',
          facebook: shop.socialMedia?.facebook || '',
          line: shop.socialMedia?.line || '',
          youtube: shop.socialMedia?.youtube || '',
        },
        phone: shop.phone || '',
        email: shop.email || '',
        closedDays: shop.closedDays || '',
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
      
      // デバッグ: フォームデータ全体を確認
      console.log('=== フォーム送信デバッグ ===');
      console.log('フォームデータ全体:', data);
      console.log('座標データ詳細:', {
        latitude: data.location?.latitude,
        longitude: data.location?.longitude,
        type: typeof data.location?.latitude,
        typeL: typeof data.location?.longitude
      });
      
      // 文字列から数値に変換
      const lat = typeof data.location?.latitude === 'string' ? parseFloat(data.location.latitude) : data.location?.latitude;
      const lng = typeof data.location?.longitude === 'string' ? parseFloat(data.location.longitude) : data.location?.longitude;
      console.log('変換後の座標値:', { lat, lng, latType: typeof lat, lngType: typeof lng });
      
      // 変換した値でlocationオブジェクトを作成
      const locationData = (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) 
        ? { latitude: lat, longitude: lng }
        : null;
      console.log('locationDataオブジェクト:', locationData);
      
      // toGeoPoint関数の結果を詳しく確認
      const geoPoint = toGeoPoint(locationData);
      console.log('toGeoPoint結果:', geoPoint);
      
      // デフォルト値との比較
      const defaultCenter = getInamiCenter();
      console.log('デフォルト座標:', defaultCenter);
      
      // 最終的な座標値
      const finalGeoPoint = geoPoint || defaultCenter;
      console.log('最終的なGeoPoint:', finalGeoPoint);
      console.log('========================');
      
      // ペイロード作成前に再度確認
      console.log('ペイロード作成前の finalGeoPoint:', finalGeoPoint);
      
      const shopPayload = {
        ownerUserId: currentUser.uid,
        shopName: data.shopName,
        description: data.description,
        maniacPoint: data.maniacPoint,
        address: data.address,
        shopCategory: data.shopCategory,
        location: finalGeoPoint,
        images: imageUrls,
        googleMapUrl: data.googleMapUrl,
        website: data.website,
        onlineStore: data.onlineStore,
        socialMedia: data.socialMedia,
        phone: data.phone,
        email: data.email,
        closedDays: data.closedDays,
        businessHours: businessHours,
        services: services,
        ...(temporaryStatus.isTemporaryClosed || temporaryStatus.isReducedHours ? {
          temporaryStatus: {
            isTemporaryClosed: temporaryStatus.isTemporaryClosed,
            isReducedHours: temporaryStatus.isReducedHours,
            ...(temporaryStatus.startDate && { startDate: Timestamp.fromDate(temporaryStatus.startDate) }),
            ...(temporaryStatus.endDate && { endDate: Timestamp.fromDate(temporaryStatus.endDate) }),
            ...(temporaryStatus.message && { message: temporaryStatus.message }),
            ...(temporaryStatus.temporaryHours && { temporaryHours: temporaryStatus.temporaryHours }),
          }
        } : {}),
        // 新規店舗は承認待ち、更新時は既存のステータスを保持
        ...((!isEditMode) && { approvalStatus: 'pending' as const }),
      };

      // 保存前の最終確認
      console.log('保存直前のshopPayload:', shopPayload);
      console.log('保存直前のlocation:', shopPayload.location);
      
      if (isEditMode && id) {
        // 更新
        console.log('更新処理を実行:', id);
        await updateDocument(id, shopPayload);
      } else {
        // 新規作成
        console.log('新規作成処理を実行');
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
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="location.latitude"
                    control={control}
                    rules={{
                      validate: (value) => {
                        if (!value && value !== 0) return '緯度は必須です';
                        const num = typeof value === 'string' ? parseFloat(value) : value;
                        if (isNaN(num)) return '有効な数値を入力してください';
                        if (num < -90 || num > 90) return '緯度は-90から90の範囲で入力してください';
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="緯度"
                        fullWidth
                        error={!!errors.location?.latitude}
                        helperText={errors.location?.latitude?.message || "Googleマップリンクから自動取得、または直接入力できます"}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // 文字列のまま保存し、送信時に数値に変換
                          console.log('緯度入力変更 (文字列):', { value, length: value.length });
                          field.onChange(value);
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="location.longitude"
                    control={control}
                    rules={{
                      validate: (value) => {
                        if (!value && value !== 0) return '経度は必須です';
                        const num = typeof value === 'string' ? parseFloat(value) : value;
                        if (isNaN(num)) return '有効な数値を入力してください';
                        if (num < -180 || num > 180) return '経度は-180から180の範囲で入力してください';
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="経度"
                        fullWidth
                        error={!!errors.location?.longitude}
                        helperText={errors.location?.longitude?.message || "Googleマップリンクから自動取得、または直接入力できます"}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // 文字列のまま保存し、送信時に数値に変換
                          console.log('経度入力変更 (文字列):', { value, length: value.length });
                          field.onChange(value);
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* オンライン情報 */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    オンライン情報
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="googleMapUrl"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Googleマップリンク または 座標"
                        fullWidth
                        placeholder="https://maps.google.com/... または 35.681234, 139.767123"
                        helperText="GoogleマップのURL、または「緯度, 経度」の形式で直接入力できます"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Language color="action" />
                            </InputAdornment>
                          ),
                        }}
                        onChange={(e) => {
                          field.onChange(e);
                          const value = e.target.value;
                          // 座標の直接入力を検出（例: 35.681234, 139.767123）高精度対応
                          const coordPattern = /^\s*(-?\d+\.\d{1,20})\s*,\s*(-?\d+\.\d{1,20})\s*$/;
                          const coordMatch = value.match(coordPattern);
                          if (coordMatch) {
                            const lat = coordMatch[1];
                            const lng = coordMatch[2];
                            // 文字列として設定
                            setValue('location.latitude' as any, lat);
                            setValue('location.longitude' as any, lng);
                            setError('');
                            console.log('座標を直接入力:', { lat, lng });
                            // フォームの現在の値を確認
                            console.log('現在のフォーム座標値:', watch('location'));
                          }
                        }}
                      />
                    )}
                  />
                  {currentGoogleMapUrl && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={() => extractCoordinatesFromUrl(currentGoogleMapUrl)}
                        disabled={extractingCoords}
                        startIcon={extractingCoords ? <CircularProgress size={20} /> : <LocationOn />}
                        size="small"
                      >
                        {extractingCoords ? '座標を抽出中...' : 'URLから座標を自動取得'}
                      </Button>
                    </Box>
                  )}
                  
                  {/* GoogleマップURL使用方法チュートリアル */}
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom color="info.dark">
                      正確な座標の取得方法
                    </Typography>
                    
                    <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                      <Typography variant="subtitle1" gutterBottom color="warning.dark">
                        ⚠️ 重要：正確な座標を取得するコツ
                      </Typography>
                      <Typography variant="body2" component="div" color="text.secondary">
                        GoogleマップのURLには「カメラ位置」と「ピン位置」の2つの座標が含まれることがあります。<br />
                        店舗の正確な位置を取得するには、以下の方法をお勧めします。
                      </Typography>
                    </Box>

                    <Typography variant="subtitle1" gutterBottom>
                      <strong>方法1：PCで右クリック（最も確実）</strong>
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mb: 2 }}>
                      1. GoogleマップでURLを開きます<br />
                      2. <strong>赤いピンの先端を正確に右クリック</strong>します<br />
                      3. メニュー最上部の座標（例：35.681234, 139.767123）をクリック<br />
                      4. 座標がコピーされるので、下の緯度・経度欄に貼り付けます
                    </Typography>

                    <Typography variant="subtitle1" gutterBottom>
                      <strong>方法2：スマートフォンでロングタップ</strong>
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mb: 2 }}>
                      1. GoogleマップアプリでURLを開きます<br />
                      2. 地図を拡大し、<strong>赤いピンを長押し（ロングタップ）</strong>します<br />
                      3. 画面上部に表示される座標をタップしてコピー<br />
                      4. 座標を下の緯度・経度欄に貼り付けます
                    </Typography>

                    <Typography variant="subtitle1" gutterBottom>
                      <strong>方法3：URLから自動取得</strong>
                    </Typography>
                    <Typography variant="body2" component="div">
                      1. <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>を開きます<br />
                      2. 店舗を検索して「共有」→「リンクをコピー」<br />
                      3. URLを上記フィールドに貼り付け<br />
                      4. 「座標を自動取得」ボタンをクリック<br />
                      <small>※ URLによってはカメラ位置が取得される場合があります</small>
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                      💡 ヒント：座標は「緯度, 経度」の形式で直接入力することもできます。<br />
                      例：35.681234, 139.767123 のように入力してください。
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="website"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="公式ウェブサイト"
                        fullWidth
                        placeholder="https://..."
                        helperText="店舗の公式ホームページURL"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Language color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="onlineStore"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="オンラインストア"
                        fullWidth
                        placeholder="https://..."
                        helperText="ECサイトや通販サイトのURL"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Language color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* SNSアカウント */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    SNSアカウント
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="socialMedia.instagram"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Instagram"
                        fullWidth
                        placeholder="@アカウント名 または URL"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Instagram color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="socialMedia.twitter"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="X (旧Twitter)"
                        fullWidth
                        placeholder="@アカウント名 または URL"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Twitter color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="socialMedia.facebook"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Facebook"
                        fullWidth
                        placeholder="ページURL"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Facebook color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="socialMedia.youtube"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="YouTube"
                        fullWidth
                        placeholder="チャンネルURL"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <YouTube color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="socialMedia.line"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="LINE公式アカウント"
                        fullWidth
                        placeholder="LINE ID または URL"
                        helperText="LINE公式アカウントのIDまたはURL"
                      />
                    )}
                  />
                </Grid>

                {/* 連絡先情報 */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    連絡先情報
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="電話番号"
                        fullWidth
                        placeholder="0763-XX-XXXX"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="メールアドレス"
                        fullWidth
                        type="email"
                        placeholder="info@example.com"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="closedDays"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="定休日・営業時間（簡易入力）"
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="例：毎週水曜日、年末年始休業 / 営業時間：9:00-18:00"
                        helperText="簡易的な営業時間情報（下の詳細設定も利用可能）"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Schedule color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* 提供サービス設定 */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    提供サービス・設備
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <ServicesInput
                    value={services}
                    onChange={setServices}
                    disabled={isSubmitting}
                  />
                </Grid>

                {/* 詳細営業時間設定 */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    営業時間・定休日
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <BusinessHoursInput
                    value={businessHours}
                    onChange={setBusinessHours}
                    disabled={isSubmitting}
                  />
                </Grid>

                {/* 臨時営業変更設定 */}
                <Grid item xs={12}>
                  <TemporaryStatusInput
                    value={temporaryStatus}
                    onChange={setTemporaryStatus}
                    disabled={isSubmitting}
                  />
                </Grid>

                {/* 画像アップロード */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
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
  );
}