// pages/admin/Classes.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VideoCameraBack as VideoIcon,
  Schedule as ScheduleIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-hot-toast';

const AdminClasses = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Sample classes data
  const classes = [
    {
      id: 1,
      name: 'Quran Tajweed - Batch 1',
      ulma: 'Molana Ahmed',
      students: 15,
      schedule: 'Mon, Wed, Fri (9:00 AM - 10:00 AM)',
      status: 'active',
      type: 'group',
    },
    // Add more data
  ];

  const columns = [
    { field: 'name', headerName: 'Class Name', width: 200 },
    { field: 'ulma', headerName: 'Ulma', width: 150 },
    { field: 'students', headerName: 'Students', width: 100 },
    { field: 'schedule', headerName: 'Schedule', width: 250 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'active' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" color="primary">
            <EditIcon />
          </IconButton>
          <IconButton size="small" color="primary">
            <VideoIcon />
          </IconButton>
          <IconButton size="small" color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Classes Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Class
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Active Classes</Typography>
              <Typography variant="h4">24</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Total Students</Typography>
              <Typography variant="h4">156</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Ongoing Classes</Typography>
              <Typography variant="h4">8</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Available Ulma</Typography>
              <Typography variant="h4">12</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Classes Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={classes}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Class Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Class</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Class Name"
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Ulma</InputLabel>
              <Select label="Select Ulma">
                <MenuItem value="1">Molana Ahmed</MenuItem>
                <MenuItem value="2">Molana Abdul Rehman</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Class Type</InputLabel>
              <Select label="Class Type">
                <MenuItem value="group">Group Class</MenuItem>
                <MenuItem value="individual">One-on-One</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Schedule"
              margin="normal"
              placeholder="e.g., Mon, Wed, Fri (9:00 AM)"
            />
            <TextField
              fullWidth
              label="Max Students"
              type="number"
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            toast.success('Class created successfully!');
            setOpenDialog(false);
          }}>
            Create Class
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminClasses;