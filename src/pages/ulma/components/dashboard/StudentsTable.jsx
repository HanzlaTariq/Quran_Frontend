import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
} from '@mui/material';
import { Visibility, Message } from '@mui/icons-material';
import { format } from 'date-fns';

const StudentsTable = ({ 
  students = [], 
  activeTab = 0, 
  onTabChange, 
  onViewStudent, 
  onMessageStudent, 
  onViewAll 
}) => {
  const [localActiveTab, setLocalActiveTab] = useState(activeTab);

  const handleTabChange = (event, newValue) => {
    setLocalActiveTab(newValue);
    if (onTabChange) onTabChange(newValue);
  };

  const filteredStudents = () => {
    switch (localActiveTab) {
      case 1: // Active
        return students.filter(s => s.status === 'active');
      case 2: // New
        return students.filter(s => 
          new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
      default: // All
        return students;
    }
  };

  const displayedStudents = filteredStudents().slice(0, 5);

  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">My Students</Typography>
        <Tabs 
          value={localActiveTab} 
          onChange={handleTabChange} 
          size="small"
          sx={{ minHeight: 'auto' }}
        >
          <Tab label="All" />
          <Tab label="Active" />
          <Tab label="New" />
        </Tabs>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Attendance</TableCell>
              <TableCell>Last Class</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedStudents.map((student) => (
              <TableRow key={student._id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      sx={{ mr: 2, width: 32, height: 32 }}
                      src={student.user?.profileImage}
                    >
                      {student.user?.name?.charAt(0) || 'S'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {student.user?.name || 'Student'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {student.user?.country || 'Unknown'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={student.currentCourse?.name || 'Not enrolled'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={student.progress?.percentage || 0}
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2">
                      {student.progress?.percentage || 0}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${student.progress?.attendanceRate || 0}%`}
                    size="small"
                    color={
                      (student.progress?.attendanceRate || 0) >= 90
                        ? 'success'
                        : (student.progress?.attendanceRate || 0) >= 70
                        ? 'warning'
                        : 'error'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {student.progress?.lastClass
                      ? format(new Date(student.progress.lastClass), 'MMM d')
                      : 'No classes'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => onViewStudent(student._id)}
                      title="View Profile"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onMessageStudent(student._id)}
                      title="Send Message"
                    >
                      <Message fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            
            {displayedStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No students found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {students.length > 5 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button onClick={onViewAll}>
            View All Students ({students.length})
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default StudentsTable;