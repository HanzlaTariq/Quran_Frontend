import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  Tooltip,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Dashboard,
  Book,
  School,
  Payment,
  TrendingUp,
  Settings,
  Assessment,
  Logout,
  Mosque,
  Person,
  Chat as ChatIcon,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatSidebar from '../Chat/ChatSidebar';
import { connectSocket, getSocket } from '../../socket/socket';
import { chatService } from '../../services';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const { settings } = useSystemSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!user || !['student', 'ulma'].includes(user.role)) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await chatService.getUnreadCount();
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Keep badge in sync even if socket event is missed.
  useEffect(() => {
    if (!user || !['student', 'ulma'].includes(user.role)) return;

    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 7000);

    return () => clearInterval(intervalId);
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (chatOpen) {
      fetchUnreadCount();
    }
  }, [chatOpen, fetchUnreadCount]);

  // Ensure a socket connection exists so navbar can react to incoming messages.
  useEffect(() => {
    if (!user || !['student', 'ulma'].includes(user.role)) return;

    connectSocket({
      userId: user._id,
      role: user.role,
      classId: ''
    });
  }, [user]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!user || !['student', 'ulma'].includes(user.role)) return;

    const socket = getSocket();
    if (socket) {
      const handleNewMessage = () => {
        // Refetch unread count when a new message arrives
        fetchUnreadCount();
      };

      socket.on('chat-message', handleNewMessage);

      return () => {
        socket.off('chat-message', handleNewMessage);
      };
    }
  }, [user, fetchUnreadCount]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleRouteChange = (path) => {
    navigate(path);
    setDrawerOpen(false);
    handleMenuClose();
  };

  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          { label: 'Dashboard', icon: <Dashboard />, path: '/student/dashboard' },
          { label: 'Quran', icon: <Mosque />, path: '/student/quran' },
          { label: 'Live Classes', icon: <School />, path: '/student/live-classes' },
          { label: 'Courses & Ulma', icon: <Book />, path: '/student/courses' },
          { label: 'Progress', icon: <TrendingUp />, path: '/student/progress' },
          { label: 'Current Enrollments', icon: <School />, path: '/student/current-enrollments' },
          { label: 'Fees', icon: <Payment />, path: '/student/fees' },
          {label:'Timetable', icon:<Assessment />, path:'/student/timetable' },
        ];
      case 'ulma':
        return [
          { label: 'Dashboard', icon: <Dashboard />, path: '/ulma/dashboard' },
          { label: 'Quran', icon: <Mosque />, path: '/ulma/quran' },
          { label: 'Students', icon: <School />, path: '/ulma/students' },
          { label: 'Schedule', icon: <Book />, path: '/ulma/schedule' },
          { label: 'Attendance', icon: <Person />, path: '/ulma/attendance' },
          { label: 'Timetable', icon:<Assessment />, path:'/ulma/timetable' },
        ];
      case 'admin':
        return [
          { label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
          { label: 'Users', icon: <School />, path: '/admin/users' },
          { label: 'Courses', icon: <Book />, path: '/admin/courses' },
          { label: 'Payments', icon: <Payment />, path: '/admin/payments' },
          { label: " Ulma", icon: <Person />, path: '/admin/Ulma' },
          { label: 'Reports', icon: <TrendingUp />, path: '/admin/reports' },
          { label: 'Enrollments', icon: <Book />, path: '/admin/enrollments' },
          { label: 'Classes', icon: <Book />, path: '/admin/classes' },
        ];
      default:
        return [];
    }
  };

  const drawerContent = (
    <Box sx={{ width: { xs: 300, sm: 340 }, maxWidth: '92vw', height: '100%', display: 'flex', flexDirection: 'column' }} role="presentation">
      <Box
        sx={{
          px: 2.5,
          py: 2.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(130deg, #0f766e 0%, #115e59 45%, #0c4a6e 100%)',
          color: '#fff',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              display: 'grid',
              placeItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.18)',
            }}
          >
            <Mosque />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {settings?.general?.siteName || 'Quran Academy'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Learning Dashboard
            </Typography>
          </Box>
        </Box>
        <Chip
          label={user?.role?.toUpperCase() || 'USER'}
          size="small"
          sx={{
            color: '#fff',
            fontWeight: 700,
            backgroundColor: 'rgba(255,255,255,0.2)',
          }}
        />
      </Box>

      <List sx={{ px: 1.25, py: 1.25, flexGrow: 1, overflowY: 'auto' }}>
        {getNavItems().map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleRouteChange(item.path)}
              selected={isActivePath(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(15, 118, 110, 0.12)',
                  border: '1px solid rgba(15, 118, 110, 0.24)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: isActivePath(item.path) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      <List sx={{ px: 1.25, py: 1.25 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton onClick={() => handleRouteChange('/profile')} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 38 }}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{ borderRadius: 2, color: 'error.main' }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: 'error.main' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.76)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, px: { xs: 1.25, sm: 2.5 } }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flexGrow: 1 }}>
            <Box
              sx={{
                width: { xs: 34, md: 40 },
                height: { xs: 34, md: 40 },
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                mr: 1.25,
                background: 'linear-gradient(135deg, #0f766e 0%, #0c4a6e 100%)',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(15, 118, 110, 0.28)',
              }}
            >
              <Mosque sx={{ fontSize: { xs: 19, md: 22 } }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'Poppins, Segoe UI, sans-serif',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: { xs: 150, sm: '100%' },
                }}
              >
                {settings?.general?.siteName || 'Quran Academy'}
              </Typography>
              {!isMobile && (
                <Typography variant="caption" color="text.secondary">
                  Learn. Practice. Grow.
                </Typography>
              )}
            </Box>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, mr: { md: 2, lg: 3 }, overflowX: 'auto', py: 0.5 }}>
              {getNavItems().map((item) => (
                <Chip
                  key={item.label}
                  label={item.label}
                  onClick={() => handleRouteChange(item.path)}
                  clickable
                  icon={item.icon}
                  color={isActivePath(item.path) ? 'primary' : 'default'}
                  variant={isActivePath(item.path) ? 'filled' : 'outlined'}
                  sx={{
                    borderRadius: '999px',
                    fontWeight: 600,
                    maxWidth: 170,
                    '& .MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user ? (
              <>
                <Tooltip title="Notifications">
                  <IconButton sx={{ bgcolor: 'rgba(15, 23, 42, 0.04)' }}>
                    <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Messages">
                  <IconButton onClick={() => setChatOpen(true)} sx={{ bgcolor: 'rgba(15, 23, 42, 0.04)' }}>
                    <Badge badgeContent={unreadCount} color="primary" invisible={unreadCount === 0}>
                      <ChatIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Account">
                  <IconButton onClick={handleMenuOpen} sx={{ p: 0.4 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        fontWeight: 700,
                        fontSize: 14,
                        bgcolor: 'primary.main',
                        boxShadow: '0 6px 16px rgba(2, 132, 199, 0.3)',
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    '&:hover': {
                      backgroundColor: 'rgba(15, 118, 110, 0.1)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    backgroundColor: '#0f766e',
                    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
                    '&:hover': {
                      backgroundColor: '#115e59',
                      boxShadow: '0 6px 16px rgba(15, 118, 110, 0.4)',
                    },
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            
            <MenuItem onClick={() => handleRouteChange(`/${user?.role}/settings`)}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawerContent}
      </Drawer>

      {/* Chat Sidebar */}
      <ChatSidebar open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default Navbar;