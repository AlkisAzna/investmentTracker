import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import 'chartjs-adapter-date-fns';
import { format, subDays, subWeeks, subMonths, subYears } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler);

const SelectedAssetChart = ({ selectedAsset, assetType }) => {
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeframe, setTimeframe] = useState('day');

  const calculateFromDate = () => {
    switch (timeframe) {
      case 'day':
        return format(subDays(new Date(), 50), 'yyyy-MM-dd');
      case 'week':
        return format(subWeeks(new Date(), 30), 'yyyy-MM-dd');
      case 'month':
        return format(subMonths(new Date(), 20), 'yyyy-MM-dd');
      case 'year':
        return format(subYears(new Date(), 6), 'yyyy-MM-dd');
      default:
        return format(subDays(new Date(), 10), 'yyyy-MM-dd');
    }
  };
  
  useEffect(() => {
    if (selectedAsset && assetType) {
      fetchAssetData(selectedAsset, assetType);
    }
  }, [selectedAsset, assetType, timeframe]);


  const fetchAssetData = async (asset, type) => {
    const from = calculateFromDate();
    const to = format(new Date(), 'yyyy-MM-dd');
    const apiKey = '5n7Eiuj0pJIaQiogr0QvD7uhhB2uL4ci';
    let symbol = asset.toUpperCase();
    if (type === 'crypto') {
      symbol = `X:${symbol}USD`; // Properly format the symbol for crypto assets
    }
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/${timeframe}/${from}/${to}?apiKey=${apiKey}`;

    try {
      const response = await axios.get(url);
      if (response.data && response.data.results) {
        const formattedData = response.data.results.map(item => ({
          x: item.t, // Timestamp for the X-axis
          y: item.c  // Close price for the Y-axis
        }));
        setData(formattedData);
        setErrorMessage('');
      } else {
        setErrorMessage('No data available for the selected asset.');
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching asset data:", error);
      setErrorMessage('Failed to fetch asset data. Please try again.');
      setData([]);
    }
  };

  const chartData = {
    datasets: [{
      label: `${selectedAsset} (${assetType.toUpperCase()}) Price`,
      data: data,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeframe,
          tooltipFormat: 'MMM dd, yyyy'
        },
        title: {
          display: true,
          text: 'Date'
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price (USD)'
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: '16px', boxShadow: '6px 4px 18px 8px rgba(0,0,0,0.3)' }}>
            <CardContent>
              <Typography variant="h5" align="center" fontWeight="Bold" gutterBottom>
                Asset Chart for: "{selectedAsset}"
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                <RadioGroup row value={timeframe} onChange={(e) => setTimeframe(e.target.value)} sx={{ mb: 2 }}>
                    <FormControlLabel value="hour" control={<Radio />} label="Hour" />
                    <FormControlLabel value="day" control={<Radio />} label="Day" />
                    <FormControlLabel value="week" control={<Radio />} label="Week" />
                    <FormControlLabel value="month" control={<Radio />} label="Month" />
                    <FormControlLabel value="year" control={<Radio />} label="Year" />
                </RadioGroup>
              </Box>  
              <Box sx={{ height: '500px' }}>
                <Line data={chartData} options={chartOptions} />
              </Box>
              {errorMessage && <Typography color="error" sx={{ mt: 2 }}>{errorMessage}</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SelectedAssetChart;
