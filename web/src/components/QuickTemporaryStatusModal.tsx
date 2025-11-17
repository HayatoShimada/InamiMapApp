import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Typography,
  FormControlLabel,
  Checkbox,
  Grid,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Schedule } from '@mui/icons-material';
import { Timestamp } from 'firebase/firestore';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ja';

interface QuickTemporaryStatusData {
  isTemporaryClosed: boolean;
  isReducedHours: boolean;
  startDate?: Date;
  endDate?: Date;
  message?: string;
}

interface QuickTemporaryStatusModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: QuickTemporaryStatusData) => Promise<void>;
  shopName: string;
  currentStatus?: {
    isTemporaryClosed: boolean;
    isReducedHours: boolean;
    startDate?: Timestamp;
    endDate?: Timestamp;
    message?: string;
  };
}

export default function QuickTemporaryStatusModal({ 
  open, 
  onClose, 
  onSave, 
  shopName, 
  currentStatus 
}: QuickTemporaryStatusModalProps) {
  // dayjsのロケールを日本語に設定
  dayjs.locale('ja');

  const [loading, setLoading] = useState(false);
  const [isTemporaryClosed, setIsTemporaryClosed] = useState(currentStatus?.isTemporaryClosed || false);
  const [isReducedHours, setIsReducedHours] = useState(currentStatus?.isReducedHours || false);
  const [startDate, setStartDate] = useState<Dayjs | null>(
    currentStatus?.startDate ? 
    dayjs(currentStatus.startDate.seconds * 1000) : 
    dayjs()
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    currentStatus?.endDate ? 
    dayjs(currentStatus.endDate.seconds * 1000) : 
    null
  );
  const [message, setMessage] = useState(currentStatus?.message || '');

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const data: QuickTemporaryStatusData = {
        isTemporaryClosed,
        isReducedHours,
        startDate: startDate ? startDate.toDate() : undefined,
        endDate: endDate ? endDate.toDate() : undefined,
        message: message.trim() || undefined,
      };

      await onSave(data);
      onClose();
    } catch (error) {
      console.error('保存エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const isActive = isTemporaryClosed || isReducedHours;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Schedule color="primary" />
          <Typography variant="h6">
            時短営業・臨時休業設定
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {shopName}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            お客様への案内として、簡単に時短営業や臨時休業を設定できます
          </Alert>

          <Grid container spacing={3}>
            {/* 営業状態設定 */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                営業状態
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isTemporaryClosed}
                    onChange={(e) => {
                      setIsTemporaryClosed(e.target.checked);
                      if (e.target.checked) {
                        setIsReducedHours(false);
                      }
                    }}
                    disabled={loading}
                  />
                }
                label="臨時休業中"
                sx={{ display: 'block', mb: 1 }}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isReducedHours}
                    onChange={(e) => {
                      setIsReducedHours(e.target.checked);
                      if (e.target.checked) {
                        setIsTemporaryClosed(false);
                      }
                    }}
                    disabled={loading}
                  />
                }
                label="時短営業中"
                sx={{ display: 'block' }}
              />
            </Grid>

            {/* 期間設定 */}
            {isActive && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    実施期間
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="開始日"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    disabled={loading}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: '変更開始日を選択してください',
                        required: true,
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="終了日（任意）"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    disabled={loading}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: '空白の場合は無期限',
                      }
                    }}
                    minDate={startDate || undefined}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="顧客向けメッセージ"
                    fullWidth
                    multiline
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="例：コロナ感染対策のため、当面の間時短営業とさせていただきます"
                    helperText="お客様に表示される説明文（任意）"
                    disabled={loading}
                  />
                </Grid>

                {/* プレビュー */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    顧客への表示プレビュー
                  </Typography>
                  <Alert 
                    severity={isTemporaryClosed ? "error" : "warning"}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {isTemporaryClosed ? '🚫 臨時休業中' : '⏰ 時短営業中'}
                    </Typography>
                    {startDate && (
                      <Typography variant="body2">
                        期間: {startDate.format('YYYY年MM月DD日')} 
                        {endDate ? ` 〜 ${endDate.format('YYYY年MM月DD日')}` : ' 〜 未定'}
                      </Typography>
                    )}
                    {message && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {message}
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={loading}
        >
          キャンセル
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}