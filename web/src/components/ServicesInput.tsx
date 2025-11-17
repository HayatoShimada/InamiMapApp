import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Grid,
} from '@mui/material';
import { SHOP_SERVICES, SERVICE_ICONS } from '../types/firebase';

interface ServicesInputProps {
  value: string[];
  onChange: (services: string[]) => void;
  disabled?: boolean;
}

export default function ServicesInput({ value = [], onChange, disabled = false }: ServicesInputProps) {
  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      // サービスを追加
      onChange([...value, service]);
    } else {
      // サービスを削除
      onChange(value.filter(s => s !== service));
    }
  };

  const handleServiceClick = (service: string) => {
    const isSelected = value.includes(service);
    handleServiceChange(service, !isSelected);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        お客様が利用できるサービスや設備を選択してください
      </Typography>

        {/* 選択済みサービスの表示 */}
        {value.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              選択中のサービス ({value.length}件)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {value.map((service) => (
                <Chip
                  key={service}
                  label={`${SERVICE_ICONS[service] || '⭐'} ${service}`}
                  onDelete={disabled ? undefined : () => handleServiceChange(service, false)}
                  color="primary"
                  variant="filled"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* サービス選択 */}
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">
            利用可能なサービス
          </FormLabel>
          <FormGroup>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {SHOP_SERVICES.map((service) => (
                <Grid item xs={12} sm={6} md={4} key={service}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value.includes(service)}
                        onChange={(e) => handleServiceChange(service, e.target.checked)}
                        disabled={disabled}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '1.2em' }}>
                          {SERVICE_ICONS[service] || '⭐'}
                        </span>
                        <Typography variant="body2">
                          {service}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      margin: 0,
                      padding: 1,
                      border: '1px solid',
                      borderColor: value.includes(service) ? 'primary.main' : 'grey.300',
                      borderRadius: 1,
                      backgroundColor: value.includes(service) ? 'primary.light' : 'transparent',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.light',
                        cursor: 'pointer',
                      },
                      width: '100%',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onClick={() => !disabled && handleServiceClick(service)}
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>
        </FormControl>

      {/* ヒント */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="info.dark">
          <strong>ヒント:</strong> 提供サービスを設定することで、お客様が来店前に必要な設備やサービスがあるか確認できます。
          正確な情報を設定することで、お客様の満足度向上につながります。
        </Typography>
      </Box>
    </Box>
  );
}