import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Avatar, alpha, useTheme, LinearProgress, Chip } from '@mui/material';
import { Schedule, Assignment, TrendingUp, Payment, CheckCircle, AccessTime, School, EmojiEvents } from '@mui/icons-material';
import timezoneUtils from '../../../../utils/timezoneUtils';
import { useAuth } from '../../../../context/AuthContext';

const StatCard = ({ title, value, icon, color, subtitle, trend, progress, warning, achievement }) => {
  const theme = useTheme();

  return (
    <Card 
      sx={{ 
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.02)} 0%, ${alpha(theme.palette[color].main, 0)} 100%)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(theme.palette[color].main, 0.15)}`,
          border: `1px solid ${alpha(theme.palette[color].main, 0.25)}`,
          '&::before': {
            transform: 'scaleX(1)',
          },
          '& .stat-icon': {
            transform: 'scale(1.05) rotate(5deg)',
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${theme.palette[color].main}, ${alpha(theme.palette[color].main, 0.5)})`,
          transform: 'scaleX(0)',
          transition: 'transform 0.3s ease',
          transformOrigin: 'left',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box flex={1}>
            <Typography 
              color="textSecondary" 
              gutterBottom 
              variant="subtitle2"
              sx={{ 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                transition: 'all 0.2s ease',
              }}
            >
              {title}
              {achievement && (
                <EmojiEvents sx={{ fontSize: 14, color: theme.palette.warning.main }} />
              )}
            </Typography>
            
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '2rem', lg: '2.5rem' },
                background: `linear-gradient(135deg, ${theme.palette[color].main}, ${alpha(theme.palette[color].main, 0.7)})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 1,
                transition: 'all 0.2s ease',
              }}
            >
              {value}
            </Typography>
            
            {subtitle && (
              <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap" mb={1}>
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                  {subtitle}
                </Typography>
                {warning && (
                  <Chip
                    label="Urgent"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                      fontWeight: 500,
                    }}
                  />
                )}
              </Box>
            )}
            
            {trend && (
              <Box 
                sx={{ 
                  mt: 1, 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette[color].main, 0.08),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette[color].main, 0.12),
                  },
                }}
              >
                <Typography variant="caption" color={theme.palette[color].main} fontWeight={600}>
                  {trend}
                </Typography>
              </Box>
            )}
            
            {progress !== undefined && (
              <Box mt={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="textSecondary">
                    Completion
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color={theme.palette[color].main}>
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette[color].main, 0.1),
                    transition: 'all 0.3s ease',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${theme.palette[color].main}, ${alpha(theme.palette[color].main, 0.7)})`,
                      transition: 'transform 0.3s ease',
                    },
                  }}
                />
              </Box>
            )}
          </Box>
          
          <Avatar 
            className="stat-icon"
            sx={{ 
              bgcolor: alpha(theme.palette[color].main, 0.12),
              color: theme.palette[color].main,
              width: 56,
              height: 56,
              boxShadow: `0 4px 12px ${alpha(theme.palette[color].main, 0.15)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const StatCards = ({ 
  stats, 
  upcomingClasses, 
  activeEnrollment
}) => {
  const { user } = useAuth();
  const theme = useTheme();

  // Get next class time with better formatting
  const getNextClassInfo = () => {
    if (!upcomingClasses?.length) return null;
    const upcomingClass = upcomingClasses[0];
    const displayTimes = timezoneUtils.getClassDisplayTimes(
      upcomingClass,
      timezoneUtils.getUserTimezone(user)
    );
    return displayTimes ? displayTimes.startTime12 : upcomingClass.startTime;
  };

  // Get progress percentage
  const progressPercentage = stats.progressPercentage || 0;
  
  // Get fee status info
  const getFeeStatusInfo = () => {
    if (!activeEnrollment) {
      return { color: 'error', message: 'No active enrollment', status: 'inactive', value: '—' };
    }
    if (activeEnrollment.status === 'approved') {
      return { color: 'success', message: 'Up to date', status: 'good', value: `$${activeEnrollment.monthlyFee}` };
    }
    return { color: 'warning', message: 'Pending approval', status: 'pending', value: `$${activeEnrollment.monthlyFee}` };
  };

  const feeStatus = getFeeStatusInfo();
  const nextClassTime = getNextClassInfo();
  const hasClassesToday = upcomingClasses?.length > 0;
  
  // Calculate completed paras
  const completedParas = Math.round(progressPercentage * 30 / 100);
  
  // Get achievement status
  const hasAchievement = progressPercentage >= 75;

  return (
    <Grid container spacing={3}>
      {/* Today's Classes Card */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Today's Classes"
          value={upcomingClasses?.length || 0}
          icon={<Schedule sx={{ fontSize: 28 }} />}
          color="primary"
          subtitle={hasClassesToday 
            ? `Next class at ${nextClassTime}` 
            : 'No classes scheduled today'}
          trend={hasClassesToday 
            ? `${upcomingClasses.length} class${upcomingClasses.length > 1 ? 'es' : ''} remaining` 
            : 'Free day! 🌟'}
        />
      </Grid>

      {/* Pending Assignments Card */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Pending Assignments"
          value={stats.assignmentsPending || 0}
          icon={<Assignment sx={{ fontSize: 28 }} />}
          color={stats.assignmentsPending > 0 ? "warning" : "success"}
          subtitle={stats.assignmentsPending > 0 
            ? `${stats.assignmentsPending} assignment${stats.assignmentsPending > 1 ? 's' : ''} awaiting submission` 
            : 'All assignments completed! 🎉'}
          trend={stats.assignmentsPending > 0 
            ? `${stats.assignmentsPending} task${stats.assignmentsPending > 1 ? 's' : ''} pending` 
            : 'Great work!'}
          warning={stats.assignmentsPending > 2}
        />
      </Grid>

      {/* Learning Progress Card */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Learning Progress"
          value={`${Math.round(progressPercentage)}%`}
          icon={<TrendingUp sx={{ fontSize: 28 }} />}
          color="success"
          subtitle={`Completed ${completedParas} of 30 Paras`}
          progress={progressPercentage}
          trend={progressPercentage >= 75 
            ? "Excellent progress! 🎯" 
            : progressPercentage >= 50 
              ? "Halfway there! 💪" 
              : "Keep going! 📚"}
          achievement={hasAchievement}
        />
      </Grid>

      {/* Fee Status Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card 
          sx={{ 
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette[feeStatus.color].main, 0.1)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette[feeStatus.color].main, 0.02)} 0%, ${alpha(theme.palette[feeStatus.color].main, 0)} 100%)`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 24px ${alpha(theme.palette[feeStatus.color].main, 0.15)}`,
              border: `1px solid ${alpha(theme.palette[feeStatus.color].main, 0.25)}`,
              '&::before': {
                transform: 'scaleX(1)',
              },
              '& .fee-icon': {
                transform: 'scale(1.05) rotate(5deg)',
              },
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, ${theme.palette[feeStatus.color].main}, ${alpha(theme.palette[feeStatus.color].main, 0.5)})`,
              transform: 'scaleX(0)',
              transition: 'transform 0.3s ease',
              transformOrigin: 'left',
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
              <Box flex={1}>
                <Typography 
                  color="textSecondary" 
                  gutterBottom 
                  variant="subtitle2"
                  sx={{ 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem',
                  }}
                >
                  Fee Status
                </Typography>
                
                <Typography 
                  variant="h3" 
                  component="div" 
                  sx={{ 
                    fontWeight: 800,
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '1.75rem', lg: '2rem' },
                    color: theme.palette[feeStatus.color].main,
                    mb: 1,
                  }}
                >
                  {feeStatus.value}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={1}>
                  <Chip
                    icon={feeStatus.status === 'good' ? <CheckCircle sx={{ fontSize: 14 }} /> : <AccessTime sx={{ fontSize: 14 }} />}
                    label={feeStatus.message}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette[feeStatus.color].main, 0.1),
                      color: theme.palette[feeStatus.color].main,
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette[feeStatus.color].main, 0.15),
                      },
                      '& .MuiChip-icon': {
                        color: theme.palette[feeStatus.color].main,
                      },
                    }}
                  />
                </Box>

               

                {!activeEnrollment && (
                  <Box 
                    sx={{ 
                      mt: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.08),
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.info.main, 0.12),
                      },
                    }}
                  >
                    <School sx={{ fontSize: 12, color: theme.palette.info.main }} />
                    <Typography variant="caption" color="info.main" fontWeight={500}>
                      Enroll now to start learning
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Avatar 
                className="fee-icon"
                sx={{ 
                  bgcolor: alpha(theme.palette[feeStatus.color].main, 0.12),
                  color: theme.palette[feeStatus.color].main,
                  width: 56,
                  height: 56,
                  boxShadow: `0 4px 12px ${alpha(theme.palette[feeStatus.color].main, 0.15)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Payment sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatCards;