import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import axios from 'axios';
import SelectedAssetChart from '../components/SelectedAssetChart';
import Navbar from '../components/Navbar';

const Assets = () => {
  const [selectedAssetType, setSelectedAssetType] = useState('stocks');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [assetsData, setAssetsData] = useState({
    stocks: [],
    crypto: []
  });

  const assetOptions = {
    crypto: ["BTC", "ETH", "XRP", "LTC", "ADA", "SOL", "DOT", "DOGE", "UNI", "LINK"],
    stocks: ["AAPL", "XNK", "MSFT", "GAT", "FB", "BABA", "NFLX", "TSLA", "WMT", "PG"]
  };

  useEffect(() => {
    fetchAssetsData();
    setSelectedAsset(''); 
  }, [selectedAssetType]);

  const fetchAssetsData = async () => {
    const apiKey = '4b2290ab-1e41-4c79-892f-c75ca87802d4';
    try {
      const response = await axios({
        method: 'get',
        url: 'https://rest.coinapi.io/v1/exchangerate/USD?invert=true',
        headers: {
          'Accept': 'application/json',
          'X-CoinAPI-Key': apiKey
        }
      });
      const rates = response.data.rates;
      // Filter rates to include only those in assetOptions for the selected asset type
      const relevantAssets = rates.filter(rate =>
        assetOptions[selectedAssetType].includes(rate.asset_id_quote.replace('$', ''))
      );
     
      // Map the filtered data to update state with name, price, and date
      const mappedAssets = relevantAssets.map(asset => ({
        name: asset.asset_id_quote,
        price: asset.rate.toFixed(2),
        date: new Date(asset.time).toLocaleDateString()
        }));

        setAssetsData(prevData => ({
            ...prevData,
            [selectedAssetType]: mappedAssets // Correctly update only the selected asset type's array
        }));
        console.log(assetsData);
    } catch (error) {
      console.error('Failed to fetch asset data:', error);
    }
  };

  const handleShowGraph = (assetName) => {
    setSelectedAsset({name: assetName, type: selectedAssetType});
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', fontFamily: 'Raleway, Roboto', justifyContent: 'center', display: 'flex', mb: 4 }}>Asset List</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card sx={{ justifyContent: 'Center', display: 'flex', p: 3, borderRadius: '16px', boxShadow: '6px 4px 18px 0px rgba(0,0,0,0.3)' }}>
              <CardContent>
                <Typography variant="h5" sx={{ justifyContent: 'center', display: 'flex', fontFamily: 'Raleway, Roboto' }}>Select Asset Type</Typography>
                {['stocks', 'crypto'].map((type) => (
                  <Button
                    key={type}
                    variant="outlined"
                    onClick={() => setSelectedAssetType(type)}
                    sx={{
                      margin: '15px',
                      fontFamily: 'Raleway, Roboto',
                      padding: '15px 30px',
                      borderRadius: '20px',
                      textTransform: 'none',
                      color: selectedAssetType === type ? 'green' : 'white',
                      bgcolor: selectedAssetType === type ? 'white' : 'green',
                      border: selectedAssetType === type ? '2px solid green' : 'none',
                      '&:hover': {
                        bgcolor: selectedAssetType === type ? 'white' : '#004d40',
                        color: selectedAssetType === type ? 'green' : 'white',
                        borderColor: selectedAssetType === type ? 'darkgreen' : 'none'
                      }
                    }}
                  >
                    {type.toUpperCase()}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ p: 3, borderRadius: '16px', boxShadow: '6px 4px 18px 0px rgba(0,0,0,0.3)' }}>
              <CardContent>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="assets table">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'green' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: 'white', fontFamily: 'Raleway, Roboto', fontSize: '18px' }} align="center">Asset Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'white', fontFamily: 'Raleway, Roboto', fontSize: '18px' }} align="center">Price</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'white', fontFamily: 'Raleway, Roboto', fontSize: '18px' }} align="center">Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'white', fontFamily: 'Raleway, Roboto', fontSize: '18px' }} align="center">Chart</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assetsData[selectedAssetType].map((asset) => (
                        <TableRow key={asset.name} hover>
                          <TableCell sx={{ fontWeight: 'bold', fontFamily: 'Raleway, Roboto', fontSize: '15px' }} align="center" component="th" scope="row">{asset.name}</TableCell>
                          <TableCell sx={{ fontFamily: 'Raleway, Roboto', fontSize: '15px' }} align="center">{asset.price}</TableCell>
                          <TableCell sx={{ fontFamily: 'Raleway, Roboto', fontSize: '15px' }} align="center">{asset.date}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontFamily: 'Raleway, Roboto', fontSize: '15px' }} align="center">
                            <Button
                              variant="contained"
                              sx={{
                                fontFamily: "Raleway, Roboto",
                                padding: "10px",
                                borderRadius: "20px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                bgcolor: "green",
                                color: "white",
                                "&:hover": {
                                bgcolor: "white",
                                color: "green",
                                borderColor: "darkgreen",
                                },
                                width: { xs: "100%", sm: "60%" },
                            }}
                              onClick={() => handleShowGraph(asset.name)}
                            >
                              Show Chart
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            {selectedAsset && (
              <SelectedAssetChart selectedAsset={selectedAsset.name} assetType={selectedAsset.type} />
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Assets;
