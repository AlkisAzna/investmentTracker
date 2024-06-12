import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Grid, Card, Autocomplete, CardContent, Typography, Container, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import axios from 'axios';
import { format, subDays, subWeeks, subMonths, subYears } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler);

const AssetChart = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [assetType, setAssetType] = useState('crypto');
  const [tempAssetType, setTempAssetType] = useState('crypto');
  const [timeframe, setTimeframe] = useState('hour');
  const [tempTimeframe, setTempTimeframe] = useState('hour');
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

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
        return format(subDays(new Date(), 10), 'yyyy-MM-dd'); // Default case for 'hour'
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (tempSearchTerm.length >= 1) {
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': 'f3e9fb38d3msh65ccbbb10532debp1e5dc8jsn92a0b7d6b307',
            'X-RapidAPI-Host': 'yahoo-finance127.p.rapidapi.com'
          },
          url: `https://yahoo-finance127.p.rapidapi.com/search/${tempSearchTerm}`
        };

        try {
          const response = await axios.request(options);
          if (response.status === 429) {
            throw new Error("API limit reached. Try again in 1 minute.");
          }
          const seenSymbols = new Set();
          const assets = response.data.quotes
            .map(quote => {
              let symbol = quote.symbol.split('-')[0];
              symbol = symbol.split('=')[0];
              return { ...quote, symbol, label: symbol };
            })
            .filter(quote => {
              if (seenSymbols.has(quote.symbol)) {
                return false;
              } else {
                seenSymbols.add(quote.symbol);
                return true;
              }
            });
          setSuggestions(assets);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        }
      }
    };

    fetchSuggestions();
  }, [tempSearchTerm]);

  const fetchAssetData = async (asset, assetType) => {
    const from = calculateFromDate();
    const to = format(new Date(), 'yyyy-MM-dd');
    const apiKey = '5n7Eiuj0pJIaQiogr0QvD7uhhB2uL4ci';
    let symbol = asset.toUpperCase();
    if (assetType === 'crypto') {
      symbol = `X:${symbol}USD`;
    }
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/${timeframe}/${from}/${to}?apiKey=${apiKey}`;

    try {
      const response = await axios.get(url);
      if (response.status === 429) {
        throw new Error("API limit reached. Try again in 1 minute.");
      }
      if (response.data && response.data.results) {
        const formattedData = response.data.results.map(item => ({
          x: item.t,
          y: item.c
        }));
        setData(formattedData);
        setErrorMessage('');
      } else {
        setErrorMessage('No data available for the selected asset.');
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching asset data:", error);
      setErrorMessage('Failed to fetch asset data. Please try again. Possible cause: ', error);
      setData([]);
    }
  };

  const handleSearch = () => {
    if (tempSearchTerm.trim()) {
      setSearchTerm(tempSearchTerm);
      setAssetType(tempAssetType);
      setTimeframe(tempTimeframe);
      fetchAssetData(tempSearchTerm, tempAssetType);
    } else {
      setErrorMessage('Please enter a valid asset symbol.');
    }
  };

  const handleAssetTypeChange = (event) => {
    setTempAssetType(event.target.value);
  };

  const handleTimeframeChange = (event) => {
    setTempTimeframe(event.target.value);
  };

  const handleInputChange = (event, value) => {
    setTempSearchTerm(value);
  };

  const chartData = {
    datasets: [{
      label: `${searchTerm.toUpperCase()} (${assetType.toUpperCase()})`,
      data: data,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }]
  };

  const getChartOptions = () => {
    let unit = 'hour', format = 'MMM dd, yyyy HH:mm';
    if (timeframe === 'day') {
      unit = 'day';
      format = 'MMM dd';
    } else if (timeframe === 'week') {
      unit = 'week';
      format = 'MMM dd';
    } else if (timeframe === 'month') {
      unit = 'month';
      format = 'MMM yyyy';
    } else if (timeframe === 'year') {
      unit = 'year';
      format = 'yyyy';
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: unit,
            tooltipFormat: format
          },
          title: {
            display: true,
            text: 'Time',
          },
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Price',
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
              return `${context.dataset.label}: ${context.parsed.y}`;
            }
          }
        }
      }
    };
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: '16px', boxShadow: '6px 4px 18px 8px rgba(0,0,0,0.3)' }}>
            <CardContent>
            <Typography variant="h4" align="center" fontWeight="Bold" gutterBottom>
              Browse Assets
            </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <RadioGroup row value={tempAssetType} onChange={handleAssetTypeChange}>
                  <FormControlLabel value="crypto" control={<Radio />} label="Crypto" />
                  <FormControlLabel value="stock" control={<Radio />} label="Stock" />
                  <FormControlLabel value="etf" control={<Radio />} label="ETF" />
                </RadioGroup>
                <RadioGroup row value={tempTimeframe} onChange={handleTimeframeChange} sx={{ mb: 2 }}>
                  <FormControlLabel value="hour" control={<Radio />} label="Hour" />
                  <FormControlLabel value="day" control={<Radio />} label="Day" />
                  <FormControlLabel value="week" control={<Radio />} label="Week" />
                  <FormControlLabel value="month" control={<Radio />} label="Month" />
                  <FormControlLabel value="year" control={<Radio />} label="Year" />
                </RadioGroup>

                <Autocomplete
                  freeSolo
                  options={suggestions}
                  getOptionLabel={(option) => option.label}
                  onInputChange={handleInputChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Asset"
                      variant="outlined"
                      value={tempSearchTerm}
                      fullWidth
                      onChange={(e) => setTempSearchTerm(e.target.value)}
                      sx={{ width: '500px', my: 2 }}
                    />
                  )}
                />
                <Button 
                  variant="contained" 
                  onClick={handleSearch} 
                  sx={{ 
                    fontFamily: 'Raleway, Roboto', 
                    padding: '15px 25px', 
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
                  Search Asset
                </Button>
                {errorMessage && <Typography color="error" sx={{ mt: 2 }}>{errorMessage}</Typography>}
              </Box>
              <Box sx={{ height: '500px' }}>
                <Line data={chartData} options={getChartOptions()} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AssetChart;
