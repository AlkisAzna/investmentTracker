import React, { useState } from 'react';
import { Container, Grid, Card, CardContent, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import axios from 'axios';

const fetchData = async (symbol, assetType) => {
  const apiUrl = assetType === 'crypto' ?
    `https://api.polygon.io/v2/aggs/ticker/X:${symbol}USD/prev?adjusted=true&apiKey=5n7Eiuj0pJIaQiogr0QvD7uhhB2uL4ci` :
    `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=5n7Eiuj0pJIaQiogr0QvD7uhhB2uL4ci`;

  try {
    const response = await axios.get(apiUrl);
    if (response.status === 429) {
      throw new Error("API limit reached. Try again in 1 minute.");
    }
    const results = response.data.results[0];
    const highValue = results.h;
    const closeValue = results.c;
    const openValue = results.o;
    const changePercent = ((closeValue - openValue) / openValue * 100).toFixed(2);

    return {
      symbol: symbol,
      price: closeValue.toFixed(2),
      change: `${changePercent}%`,
      highest_value: `${highValue.toFixed(2)}`
    };
  } catch (error) {
    console.error("Error fetching data for:", symbol, error);
    return {
      symbol: symbol,
      price: "API Exhausted - Try in 1 minute",
      change: "N/A",
      highest_value: "N/A"
    };
  }
};

const symbols = {
  stocks: ["AAPL", "GOOGL", "MSFT", "AMZN", "FB"],
  etfs: ["SPY", "IVV", "VTI", "VEA", "EFA"],
  crypto: ["BTC", "ETH", "XRP", "LTC", "ADA"]
};

const TopAssets = () => {
  const [selectedAssetType, setSelectedAssetType] = useState('');
  const [assetsData, setAssetsData] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);

  const loadData = async () => {
    const data = await Promise.all(
      symbols[selectedAssetType].map(symbol =>
        fetchData(symbol, selectedAssetType)
      )
    );
    setAssetsData(data);
    setDataFetched(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: '16px', boxShadow: '6px 4px 18px 8px rgba(0,0,0,0.3)' }}>
            <CardContent>
              <RadioGroup row aria-label="asset" name="row-radio-buttons-group" value={selectedAssetType} onChange={(e) => setSelectedAssetType(e.target.value)}>
                <FormControlLabel value="stocks" control={<Radio />} label="Stocks" />
                <FormControlLabel value="etfs" control={<Radio />} label="ETFs" />
                <FormControlLabel value="crypto" control={<Radio />} label="Crypto" />
              </RadioGroup>
              <Button variant="contained" color="primary" onClick={loadData} sx={{
                      fontFamily: "Raleway, Roboto",
                      padding: "10px",
                      borderRadius: "20px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      bgcolor: "green",
                      color: "white",
                      marginTop: "20px",
                      "&:hover": {
                        bgcolor: "white",
                        color: "green",
                        borderColor: "darkgreen",
                      },
                      width: { xs: "100%", sm: "30%" }}}>
                Show Data
              </Button>
              <Typography variant="h4" align="center" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                {selectedAssetType
                  ? `Most Famous ${selectedAssetType.charAt(0).toUpperCase() + selectedAssetType.slice(1)}`
                  : ""}
              </Typography>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'green' }}>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Symbol</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Change</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Highest Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {assetsData.length > 0 ? assetsData.map((row, index) => (
                      <TableRow key={row.symbol}>
                        <TableCell sx={{fontWeight: 'bold'}} align="center">{row.symbol}</TableCell>
                        <TableCell align="center">{row.price}</TableCell>
                        <TableCell sx={{fontWeight: 'bold', color: row.change.startsWith('-') ? 'red' : 'green'}} align="center">{row.change}</TableCell>
                        <TableCell align="center">{row.highest_value}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell align="center" colSpan={4}>No data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TopAssets;
