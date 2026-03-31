import React, { useState, useEffect } from 'react';
import { getSocket } from '../../socket/socket';
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Alert,
  Badge,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Payment,
  Receipt,
  Download,
  Visibility,
  CreditCard,
  AccountBalance,
  QrCode2,
  History,
  Add,
  Warning,
  CheckCircle,
  AccessTime,
  AttachMoney,
  Timer,
} from '@mui/icons-material';
import axios from 'axios';
import { format, differenceInDays, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const StudentFees = () => {
  const { settings, formatCurrency, currencySymbol } = useSystemSettings();
  const supportEmail = settings?.general?.contactEmail || 'support@quranacademy.com';
  const [feesData, setFeesData] = useState({
    subscription: {},
    pendingFees: [],
    paymentHistory: []
  });
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('easypaisa');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    fetchFeesData();

    // Listen for real-time updates
    const socket = getSocket();
    if (socket) {
      socket.on('enrollmentApproved', () => {
        console.log('Enrollment approved, refreshing fees data');
        fetchFeesData();
      });
    }

    return () => {
      if (socket) {
        socket.off('enrollmentApproved');
      }
    };
  }, []);

  const fetchFeesData = async () => {
    try {
      const [pendingRes, historyRes, profileRes] = await Promise.all([
        axios.get('/api/students/fees/pending'),
        axios.get('/api/students/fees/history'),
        axios.get('/api/auth/profile')
      ]);

      setFeesData({
        subscription: profileRes.data?.studentProfile?.subscription || {},
        pendingFees: pendingRes.data || [],
        paymentHistory: historyRes.data || []
      });
    } catch (error) {
      console.error('Error fetching fees data:', error);
      toast.error('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (fee) => {
    setSelectedFee(fee);
    setTransactionId('');
    setPaymentDialogOpen(true);
  };

  const handlePayment = async () => {
    try {
      const response = await axios.post('/api/students/fees/pay', {
        feeId: selectedFee._id,
        paymentMethod,
        transactionId: transactionId || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });

      toast.success('Payment processed successfully!');
      setPaymentDialogOpen(false);
      fetchFeesData();
      
      // Show receipt
      if (response.data.receipt) {
        toast.success(`Invoice ${response.data.receipt.invoiceNumber} paid successfully`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  const calculateDaysLeft = (deadline) => {
    if (!deadline) return 0;
    const days = differenceInDays(new Date(deadline), new Date());
    return days > 0 ? days : 0;
  };

  const getFeeStatusColor = (fee) => {
    if (fee.status === 'paid') return 'success';
    if (fee.status === 'overdue') return 'error';
    
    const daysLeft = calculateDaysLeft(fee.paymentDeadline);
    if (daysLeft <= 2) return 'warning';
    return 'info';
  };

  const downloadInvoice = async (fee) => {
    try {
      const response = await axios.get(`/api/students/fees/${fee._id}/invoice`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${fee.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Fees & Payments
            </Typography>
            <Typography variant="body1">
              Manage your subscription and payments
            </Typography>
          </Box>
          <Badge 
            badgeContent={feesData.pendingFees.length} 
            color="error"
            sx={{ mr: 2 }}
          >
            <Button 
              variant="contained" 
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}
              startIcon={<History />}
              onClick={fetchFeesData}
            >
              Refresh
            </Button>
          </Badge>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Monthly Fee
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {formatCurrency(feesData.subscription?.monthlyFee || 0)}
                  </Typography>
                  <Chip
                    label={feesData.subscription?.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{ mt: 1 }}
                    color={feesData.subscription?.isActive ? 'success' : 'error'}
                  />
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Next Billing
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    {feesData.subscription?.nextBillingDate 
                      ? format(new Date(feesData.subscription.nextBillingDate), 'MMM d') 
                      : 'N/A'
                    }
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                    Monthly
                  </Typography>
                </Box>
                <Timer sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Pending Fees
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'warning.main' }}>
                    {feesData.pendingFees.length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                    Require Attention
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Paid
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'success.main' }}>
                    {formatCurrency(feesData.paymentHistory.reduce((sum, p) => sum + p.amount, 0))}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                    {feesData.paymentHistory.length} payments
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left Column - Pending Fees */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h6" fontWeight="bold">Pending Fees</Typography>
                <Typography variant="body2" color="textSecondary">
                  ⚠️ 5-day payment window after approval
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small"
                disabled={feesData.pendingFees.length === 0}
                onClick={() => {
                  if (feesData.pendingFees.length > 0) {
                    handlePayNow(feesData.pendingFees[0]);
                  }
                }}
              >
                Pay All ({feesData.pendingFees.length})
              </Button>
            </Box>

            {feesData.pendingFees.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Course</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Deadline</TableCell>
                      <TableCell>Days Left</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feesData.pendingFees.map((fee) => {
                      const daysLeft = calculateDaysLeft(fee.paymentDeadline);
                      const isUrgent = daysLeft <= 2;
                      
                      return (
                        <TableRow 
                          key={fee._id}
                          sx={{ 
                            backgroundColor: isUrgent ? 'rgba(255, 152, 0, 0.05)' : 'inherit',
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {fee.invoiceNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {fee.enrollment?.course?.name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {fee.dueDate ? format(new Date(fee.dueDate), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              {fee.paymentDeadline ? format(new Date(fee.paymentDeadline), 'MMM d') : 'N/A'}
                              {isUrgent && <Warning color="warning" fontSize="small" />}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${daysLeft} days`}
                              size="small"
                              color={getFeeStatusColor(fee)}
                              icon={isUrgent ? <AccessTime /> : null}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="bold" color="primary">
                              {formatCurrency(fee.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={fee.status}
                              size="small"
                              color={getFeeStatusColor(fee)}
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Button
                                size="small"
                                variant="contained"
                                color={isUrgent ? "warning" : "primary"}
                                onClick={() => handlePayNow(fee)}
                                startIcon={<Payment />}
                              >
                                Pay
                              </Button>
                              <Tooltip title="Download Invoice">
                                <IconButton 
                                  size="small" 
                                  onClick={() => downloadInvoice(fee)}
                                >
                                  <Download />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body1">
                  <CheckCircle sx={{ verticalAlign: 'middle', mr: 1 }} />
                  No pending fees. All payments are up to date!
                </Typography>
              </Alert>
            )}

            {/* Payment Timeline Info */}
            {feesData.pendingFees.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> After enrollment approval, you have 5 days to make the payment. 
                  Late payments may result in temporary suspension of classes. 
                  Classes will begin only after payment confirmation.
                </Typography>
              </Alert>
            )}
          </Paper>

          {/* Payment History */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">Payment History</Typography>
              <Button variant="outlined" size="small">
                Export to Excel
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Invoice</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feesData.paymentHistory.slice(0, 10).map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="primary">
                          {payment.invoiceNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {payment.description || 'Monthly Tuition Fee'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.paymentMethod || 'N/A'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          size="small"
                          color="success"
                          icon={<CheckCircle />}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {feesData.paymentHistory.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography>No payment history yet.</Typography>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Payment Info */}
        <Grid item xs={12} md={4}>
          {/* Payment Methods */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Payment Methods
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {[
                { method: 'Easypaisa', icon: '0312-3456789', color: 'purple' },
                { method: 'JazzCash', icon: '0300-1234567', color: 'green' },
                { method: 'Bank Transfer', icon: 'HBL Bank', color: 'blue' },
              ].map((item) => (
                <Grid item xs={12} key={item.method}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      borderColor: paymentMethod === item.method.toLowerCase() ? `${item.color}.main` : 'divider',
                      cursor: 'pointer',
                      '&:hover': { borderColor: `${item.color}.main` }
                    }}
                    onClick={() => setPaymentMethod(item.method.toLowerCase())}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {item.method}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {item.icon}
                          </Typography>
                        </Box>
                        {paymentMethod === item.method.toLowerCase() && (
                          <CheckCircle color="primary" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Billing Summary */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Billing Summary
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2">Monthly Fee:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(feesData.subscription?.monthlyFee || 0)}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2">Pending Amount:</Typography>
                <Typography variant="body2" fontWeight="bold" color="warning.main">
                  {formatCurrency(feesData.pendingFees.reduce((sum, fee) => sum + fee.amount, 0))}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2">Next Billing:</Typography>
                <Typography variant="body2">
                  {feesData.subscription?.nextBillingDate 
                    ? format(new Date(feesData.subscription.nextBillingDate), 'MMM d, yyyy')
                    : 'Not scheduled'
                  }
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Total Due:</Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {formatCurrency(feesData.pendingFees.reduce((sum, fee) => sum + fee.amount, 0))}
                </Typography>
              </Box>
              
              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                sx={{ mt: 3 }}
                onClick={() => {
                  if (feesData.pendingFees.length > 0) {
                    handlePayNow(feesData.pendingFees[0]);
                  }
                }}
                disabled={feesData.pendingFees.length === 0}
                startIcon={<Payment />}
              >
                Pay Now
              </Button>
            </Box>
          </Paper>

          {/* Help Info */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Need Help?
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              • Payments are processed within 24 hours
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Keep transaction ID for reference
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Contact support for payment issues
            </Typography>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ mt: 2 }}
              href={`mailto:${supportEmail}`}
            >
              Contact Support
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Payment color="primary" />
            <Typography variant="h6">Make Payment</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedFee && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Invoice:</strong> {selectedFee.invoiceNumber}
                </Typography>
                <Typography variant="body2">
                  <strong>Amount Due:</strong> {formatCurrency(selectedFee.amount)}
                </Typography>
                <Typography variant="caption">
                  <strong>Deadline:</strong> {format(new Date(selectedFee.paymentDeadline), 'MMM d, yyyy')}
                </Typography>
              </Alert>
            )}

            <TextField
              select
              fullWidth
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              margin="normal"
            >
              <MenuItem value="easypaisa">Easypaisa</MenuItem>
              <MenuItem value="jazzcash">JazzCash</MenuItem>
              <MenuItem value="bank">Bank Transfer</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Transaction ID/Reference"
              margin="normal"
              placeholder="Enter transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              helperText="Keep this for future reference"
            />

            <TextField
              fullWidth
              label="Amount"
              value={selectedFee?.amount || ''}
              margin="normal"
              InputProps={{
                readOnly: true,
                startAdornment: <Typography sx={{ mr: 1 }}>{currencySymbol}</Typography>,
              }}
            />

            {paymentMethod === 'easypaisa' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Send payment to: <strong>0312-3456789</strong><br/>
                Use Invoice # as reference
              </Alert>
            )}
            
            {paymentMethod === 'jazzcash' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Send payment to: <strong>0300-1234567</strong><br/>
                Use Invoice # as reference
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handlePayment}
            disabled={!transactionId && paymentMethod !== 'cash'}
          >
            Confirm Payment {formatCurrency(selectedFee?.amount || 0)}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentFees;