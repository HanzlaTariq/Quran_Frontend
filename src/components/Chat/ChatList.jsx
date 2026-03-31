import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Avatar, 
  ListItemAvatar,
  Typography,
  Badge,
  alpha,
  useTheme,
  Paper
} from '@mui/material';

const ChatList = ({ conversations, onSelect, currentUser }) => {
  const theme = useTheme();

  return (
    <List sx={{ width: '100%', p: 0 }}>
      {conversations.length === 0 ? (
        <Paper 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.02)
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No conversations yet
          </Typography>
        </Paper>
      ) : (
        conversations.map((conv, index) => (
          <React.Fragment key={conv._id}>
            <ListItem
              button
              onClick={() => onSelect(conv)}
              sx={{
                py: 2,
                px: 3,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  color="success"
                  sx={{
                    '& .MuiBadge-badge': {
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      border: `2px solid ${theme.palette.background.paper}`,
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: conv.role === 'student' 
                        ? theme.palette.secondary.main 
                        : theme.palette.primary.main,
                    }}
                  >
                    {conv.partnerName?.charAt(0) || 'U'}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight={600}>
                    {conv.partnerName}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '200px',
                    }}
                  >
                    {conv.lastMessage || 'No messages yet'}
                  </Typography>
                }
              />
            </ListItem>
            {index < conversations.length - 1 && (
              <div style={{ 
                height: '1px', 
                backgroundColor: alpha(theme.palette.divider, 0.1),
                margin: '0 16px'
              }} />
            )}
          </React.Fragment>
        ))
      )}
    </List>
  );
};

export default ChatList;