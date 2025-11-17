import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  Alert,
  Divider,
  Collapse,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Warning, Schedule, Info, ExpandMore, ExpandLess } from '@mui/icons-material';
import { WeeklyBusinessHours } from '../types/firebase';
import BusinessHoursInput from './BusinessHoursInput';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ja';

interface TemporaryStatus {
  isTemporaryClosed: boolean;
  isReducedHours: boolean;
  startDate?: Date;
  endDate?: Date;
  message?: string;
  temporaryHours?: WeeklyBusinessHours;
}

interface TemporaryStatusInputProps {
  value: TemporaryStatus;
  onChange: (temporaryStatus: TemporaryStatus) => void;
  disabled?: boolean;
}

export default function TemporaryStatusInput({ value, onChange, disabled = false }: TemporaryStatusInputProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // dayjsのロケールを日本語に設定
  dayjs.locale('ja');

  const handleDateChange = (field: 'startDate' | 'endDate', newValue: Dayjs | null) => {
    const date = newValue ? newValue.toDate() : undefined;
    onChange({
      ...value,
      [field]: date,
    });
  };

  const isTemporaryActive = value.isTemporaryClosed || value.isReducedHours;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
      <Paper elevation={1} sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Warning sx={{ mr: 1, color: 'warning.main' }} />
        <Typography variant="h6">
          臨時営業変更
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            臨時休業や時短営業などの一時的な営業変更をお客様に案内できます
          </Alert>
        </Grid>

        {/* 臨時休業設定 */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={value.isTemporaryClosed}
                onChange={(e) => {
                  onChange({
                    ...value,
                    isTemporaryClosed: e.target.checked,
                    isReducedHours: e.target.checked ? false : value.isReducedHours,
                  });
                }}
                disabled={disabled}
              />
            }
            label={
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  臨時休業中
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  店舗が一時的に休業していることを表示
                </Typography>
              </Box>
            }
          />
        </Grid>

        {/* 時短営業設定 */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={value.isReducedHours}
                onChange={(e) => {
                  onChange({
                    ...value,
                    isReducedHours: e.target.checked,
                    isTemporaryClosed: e.target.checked ? false : value.isTemporaryClosed,
                  });
                }}
                disabled={disabled}
              />
            }
            label={
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  時短営業中
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  通常と異なる営業時間での営業
                </Typography>
              </Box>
            }
          />
        </Grid>

        {/* 期間設定 */}
        {isTemporaryActive && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                実施期間
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="開始日"
                value={value.startDate ? dayjs(value.startDate) : null}
                onChange={(newValue) => handleDateChange('startDate', newValue)}
                disabled={disabled}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: '変更開始日を設定してください',
                    required: true,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="終了日（任意）"
                value={value.endDate ? dayjs(value.endDate) : null}
                onChange={(newValue) => handleDateChange('endDate', newValue)}
                disabled={disabled}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: '空白の場合は無期限',
                  }
                }}
                minDate={value.startDate ? dayjs(value.startDate) : undefined}
              />
            </Grid>

            {/* 顧客向けメッセージ */}
            <Grid item xs={12}>
              <TextField
                label="顧客向けメッセージ"
                fullWidth
                multiline
                rows={3}
                value={value.message || ''}
                onChange={(e) => {
                  onChange({
                    ...value,
                    message: e.target.value,
                  });
                }}
                placeholder="例：コロナ感染対策のため、当面の間時短営業とさせていただきます"
                helperText="お客様に表示される説明文（任意）"
                disabled={disabled}
              />
            </Grid>

            {/* 時短営業時の詳細時間設定 */}
            {value.isReducedHours && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    endIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
                    disabled={disabled}
                  >
                    時短営業時間の詳細設定
                  </Button>
                </Box>

                <Collapse in={showAdvanced}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    時短営業中の営業時間を設定してください。設定しない場合は通常営業時間が表示されます。
                  </Alert>
                  <BusinessHoursInput
                    value={value.temporaryHours || {}}
                    onChange={(temporaryHours) => {
                      onChange({
                        ...value,
                        temporaryHours,
                      });
                    }}
                    disabled={disabled}
                  />
                </Collapse>
              </Grid>
            )}
          </>
        )}

        {/* プレビュー */}
        {isTemporaryActive && (
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              顧客への表示プレビュー
            </Typography>
            <Alert 
              severity={value.isTemporaryClosed ? "error" : "warning"}
              sx={{ mb: 2 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {value.isTemporaryClosed ? '🚫 臨時休業中' : '⏰ 時短営業中'}
              </Typography>
              {value.startDate && (
                <Typography variant="body2">
                  期間: {dayjs(value.startDate).format('YYYY年MM月DD日')} 
                  {value.endDate ? ` 〜 ${dayjs(value.endDate).format('YYYY年MM月DD日')}` : ' 〜 未定'}
                </Typography>
              )}
              {value.message && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {value.message}
                </Typography>
              )}
            </Alert>
          </Grid>
        )}
      </Grid>
      </Paper>
    </LocalizationProvider>
  );
}