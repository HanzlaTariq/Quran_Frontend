import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  LinearProgress,
  Button 
} from '@mui/material';
import { Assignment, AccessTime, Grade } from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AssignmentCard = ({ assignment }) => {
  const navigate = useNavigate();
  const isOverdue = new Date(assignment.dueDate) < new Date();
  const daysLeft = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Assignment color="action" />
            <Typography variant="subtitle1" fontWeight="medium">
              {assignment.title}
            </Typography>
          </Box>
          <Chip 
            label={assignment.status}
            size="small"
            color={
              assignment.status === 'completed' ? 'success' :
              assignment.status === 'late' ? 'error' :
              isOverdue ? 'error' : 'warning'
            }
          />
        </Box>

        <Typography variant="body2" color="textSecondary" paragraph>
          {assignment.description}
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <Chip 
            icon={<AccessTime />} 
            label={`Due: ${format(new Date(assignment.dueDate), 'MMM d')}`}
            size="small"
            variant="outlined"
            color={isOverdue ? 'error' : 'default'}
          />
          {assignment.type && (
            <Chip 
              label={assignment.type}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {assignment.surah && (
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Surah: {assignment.surah} {assignment.fromAyat && `(Ayat ${assignment.fromAyat}-${assignment.toAyat})`}
          </Typography>
        )}

        {assignment.grade?.score && (
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Grade fontSize="small" />
            <Typography variant="body2">
              Grade: {assignment.grade.score}/{assignment.grade.maxScore}
            </Typography>
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="textSecondary">
            {isOverdue ? 'Overdue!' : `${daysLeft} days left`}
          </Typography>
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => navigate(`/student/assignments/${assignment._id}`)}
          >
            {assignment.status === 'pending' ? 'Submit' : 'View'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;