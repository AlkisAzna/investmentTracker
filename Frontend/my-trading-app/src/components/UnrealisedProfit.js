import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, TablePagination ,CardContent, Grid, Autocomplete, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { TRANSACTION_LIST_URL } from '../api/constants';
import { fetchUserAssets } from '../api/apiCalls';

const UnrealisedProfit = () => {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assets, setAssets] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [results, setResults] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userAssets, setUserAssets] = useState([]);

  // Fetch user's assets only once on component mount
  useEffect(() => {
    fetchUserAssets().then(response => {
      setUserAssets(response.map(asset => ({ name: asset.asset_name, quantity: asset.quantity })));
    }).catch(error => {
      console.error("Error fetching user assets:", error);
    });
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(TRANSACTION_LIST_URL, {
          headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setTransactions(response.data);
        setAssets([...new Set(response.data.map(t => t.asset_name))]);
      } catch (error) {
        console.error('Error fetching transactions: ', error);
        setSnackbar({ open: true, message: 'Error fetching transactions: ' + error, severity: 'error' });
      }
    };

    fetchTransactions();
    setPage(0);
  }, []);

  const filterTransactions = () => {
    let filtered = transactions;
  
    if (startDate) {
      filtered = filtered.filter(t => new Date(t.timestamp).setHours(0, 0, 0, 0) >= new Date(startDate).setHours(0, 0, 0, 0));
    }
  
    if (endDate) {
      filtered = filtered.filter(t => new Date(t.timestamp).setHours(0, 0, 0, 0) <= new Date(endDate).setHours(0, 0, 0, 0));
    }
  
    if (selectedAsset) {
      filtered = filtered.filter(t => t.asset_name === selectedAsset);
    }
  
    setFilteredTransactions(filtered);
  };

  const formatQuantity = (quantity) => {
    const num = parseFloat(quantity);
    return num % 1 === 0 ? num.toFixed(0) : num.toPrecision(3);
  };

  const calculateResults = () => {
    const result = [];
    const totals = {
      investment: 0,
      earnings: 0,
      profitLoss: 0
    };
  
    const assets = selectedAsset ? [selectedAsset] : [...new Set(filteredTransactions.map(t => t.asset_name))];
  
    assets.forEach(asset => {
      const assetTransactions = filteredTransactions.filter(t => t.asset_name === asset);
      const investment = assetTransactions
        .filter(t => t.transaction_type.toLowerCase() === 'buy')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const earnings = assetTransactions
        .filter(t => t.transaction_type.toLowerCase() === 'sell')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const profitLoss = earnings - investment;
      const percentage = investment !== 0 ? ((profitLoss / investment) * 100).toFixed(2) : '0.00';
      const currentQuantity = userAssets.find(a => a.name === asset)?.quantity || 0;
      console.log(currentQuantity);
      console.log(userAssets);
      totals.investment += investment;
      totals.earnings += earnings;
      totals.profitLoss += profitLoss;
  
      result.push({
        asset,
        investment: investment.toFixed(2),
        earnings: earnings.toFixed(2),
        currentQuantity: formatQuantity(currentQuantity),
        profitLoss: profitLoss.toFixed(2),
        percentage
      });
    });
  
    if (!selectedAsset) {
      result.push({
        asset: 'Total',
        investment: totals.investment.toFixed(2),
        earnings: totals.earnings.toFixed(2),
        currentQuantity: '-',
        profitLoss: totals.profitLoss.toFixed(2),
        percentage: totals.investment !== 0 ? ((totals.profitLoss / totals.investment) * 100).toFixed(2) : '0.00',
        isTotal: true
      });
    }
  
    setResults(result);
  };

  const handleSearch = () => {
    if (!startDate || !endDate) {
      setSnackbar({ open: true, message: "Please select both start and end dates.", severity: 'error' });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setSnackbar({ open: true, message: "Start date cannot be later than end date.", severity: 'error' });
      return;
    }

    filterTransactions();
  };

  useEffect(() => {
    if (filteredTransactions.length > 0) {
      calculateResults();
    }
  }, [filteredTransactions]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Card sx={{ p: 3, borderRadius: '16px', boxShadow: '6px 4px 18px 8px rgba(0,0,0,0.3)' }}>
      <CardContent>
        <Typography variant="h5" align="center" fontWeight="Bold" gutterBottom>
          Unrealized Profit
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={4}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={assets}
                getOptionLabel={(option) => option}
                value={selectedAsset}
                onChange={(event, newValue) => setSelectedAsset(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Asset" variant="outlined" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  fontFamily: 'Raleway, Roboto',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  bgcolor: 'green',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'white',
                    color: "green",
                    borderColor: 'darkgreen'
                  }
                }}>
                Calculate
              </Button>
            </Grid>
          </Grid>
        </Box>
        <TableContainer component={Paper}>
          <Table aria-label="Unrealized Profit">
            <TableHead>
              <TableRow sx={{ backgroundColor: "green" }}>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontFamily: "Raleway, Roboto", fontSize: "18px" }} align="center">Asset</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontFamily: "Raleway, Roboto", fontSize: "18px" }} align="center">Investment</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontFamily: "Raleway, Roboto", fontSize: "18px" }} align="center">Current Quantity</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontFamily: "Raleway, Roboto", fontSize: "18px" }} align="center">Earnings</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontFamily: "Raleway, Roboto", fontSize: "18px" }} align="center">Profit/Loss</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontFamily: "Raleway, Roboto", fontSize: "18px" }} align="center">Percentage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow key={index} sx={row.isTotal ? { borderTop: 'double 3px black' } : {}}>
                  <TableCell sx={{ fontFamily: "Raleway, Roboto", fontSize: "15px", fontWeight: "bold" }} align="center">{row.asset}</TableCell>
                  <TableCell sx={{ fontFamily: "Raleway, Roboto", fontSize: "15px" }} align="center">{row.investment}</TableCell>
                  <TableCell sx={{ fontFamily: "Raleway, Roboto", fontSize: "15px" }} align="center">{row.currentQuantity}</TableCell>
                  <TableCell sx={{ fontFamily: "Raleway, Roboto", fontSize: "15px" }} align="center">{row.earnings}</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontFamily: "Raleway, Roboto", fontSize: "15px", color: row.profitLoss >= 0 ? 'green' : 'red' }} align="center">
                    {row.profitLoss}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Raleway, Roboto", fontSize: "15px" }} align="center">{row.percentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={results.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </CardContent>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default UnrealisedProfit;