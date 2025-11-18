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
  Chip,
  FormHelperText,
  Divider,
  InputAdornment,
} from '@mui/material';
import { Save, Cancel, Event, Schedule, LocationOn } from '@mui/icons-material';
import { Timestamp, GeoPoint } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { 
  FirestoreEvent, 
  EventFormData, 
  FirestoreShop,
  EVENT_PROGRESS_LABELS,
  APPROVAL_STATUS_LABELS,
  EVENT_CATEGORIES
} from '../types/firebase';
import { EVENT_PROGRESS_STATUS, EVENT_APPROVAL_STATUS } from '../../../shared/constants';
import ImageUpload from '../components/ImageUpload';
import { toGeoPoint, fromGeoPoint, getInamiCenter } from '../utils/locationUtils';

export default function EventForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [eventData, setEventData] = useState<FirestoreEvent | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [userShops, setUserShops] = useState<FirestoreShop[]>([]);
  const [allShops, setAllShops] = useState<FirestoreShop[]>([]);

  const { getDocument, addDocument, updateDocument } = useFirestore<FirestoreEvent>('events');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData & { eventProgress?: string }>({
    defaultValues: {
      eventName: '',
      description: '',
      eventCategory: '',
      eventTimeStart: new Date(),
      eventTimeEnd: new Date(),
      location: '',
      shopId: '',
      participatingShops: [],
      images: [],
      detailUrl: '',
      eventProgress: EVENT_PROGRESS_STATUS.SCHEDULED,
    },
  });

  const isEditMode = !!id;
  const canEditProgress = isEditMode && eventData?.ownerUserId === currentUser?.uid;
  const isAdmin = userData?.role === 'admin';


  // 店舗データの取得
  useEffect(() => {
    fetchShops();
  }, [currentUser]);

  // 既存イベントデータの取得
  useEffect(() => {
    if (isEditMode && id) {
      loadEventData(id);
    }
  }, [id, isEditMode]);

  const fetchShops = async () => {
    if (!currentUser) return;

    try {
      // 自分の店舗を取得
      const userShopsQuery = query(
        collection(db, 'shops'),
        where('ownerUserId', '==', currentUser.uid)
      );
      const userShopsSnapshot = await getDocs(userShopsQuery);
      const userShopsData = userShopsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreShop[];
      setUserShops(userShopsData);

      // 管理者の場合は全店舗を取得（参加店舗選択用）
      if (userData?.role === 'admin') {
        const allShopsSnapshot = await getDocs(collection(db, 'shops'));
        const allShopsData = allShopsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirestoreShop[];
        setAllShops(allShopsData);
      } else {
        setAllShops(userShopsData);
      }
    } catch (error) {
      console.error('店舗取得エラー:', error);
    }
  };

  const loadEventData = async (eventId: string) => {
    try {
      setLoading(true);
      const event = await getDocument(eventId);
      
      if (!event) {
        setError('イベントが見つかりません。');
        return;
      }

      // オーナーまたは管理者のみ編集可能
      if (event.ownerUserId !== currentUser?.uid && userData?.role !== 'admin') {
        setError('このイベントを編集する権限がありません。');
        return;
      }

      setEventData(event);
      setImageUrls(event.images || []);
      
      // フォームに既存データを設定
      reset({
        eventName: event.eventName,
        description: event.description,
        eventCategory: event.eventCategory || '',
        eventTimeStart: event.eventTimeStart.toDate(),
        eventTimeEnd: event.eventTimeEnd.toDate(),
        location: event.location,
        shopId: event.shopId || '',
        participatingShops: event.participatingShops || [],
        images: [],
        detailUrl: event.detailUrl || '',
        eventProgress: event.eventProgress,
      });
    } catch (error: any) {
      console.error('イベントデータ取得エラー:', error);
      setError('イベントデータの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // フォーム送信
  const onSubmit = async (data: EventFormData & { eventProgress?: string }) => {
    if (!currentUser) return;

    try {
      setError('');
      
      // 開始時刻と終了時刻の整合性チェック
      if (data.eventTimeStart >= data.eventTimeEnd) {
        setError('終了時刻は開始時刻より後に設定してください。');
        return;
      }

      const basePayload = {
        ownerUserId: currentUser.uid,
        shopId: data.shopId || undefined,
        eventName: data.eventName,
        description: data.description,
        eventCategory: data.eventCategory,
        eventTimeStart: Timestamp.fromDate(data.eventTimeStart),
        eventTimeEnd: Timestamp.fromDate(data.eventTimeEnd),
        location: data.location,
        participatingShops: data.participatingShops || [],
        images: imageUrls,
        detailUrl: data.detailUrl || undefined,
        eventProgress: (isEditMode ? data.eventProgress : EVENT_PROGRESS_STATUS.SCHEDULED) as 'scheduled' | 'cancelled' | 'ongoing' | 'finished',
        approvalStatus: EVENT_APPROVAL_STATUS.PENDING as 'pending' | 'approved' | 'rejected'
      };

      const eventPayload = basePayload;

      if (isEditMode && id) {
        await updateDocument(id, eventPayload);
      } else {
        await addDocument(eventPayload);
      }

      navigate('/events');
    } catch (error: any) {
      console.error('イベント保存エラー:', error);
      setError('イベント情報の保存に失敗しました。');
    }
  };

  const handleCancel = () => {
    navigate('/events');
  };

  // 日時のフォーマット
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const parseDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString);
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
              <Event sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4">
                {isEditMode ? 'イベント編集' : '新規イベント登録'}
              </Typography>
            </Box>

            {/* 承認ステータス表示（編集時） */}
            {isEditMode && eventData && (
              <Box sx={{ mb: 3 }}>
                <Chip 
                  label={APPROVAL_STATUS_LABELS[eventData.approvalStatus]}
                  color={eventData.approvalStatus === 'approved' ? 'success' : 
                         eventData.approvalStatus === 'rejected' ? 'error' : 'warning'}
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={EVENT_PROGRESS_LABELS[eventData.eventProgress]}
                  color={eventData.eventProgress === 'ongoing' ? 'success' : 
                         eventData.eventProgress === 'finished' ? 'default' :
                         eventData.eventProgress === 'cancelled' ? 'error' : 'primary'}
                />
                {eventData.approvalStatus === 'pending' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    このイベントは管理者による承認待ちです。承認されるまでアプリには表示されません。
                  </Alert>
                )}
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {userShops.length === 0 && !isAdmin && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                イベントを登録するには、まず店舗情報を登録してください。
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

                <Grid item xs={12}>
                  <Controller
                    name="eventName"
                    control={control}
                    rules={{ 
                      required: 'イベント名は必須です',
                      minLength: { value: 2, message: 'イベント名は2文字以上で入力してください' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="イベント名"
                        fullWidth
                        error={!!errors.eventName}
                        helperText={errors.eventName?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="eventCategory"
                    control={control}
                    rules={{ required: 'イベントカテゴリは必須です' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.eventCategory}>
                        <InputLabel>イベントカテゴリ</InputLabel>
                        <Select {...field} label="イベントカテゴリ">
                          {EVENT_CATEGORIES.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.eventCategory && (
                          <FormHelperText>{errors.eventCategory.message}</FormHelperText>
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
                      required: 'イベント説明は必須です',
                      minLength: { value: 10, message: 'イベント説明は10文字以上で入力してください' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="イベント説明"
                        multiline
                        rows={4}
                        fullWidth
                        error={!!errors.description}
                        helperText={errors.description?.message || 'イベントの内容、魅力、参加方法などを詳しく説明してください'}
                      />
                    )}
                  />
                </Grid>

                {/* 日時設定 */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                    開催日時
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="eventTimeStart"
                    control={control}
                    rules={{ required: '開始日時は必須です' }}
                    render={({ field }) => (
                      <TextField
                        label="開始日時"
                        type="datetime-local"
                        fullWidth
                        value={formatDateTimeLocal(field.value)}
                        onChange={(e) => field.onChange(parseDateTime(e.target.value))}
                        error={!!errors.eventTimeStart}
                        helperText={errors.eventTimeStart?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="eventTimeEnd"
                    control={control}
                    rules={{ required: '終了日時は必須です' }}
                    render={({ field }) => (
                      <TextField
                        label="終了日時"
                        type="datetime-local"
                        fullWidth
                        value={formatDateTimeLocal(field.value)}
                        onChange={(e) => field.onChange(parseDateTime(e.target.value))}
                        error={!!errors.eventTimeEnd}
                        helperText={errors.eventTimeEnd?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                {/* 場所・位置情報 */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                    開催場所・位置情報
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="location"
                    control={control}
                    rules={{ required: '開催場所は必須です' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="開催場所"
                        fullWidth
                        error={!!errors.location}
                        helperText={errors.location?.message || '具体的な住所や施設名を入力してください'}
                      />
                    )}
                  />
                </Grid>


                <Grid item xs={12}>
                  <Alert severity="info" icon={<LocationOn />}>
                    <Typography variant="subtitle1" gutterBottom>
                      イベントの開催場所について
                    </Typography>
                    <Typography variant="body2">
                      イベントの開催場所は、以下の方法で設定されます：
                    </Typography>
                    <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                      <Typography component="li" variant="body2">
                        主催店舗を選択した場合：その店舗の登録位置が自動的に使用されます
                      </Typography>
                      <Typography component="li" variant="body2">
                        参加店舗を選択した場合：各店舗の位置が地図上に表示されます
                      </Typography>
                      <Typography component="li" variant="body2">
                        店舗と関連付けない場合：井波地区の中心位置が使用されます
                      </Typography>
                    </Box>
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="detailUrl"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="イベント詳細URL（任意）"
                        fullWidth
                        placeholder="https://example.com/event-details"
                        error={!!errors.detailUrl}
                        helperText={errors.detailUrl?.message || 'イベントの詳細情報や申し込みページのURLを入力してください'}
                      />
                    )}
                  />
                </Grid>

                {/* 店舗関連設定 */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    関連店舗
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="shopId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>主催店舗（任意）</InputLabel>
                        <Select {...field} label="主催店舗（任意）">
                          <MenuItem value="">店舗に関連付けない</MenuItem>
                          {userShops.map((shop) => (
                            <MenuItem key={shop.id} value={shop.id}>
                              {shop.shopName}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>イベントを主催する店舗を選択（任意）</FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="participatingShops"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>参加店舗（任意）</InputLabel>
                        <Select
                          {...field}
                          multiple
                          label="参加店舗（任意）"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((value) => {
                                const shop = allShops.find(s => s.id === value);
                                return (
                                  <Chip key={value} label={shop?.shopName || value} size="small" />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {allShops.map((shop) => (
                            <MenuItem key={shop.id} value={shop.id}>
                              {shop.shopName}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>イベントに参加する店舗を選択（複数選択可能）</FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* 進行状況（編集時のみ、オーナーのみ） */}
                {canEditProgress && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        進行状況管理
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="eventProgress"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>進行状況</InputLabel>
                            <Select {...field} label="進行状況">
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
                            <FormHelperText>イベントの現在の状況を設定してください</FormHelperText>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </>
                )}

                {/* 画像アップロード */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    イベント画像
                  </Typography>
                  <ImageUpload
                    path={`events/${isEditMode ? id : 'temp'}`}
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
                      disabled={isSubmitting || (userShops.length === 0 && !isAdmin)}
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