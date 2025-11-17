import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import { Schedule } from '@mui/icons-material';
import { BusinessHours, WeeklyBusinessHours, WEEKDAYS } from '../types/firebase';

interface BusinessHoursInputProps {
  value: WeeklyBusinessHours;
  onChange: (businessHours: WeeklyBusinessHours) => void;
  disabled?: boolean;
}

export default function BusinessHoursInput({ value, onChange, disabled = false }: BusinessHoursInputProps) {
  const handleDayChange = (day: keyof WeeklyBusinessHours, hours: BusinessHours | undefined) => {
    onChange({
      ...value,
      [day]: hours,
    });
  };

  const formatTime = (time: string) => {
    // "09:00" 形式を確保
    if (!time) return '';
    const [hour, minute] = time.split(':');
    return `${hour.padStart(2, '0')}:${(minute || '00').padStart(2, '0')}`;
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Schedule sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          営業時間設定
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {Object.entries(WEEKDAYS).map(([dayKey, dayLabel]) => {
          const dayHours = value[dayKey as keyof WeeklyBusinessHours];
          const isClosed = dayHours?.closed ?? false;

          return (
            <Grid item xs={12} key={dayKey}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={2}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {dayLabel}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isClosed}
                          onChange={(e) => {
                            const newHours = e.target.checked
                              ? { open: '', close: '', closed: true }
                              : { open: '09:00', close: '17:00', closed: false };
                            handleDayChange(dayKey as keyof WeeklyBusinessHours, newHours);
                          }}
                          disabled={disabled}
                        />
                      }
                      label="定休日"
                    />
                  </Grid>

                  {!isClosed && (
                    <>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="開店時間"
                          type="time"
                          value={dayHours?.open || '09:00'}
                          onChange={(e) => {
                            const newHours = {
                              ...dayHours,
                              open: formatTime(e.target.value),
                              close: dayHours?.close || '17:00',
                              closed: false,
                            };
                            handleDayChange(dayKey as keyof WeeklyBusinessHours, newHours);
                          }}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 300 }} // 5分刻み
                          size="small"
                          disabled={disabled}
                          fullWidth
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="閉店時間"
                          type="time"
                          value={dayHours?.close || '17:00'}
                          onChange={(e) => {
                            const newHours = {
                              ...dayHours,
                              open: dayHours?.open || '09:00',
                              close: formatTime(e.target.value),
                              closed: false,
                            };
                            handleDayChange(dayKey as keyof WeeklyBusinessHours, newHours);
                          }}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 300 }} // 5分刻み
                          size="small"
                          disabled={disabled}
                          fullWidth
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={1}>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                          {dayHours?.open && dayHours?.close && 
                            `${dayHours.open}-${dayHours.close}`}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  {isClosed && (
                    <Grid item xs={12} sm={7}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        定休日
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="info.dark">
          <strong>営業時間設定のヒント:</strong><br />
          • 各曜日ごとに開店・閉店時間を設定できます<br />
          • 定休日の場合は「定休日」にチェックを入れてください<br />
          • 時間は24時間形式で設定されます（例：9:00, 17:00）<br />
          • 設定した営業時間はアプリで自動的に表示されます
        </Typography>
      </Box>
    </Paper>
  );
}