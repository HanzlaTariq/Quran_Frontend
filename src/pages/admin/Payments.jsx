import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Tooltip,
  Pagination,
  Stack,
  Tabs,
  Tab,
  Avatar
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  CheckCircle,
  Cancel,
  Pending,
  Download,
  Refresh,
  AttachMoney,
  TrendingUp,
  Receipt,
  CalendarToday,
  Payment,
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [paymentTrends, setPaymentTrends] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    method: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, [pagination.page, filters, activeTab]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: activeTab === 0 ? (filters.status || undefined) : 
                activeTab === 1 ? 'pending' : 
                activeTab === 2 ? 'paid' : 
                activeTab === 3 ? 'overdue' : undefined,
      };

      const { data } = await axios.get('/api/admin/fees', { params });
      setPayments(data.fees);
      setPagination(data.pagination);
      
      // Calculate summary from fees
      const totalAmount = data.fees.reduce((sum, fee) => sum + fee.amount, 0);
      const completedAmount = data.fees.filter(f => f.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
      const pendingAmount = data.fees.filter(f => f.status === 'pending' || f.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0);
      const failedAmount = data.fees.filter(f => f.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0);
      
      setSummary({
        totalAmount,
        completedAmount,
        pendingAmount,
        failedAmount,
        totalCount: data.fees.length,
        completedCount: data.fees.filter(f => f.status === 'paid').length,
      });
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const { data } = await axios.get('/api/admin/payments/summary', {
        params: { period: 'monthly' },
      });
      setPaymentTrends(data.paymentTrends);
      setPaymentMethods(data.paymentMethods);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setPaymentDialogOpen(true);
  };

  const handleUpdateStatus = async (paymentId, status) => {
    try {
      await axios.put(`/api/admin/payments/${paymentId}/status`, { status });
      toast.success(`Payment marked as ${status}`);
      fetchPayments();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.post(
        '/api/admin/reports/generate',
        {
          reportType: 'financial',
          format,
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fees-report-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const PaymentRow = ({ payment }) => (
    <TableRow>
      <TableCell>
        <Typography variant="body2" fontWeight="bold">
          {payment.invoiceNumber}
        </Typography>
      </TableCell>
      <TableCell>
        <Box>
          <Typography variant="body2">
            {payment.student?.user?.name || 'Unknown Student'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {payment.student?.user?.email}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          icon={<AttachMoney />}
          label={`$ ${payment.amount}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </TableCell>
      <TableCell>
        <Chip
          label={payment.paymentMethod || 'Not Paid'}
          size="small"
          variant="outlined"
        />
      </TableCell>
      <TableCell>
        <Chip
          label={payment.status}
          size="small"
          color={
            payment.status === 'paid'
              ? 'success'
              : payment.status === 'pending'
              ? 'warning'
              : payment.status === 'overdue'
              ? 'error'
              : 'default'
          }
        />
      </TableCell>
      <TableCell>
        {format(new Date(payment.createdAt), 'MMM d, yyyy')}
      </TableCell>
      <TableCell>
        <Box display="flex" gap={1}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleViewPayment(payment)}>
              <Visibility />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Fee Management
            </Typography>
            <Typography color="textSecondary">
              Monitor and manage all student fee payments
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchPayments}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => handleExport('excel')}
            >
              Export
            </Button>
          </Box>
        </Box>

        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
          <Tab label="All Fees" />
          <Tab label="Pending" />
          <Tab label="Paid" />
          <Tab label="Overdue" />
        </Tabs>

        {/* Summary Cards */}
        {summary && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <AttachMoney />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">
                        $ {summary.totalAmount}
                      </Typography>
                      <Typography color="textSecondary">Total Fees Amount</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'success.light' }}>
                      <CheckCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">
                        $ {summary.completedAmount}
                      </Typography>
                      <Typography color="textSecondary">Paid Fees</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'warning.light' }}>
                      <Pending />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">
                        $ {summary.pendingAmount}
                      </Typography>
                      <Typography color="textSecondary">Pending Fees</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'error.light' }}>
                      <Cancel />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">
                        $ {summary.failedAmount}
                      </Typography>
                      <Typography color="textSecondary">Overdue Fees</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Method</InputLabel>
                <Select
                  value={filters.method}
                  label="Method"
                  onChange={(e) => handleFilterChange('method', e.target.value)}
                >
                  <MenuItem value="">All Methods</MenuItem>
                  <MenuItem value="card">Credit Card</MenuItem>
                  <MenuItem value="bank">Bank Transfer</MenuItem>
                  <MenuItem value="easypaisa">Easypaisa</MenuItem>
                  <MenuItem value="jazzcash">JazzCash</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterList />}
                onClick={fetchPayments}
              >
                Filter
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                Payment Trends
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={paymentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#8884d8" name="Amount ($)" />
                  <Bar dataKey="count" fill="#82ca9d" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                Payment Methods
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry._id}: $ ${entry.amount}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Payments Table */}
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <PaymentRow key={payment._id} payment={payment} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {payments.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No payments found matching your criteria.
              </Alert>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.page}
                  onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Payment Details Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="md">
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">
                      Invoice #{selectedPayment.invoiceNumber}
                    </Typography>
                    <Typography color="textSecondary">
                      {format(new Date(selectedPayment.createdAt), 'MMMM d, yyyy HH:mm')}
                    </Typography>
                  </Box>
                  <Chip
                    label={selectedPayment.status}
                    color={
                      selectedPayment.status === 'paid'
                        ? 'success'
                        : selectedPayment.status === 'pending'
                        ? 'warning'
                        : selectedPayment.status === 'overdue'
                        ? 'error'
                        : 'default'
                    }
                    size="large"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Student Information
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedPayment.student?.user?.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedPayment.student?.user?.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Course:</strong> {selectedPayment.student?.currentCourse}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Payment Information
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Amount:</strong> $ {selectedPayment.amount}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Method:</strong> {selectedPayment.paymentMethod || 'Not Paid'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Transaction ID:</strong> {selectedPayment.transactionId || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Due Date:</strong> {selectedPayment.dueDate ? format(new Date(selectedPayment.dueDate), 'MMM d, yyyy') : 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Payment Date:</strong> {selectedPayment.paymentDate ? format(new Date(selectedPayment.paymentDate), 'MMM d, yyyy') : 'Not Paid'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {selectedPayment.notes && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body2">
                        {selectedPayment.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Close</Button>
          {selectedPayment?.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  handleUpdateStatus(selectedPayment._id, 'completed');
                  setPaymentDialogOpen(false);
                }}
              >
                Mark as Completed
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  handleUpdateStatus(selectedPayment._id, 'failed');
                  setPaymentDialogOpen(false);
                }}
              >
                Mark as Failed
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Payments;