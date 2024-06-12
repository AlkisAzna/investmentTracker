import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';
import { TRANSACTION_LIST_URL } from '../api/constants';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(TRANSACTION_LIST_URL, {
          headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setTransactions(response.data);
        setFilteredTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  const handleFilter = () => {
    let filtered = transactions;

    if (startDate) {
      filtered = filtered.filter(t => new Date(t.timestamp) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(t => new Date(t.timestamp) <= new Date(endDate));
    }

    setFilteredTransactions(filtered);
    setPage(0); // Reset to the first page after filtering
  };

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
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                onClick={handleFilter}
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
                Filter
              </Button>
            </Grid>
          </Grid>
        </Box>
        <TableContainer component={Paper}>
          <Table aria-label="Transaction history">
            <TableHead>
              <TableRow sx={{ backgroundColor: "green" }}>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontFamily: "Raleway, Roboto", fontSize: "18px" }} align="center">Asset Name</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontFamily: "Raleway, Roboto", fontSize: "18px" }} align="center">Amount</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontFamily: "Raleway, Roboto", fontSize: "18px" }} align="center">Quantity</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontFamily: "Raleway, Roboto", fontSize: "18px" }} align="center">Type</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white", fontFamily: "Raleway, Roboto", fontSize: "18px" }} align="center">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ fontFamily: "Raleway, Roboto", fontSize: "15px", fontWeight: "bold" }} align="center">{row.asset_name}</TableCell>
                  <TableCell sx={{ fontFamily: "Raleway, Roboto", fontSize: "15px" }} align="center">{parseFloat(row.amount).toFixed(2)}</TableCell>
                  <TableCell sx={{ fontFamily: "Raleway, Roboto", fontSize: "15px" }} align="center">{parseFloat(row.quantity).toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontFamily: "Raleway, Roboto", fontSize: "15px", color: row.transaction_type === 'buy' ? 'green' : 'red' }} align="center">
                    {row.transaction_type.charAt(0).toUpperCase() + row.transaction_type.slice(1)}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Raleway, Roboto", fontSize: "15px" }} align="center">{row.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
