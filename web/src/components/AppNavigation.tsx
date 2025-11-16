import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Store,
  Event,
  AdminPanelSettings,
  ExitToApp,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function AppNavigation() {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
      </Toolbar>
    </AppBar>
  );
}