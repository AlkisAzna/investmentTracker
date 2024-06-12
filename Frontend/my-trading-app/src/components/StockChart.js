import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Grid, Card, CardContent, Typography, ToggleButton, ToggleButtonGroup, Container } from '@mui/material';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';

const StockChart = ({ symbol, from, to }) => {
  const [stockData, setStockData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('1h');

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/${timeframe}/${from}/${to}?apiKey=5n7Eiuj0pJIaQiogr0QvD7uhhB2uL4ci`);
        const { results } = response.data;
        setStockData(results);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStockData();
  }, [symbol, from, to, timeframe]);

  const handleSearch = () => {
    // Implement search functionality if needed
  };

  const handleTimeframeChange = (event, newTimeframe) => {
    if (newTimeframe) {
      setTimeframe(newTimeframe);
    }
  };

  const chartData = {
    labels: stockData.map(data => format(new Date(data.t), 'yyyy-MM-dd HH:mm')),
    datasets: [{
      label: searchTerm || symbol,
      data: stockData.map(data => data.c),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      fill: false,
    }]
  };

  const options = {
    // Chart options
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: '16px', boxShadow: '6px 4px 18px 8px rgba(0,0,0,0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField 
                  label="Search Asset" 
                  variant="outlined"
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ width: '30%', marginRight: 2, flexGrow: 1 }}
                />
                <Button variant="contained" onClick={handleSearch} sx={{ width: '20%', fontFamily: 'Raleway, Roboto', padding: '10px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', bgcolor: 'green', color: 'white', '&:hover': { bgcolor: 'white', color: "green", borderColor: 'darkgreen' }, marginRight: 2 }}>
                  Search
                </Button>
                <ToggleButtonGroup
                  color="primary"
                  value={timeframe}
                  exclusive
                  onChange={handleTimeframeChange}
                  size="small"
                  sx={{ marginLeft: '100px', flexShrink: 0 }}
                >
                  {['5m', '15m', '30m', '1h', '6h', '24h', '3d'].map(frame => (
                    <ToggleButton key={frame} value={frame}>{frame}</ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Raleway, Roboto', fontWeight: 'bold', textAlign: 'center', fontSize: '24px' }}>
                {searchTerm || symbol}
              </Typography>
              <Box sx={{ height: '500px' }}>
                <Line data={chartData} options={options} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StockChart;
