import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import axios from 'axios';
import { fetchUserAssets } from '../api/apiCalls';
import Decimal from 'decimal.js';
import { format } from 'date-fns';

const AssetPerformance = () => {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [userAssets, setUserAssets] = useState([]);
  const [assetDetails, setAssetDetails] = useState(null);

  useEffect(() => {
    fetchUserAssets().then(data => {
      setUserAssets(data);
      if (data.length > 0) {
        setSelectedAsset('');
        fetchAssetDetails(data[0].asset_name);
      }
    });
  }, []);

  // Adjust date to the last business day
  const adjustDate = (date) => {
    let adjustedDate = new Date(date);
    const day = adjustedDate.getDay();
  
    if (day === 0) { // Sunday
      adjustedDate.setDate(adjustedDate.getDate() - 2);
    } else if (day === 1) { // Monday
      adjustedDate.setDate(adjustedDate.getDate() - 3);
    } else { // Tuesday to Saturday
      adjustedDate.setDate(adjustedDate.getDate() - 1);
    }
  
    return format(adjustedDate, 'yyyy-MM-dd');
  };

  const fetchAssetDetails = async (assetName) => {
    const asset = userAssets.find(a => a.asset_name === assetName);
    if (!asset) {
      console.error("Selected asset not found in user assets.");
      return;
    }
  
    const assetType = asset.category.toLowerCase();
    const date = assetType === 'crypto' ? format(new Date(), 'yyyy-MM-dd') : adjustDate(new Date());
    const apiUrl = assetType === 'crypto'
      ? `https://api.polygon.io/v1/open-close/crypto/${assetName}/USD/${date}?apiKey=5n7Eiuj0pJIaQiogr0QvD7uhhB2uL4ci`
      : `https://api.polygon.io/v1/open-close/${assetName}/${date}?apiKey=5n7Eiuj0pJIaQiogr0QvD7uhhB2uL4ci`;
  
    try {
      const response = await axios.get(apiUrl);
      if (response.data && response.data.close && !isNaN(response.data.close)) {
        const currentPrice = new Decimal(response.data.close);
        const quantity = new Decimal(asset.quantity);
        const totalValue = new Decimal(asset.total_value);
  
        const currentValue = currentPrice.times(quantity).toFixed(2);
        const profit = currentPrice.times(quantity).minus(totalValue).toFixed(2);
        const profitPercentage = currentPrice.times(quantity).minus(totalValue).dividedBy(totalValue).times(100).toFixed(2);
  
        setAssetDetails({
          assetName,
          investment: totalValue.toFixed(2),
          quantity: quantity.toFixed(2),
          currentValue,
          profit,
          profitPercentage
        });
      }
    } catch (error) {
      console.error("Error fetching current asset value:", error);
    }
  };

  const handleAssetChange = (event) => {
    setSelectedAsset(event.target.value);
    fetchAssetDetails(event.target.value);
  };

  return (
    <Container maxWidth="md">
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography sx={{marginBottom: '15px'}} variant="h5" gutterBottom>
            Asset Performance
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="asset-select-label">Asset</InputLabel>
            <Select
              labelId="asset-select-label"
              value={selectedAsset}
              label="Asset"
              onChange={handleAssetChange}
            >
              {userAssets.map((asset) => (
                <MenuItem key={asset.id} value={asset.asset_name}>{asset.asset_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {assetDetails && (
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
              <Table aria-label="Asset Performance Table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'green', '& th': { color: 'white' } }}>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: "Raleway, Roboto"}} align="center">Asset</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: "Raleway, Roboto"}} align="center">Investment</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: "Raleway, Roboto" }} align="center">Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: "Raleway, Roboto" }} align="center">Current Value</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: "Raleway, Roboto"}} align="center">Profit/Loss</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: "Raleway, Roboto" }} align="center">Percentage (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="center">{assetDetails.assetName}</TableCell>
                    <TableCell align="center">${assetDetails.investment}</TableCell>
                    <TableCell align="center">{assetDetails.quantity}</TableCell>
                    <TableCell align="center">${assetDetails.currentValue}</TableCell>
                    <TableCell align="center" sx={{ color: assetDetails.profit.startsWith('-') ? 'error.main' : 'success.main' }}>
                      ${assetDetails.profit}
                    </TableCell>
                    <TableCell align="center" sx={{ color: assetDetails.profitPercentage.startsWith('-') ? 'error.main' : 'success.main' }}>
                      {assetDetails.profitPercentage}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AssetPerformance;
