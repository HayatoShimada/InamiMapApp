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
  Business, 
  Language, 
  Phone,
  Schedule,
  LocationOn,
  Info
} from '@mui/icons-material';
import { Timestamp, GeoPoint } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { 
  FirestorePublicFacility, 
  PublicFacilityFormData,
  PUBLIC_FACILITY_TYPES
} from '../types/firebase';
import ImageUpload from '../components/ImageUpload';
import { toGeoPoint, fromGeoPoint, getInamiCenter } from '../utils/locationUtils';

export default function PublicFacilityForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [facilityData, setFacilityData] = useState<FirestorePublicFacility | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const { getDocument, addDocument, updateDocument } = useFirestore<FirestorePublicFacility>('publicFacilities');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PublicFacilityFormData>({
    defaultValues: {
      name: '',
      description: '',
      facilityType: '',
      location: {
        latitude: 36.5569, // 井波の中心座標
        longitude: 136.9628,
      },
      address: '',
      images: [],
      website: '',
      phone: '',
      openingHours: '',
      accessInfo: '',
    },
  });

  const isEditMode = !!id;

  // 管理者権限チェック
  if (userData?.role !== 'admin') {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">
          公共施設の管理は管理者のみが行えます。
        </Alert>
      </Container>
    );
  }

  // 既存公共施設データの取得
  useEffect(() => {
    if (isEditMode && id) {
      loadFacilityData(id);
    }
  }, [id, isEditMode]);

  const loadFacilityData = async (facilityId: string) => {
    try {
      setLoading(true);
      const facility = await getDocument(facilityId);
      
      if (!facility) {
        setError('公共施設が見つかりません。');
        return;
      }

      setFacilityData(facility);
      setImageUrls(facility.images || []);
      
      // フォームに既存データを設定
      const locationObj = fromGeoPoint(facility.location);
      reset({
        name: facility.name,
        description: facility.description,
        facilityType: facility.facilityType,
        location: locationObj || {
          latitude: 36.5569, // 井波の中心座標
          longitude: 136.9628,
        },
        address: facility.address,
        images: [],
        website: facility.website || '',
        phone: facility.phone || '',
        openingHours: facility.openingHours || '',
        accessInfo: facility.accessInfo || '',
      });
    } catch (error: any) {
      console.error('公共施設データ取得エラー:', error);
      setError('公共施設データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // フォーム送信
  const onSubmit = async (data: PublicFacilityFormData) => {
    if (!currentUser) return;

    try {
      setError('');
      
      // Convert location to GeoPoint
      const geoPoint = toGeoPoint(data.location);
      if (!geoPoint) {
        setError('有効な位置情報を入力してください。');
        return;
      }

      const facilityPayload = {
        name: data.name,
        description: data.description,
        facilityType: data.facilityType,
        location: geoPoint,
        address: data.address,
        images: imageUrls,
        website: data.website,
        phone: data.phone,
        openingHours: data.openingHours,
        accessInfo: data.accessInfo,
        adminId: currentUser.uid,
        isActive: true,
      };

      if (isEditMode && id) {
        // 更新
        await updateDocument(id, facilityPayload);
      } else {
        // 新規作成
        await addDocument(facilityPayload);
      }

      navigate('/admin');
    } catch (error: any) {
      console.error('公共施設保存エラー:', error);
      setError('公共施設情報の保存に失敗しました。');
    }
  };

  const handleCancel = () => {
    navigate('/admin');
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
              <Business sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4">
                {isEditMode ? '公共施設編集' : '公共施設登録'}
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
                    name="name"
                    control={control}
                    rules={{ 
                      required: '施設名は必須です',
                      minLength: { value: 2, message: '施設名は2文字以上で入力してください' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="施設名"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="facilityType"
                    control={control}
                    rules={{ required: '施設タイプは必須です' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.facilityType}>
                        <InputLabel>施設タイプ</InputLabel>
                        <Select {...field} label="施設タイプ">
                          {PUBLIC_FACILITY_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.facilityType && (
                          <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                            {errors.facilityType.message}
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
                      required: '施設説明は必須です',
                      minLength: { value: 10, message: '施設説明は10文字以上で入力してください' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="施設説明"
                        multiline
                        rows={3}
                        fullWidth
                        error={!!errors.description}
                        helperText={errors.description?.message || '施設の特徴や提供サービスを説明してください'}
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
                        helperText="GPS座標の緯度"
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
                        helperText="GPS座標の経度"
                      />
                    )}
                  />
                </Grid>

                {/* 連絡先・営業情報 */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    連絡先・営業情報
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
                    name="website"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="ウェブサイト"
                        fullWidth
                        placeholder="https://..."
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

                <Grid item xs={12}>
                  <Controller
                    name="openingHours"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="開館時間・営業時間"
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="例：月〜金 9:00-17:00、土日祝休み"
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

                <Grid item xs={12}>
                  <Controller
                    name="accessInfo"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="アクセス情報"
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="例：JR城端線井波駅から徒歩10分、駐車場20台"
                        helperText="公共交通機関や駐車場の情報など"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Info color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* 画像アップロード */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    施設画像
                  </Typography>
                  <ImageUpload
                    path={`publicFacilities/${isEditMode ? id : 'temp'}`}
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