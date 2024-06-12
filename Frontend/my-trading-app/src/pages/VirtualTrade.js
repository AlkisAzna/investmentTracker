import React, { useState, useEffect, useRef} from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  TextField,
  Box,
  MenuItem,
  Snackbar, Alert, Dialog,  DialogContent
} from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar";
import { TRANSACTION_CREATE_URL } from "../api/constants";
import { fetchUserFunds, fetchUserAssets } from "../api/apiCalls";
import UserAssets from "../components/UserAssets";
import CardDeposit from "../components/CardDeposit";
import { format } from 'date-fns';

const VirtualTrade = () => {
  const [tradeType, setTradeType] = useState("sell");
  const [assetType, setAssetType] = useState("crypto");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [userAssets, setUserAssets] = useState([]);
  const [portfolioValue, setPortfolioValue] = React.useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [maxQuantity, setMaxQuantity] = useState(0);
  const quantityInputRef = useRef(null);

  const handleSetMaxQuantity = () => {
    if (tradeType === 'sell' && selectedAsset) {
      setQuantity(maxQuantity);
      if (quantityInputRef.current) {
        quantityInputRef.current.focus();
      }
    }
  };

  const topAssets = {
    crypto: ["BTC", "ETH", "XRP", "LTC", "ADA", "SOL", "DOT", "DOGE", "UNI", "LINK", "BNB", "USDC", "XLM", "TRX", "EOS"],
    etf: ["SPY", "IVV", "VTI", "VEA", "EFA", "IEFA", "VWO", "QQQ", "VUG", "IEMG", "ARKK", "XLE", "XLF", "XLK", "XLU"],
    stocks: ["AAPL", "GOOGL", "MSFT", "AMZN", "FB", "BABA", "NFLX", "TSLA", "BRK.B", "V", "JNJ", "WMT", "VZ", "PG", "DIS"]
  };

   // Fetch user's assets only once on component mount
   useEffect(() => {
      fetchUserAssets().then(response => {
        setUserAssets(response.map(asset => ({ name: asset.asset_name, id: asset.id, quantity: asset.quantity })));
      }).catch(error => {
        console.error("Error fetching user assets:", error);
      });
    }, []);

  useEffect(() => {
    if (price > 0 && quantity > 0) {
        setTotalPrice(price * quantity);
    } else {
        setTotalPrice(0);
    }
}, [price, quantity, selectedAsset, tradeType]);

  useEffect(() => {
    // Fetch user funds
    const fetchFunds = async () => {
      try {
        const response = await fetchUserFunds(); // Use API function to fetch funds
        setPortfolioValue(response.amount);
      } catch (error) {
        console.error("Error fetching user funds:", error);
      }
    };
    fetchFunds();
  }, [portfolioValue, setPortfolioValue]);

  const handleTradeTypeChange = (event) => {
    const newTradeType = event.target.value;
    setTradeType(newTradeType);
    setSelectedAsset("");
    setQuantity(0);
    setTotalPrice(0);

    if (newTradeType === 'sell') {
      fetchUserAssets().then(response => {
        setUserAssets(response.map(asset => ({ name: asset.asset_name, id: asset.id, quantity: asset.quantity })));
      }).catch(error => {
        console.error("Error fetching user assets:", error);
      });
    } else {
      setUserAssets(topAssets[assetType].map(asset => ({ name: asset })));
    }
  };

  const handleAssetTypeChange = (event) => {
    const newAssetType = event.target.value;
    setAssetType(newAssetType);
    setSelectedAsset("");
    setTotalPrice(0);
    setQuantity(0);

    if (tradeType === 'buy') {
      setUserAssets(topAssets[newAssetType].map(asset => ({ name: asset })));
    }
  };

  const handleAssetChange = (event) => {
    const assetName = event.target.value;
    setSelectedAsset(assetName);
    setTotalPrice(0);
    setQuantity(0);
  
    if (tradeType === "sell") {
      const asset = userAssets.find(asset => asset.name === assetName);
      if (asset) {
        setMaxQuantity(asset.quantity);
      } else {
        setMaxQuantity(0);
      }
  
      // Update assetType based on the selected asset for sell
      if (topAssets.crypto.includes(assetName)) {
        setAssetType('crypto');
      } else if (topAssets.etf.includes(assetName)) {
        setAssetType('etf');
      } else if (topAssets.stocks.includes(assetName)) {
        setAssetType('stocks');
      }
    } else {
      setMaxQuantity(0);
    }
  };

  const handleQuantityChange = (event) => {
    const inputQuantity = event.target.value;
    if (assetType === 'crypto') {
      const quantityValue = parseFloat(inputQuantity);
      if (!isNaN(quantityValue) && quantityValue >= 0) {
        setQuantity(quantityValue);
        setError(null);
      } else {
        setError("Quantity must be a positive number.");
      }
    } else {
      if (inputQuantity.includes('.')) {
        setError("Only whole numbers are allowed for stocks and ETFs.");
      } else {
        const quantityValue = parseInt(inputQuantity, 10);
        if (!isNaN(quantityValue) && quantityValue >= 0) {
          setQuantity(quantityValue);
          setError(null);
        } else {
          setError("Quantity must be a positive integer.");
        }
      }
    }
  };

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
  

  const fetchPrice = async () => {
    if (!selectedAsset || quantity <= 0) {
      setError("Please select an asset and set a quantity greater than zero.");
      return;
    }
    setLoading(true);
    setError("");
    const date = assetType === 'crypto' ? format(new Date(), 'yyyy-MM-dd'): adjustDate(new Date());
    const symbol = selectedAsset;
    const apiUrl = assetType === 'crypto' ?
      `https://api.polygon.io/v1/open-close/crypto/${symbol}/USD/${date}?apiKey=5n7Eiuj0pJIaQiogr0QvD7uhhB2uL4ci` :
      `https://api.polygon.io/v1/open-close/${symbol}/${date}?apiKey=5n7Eiuj0pJIaQiogr0QvD7uhhB2uL4ci`;

    try {
      const response = await axios.get(apiUrl);
      if (response.data && response.data.close && !isNaN(response.data.close)) {
        const newPrice = assetType === 'crypto' ?
          parseFloat(Math.max(...response.data.closingTrades.map(trade => trade.p))).toFixed(3) :
          parseFloat(response.data.close).toFixed(3);
        setPrice(newPrice);
        setTotalPrice(parseFloat(newPrice * quantity).toFixed(3));
      } else {
        setError("Failed to fetch valid price data.");
        setPrice(0); // Reset price if API fails to return valid data
        setTotalPrice(0);
      }
    } catch (error) {
      setError(`Failed to fetch price: ${error.message}`);
      setPrice(0);
      setTotalPrice(0);
      setSnackbar({
        open: true,
        message: `Failed to fetch price: ${error.message}`,
        severity: 'error',
      });
    }

    setLoading(false);
  };

  const executeTrade = async () => {
    if (!totalPrice || totalPrice <= 0) {
      alert("Price not set or invalid. Please fetch the price before executing the trade.");
      return;
    }
    
    if (error) {
      alert(error);
      return;
    }

    if (totalPrice > portfolioValue && tradeType === "Buy") {
      alert("Insufficient funds to complete this trade.");
      return;
    }
    console.log(totalPrice);
    try {
      const response = await axios.post(
        TRANSACTION_CREATE_URL,
        {
          asset_name: selectedAsset,
          quantity: quantity,
          amount: Math.round(totalPrice * 100) / 100,
          timestamp: new Date().toISOString(),
          transaction_type: tradeType,
          category: assetType
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data);
      // Show success popup before redirecting
      setShowSuccessPopup(true);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error executing trade:", error);
      alert(`Error executing trade: ${error.message}`);
    }
  };
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
      <Snackbar open={snackbar.open} autoHideDuration={10000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
          open={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          PaperProps={{
            style: {
              backgroundColor: '#fff',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              borderRadius: 16,
            },
          }}
        >
          <DialogContent style={{ padding: '40px' }}>
            <Card sx={{ padding: '20px', minWidth: 400, borderRadius: 10, boxShadow: 6 }}>
              <CardContent>
                <Typography variant="h5" component="div" sx={{ mb: 2, fontWeight: 'bold', color: '#2c774f' }}>
                  Transaction Completed
                </Typography>
                <Typography variant="body2">
                  Dashboard will be updated. Email with information sent!
                </Typography>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
        <Grid container spacing={5} justifyContent="space-between">
          <Grid item xs={12} md={8}>
            <UserAssets />
          </Grid>
          <Grid item xs={12} md={4}>
            <CardDeposit />
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ p: 3, borderRadius: "16px", boxShadow: "6px 4px 18px 8px rgba(0,0,0,0.3)" }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>Virtual Trade</Typography>
                <Typography
                  variant="body1"
                  sx={{ fontFamily: "Raleway, Roboto" }}
                >
                  <Box component="span" sx={{ fontWeight: 'bold' }}>
                    Total USD in Portfolio:
                  </Box>
                  {` ${portfolioValue}`}
                </Typography>
                <RadioGroup row value={tradeType} onChange={handleTradeTypeChange} sx={{ mt: 2 }}>
                  <FormControlLabel value="buy" control={<Radio />} label="Buy" />
                  <FormControlLabel value="sell" control={<Radio />} label="Sell" />
                </RadioGroup>
                <FormControl fullWidth sx={{ mt: 2 }}>
                <RadioGroup row value={assetType} onChange={handleAssetTypeChange}>
                  <FormControlLabel 
                    value="crypto" 
                    control={<Radio disabled={tradeType === 'sell'} />} 
                    label="Crypto" 
                  />
                  <FormControlLabel 
                    value="etf" 
                    control={<Radio disabled={tradeType === 'sell'} />} 
                    label="ETF" 
                  />
                  <FormControlLabel 
                    value="stocks" 
                    control={<Radio disabled={tradeType === 'sell'} />} 
                    label="Stocks" 
                  />
                </RadioGroup>
                  <TextField
                    select
                    label="Select Asset"
                    value={selectedAsset}
                    onChange={handleAssetChange}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    {userAssets.map((asset, index) => (
                      <MenuItem key={index} value={asset.name}>{asset.name}</MenuItem>
                    ))}
                  </TextField>
                  <TextField 
                      label="Quantity" 
                      type="number" 
                      value={quantity} 
                      onChange={handleQuantityChange} 
                      fullWidth 
                      sx={{ mt: 2 }} 
                      InputProps={{
                        endAdornment: (
                          <Button
                            onClick={handleSetMaxQuantity}
                            disabled={tradeType === "buy" || !selectedAsset}
                            sx={{ marginLeft: 1, padding: 0, minWidth: "auto", textTransform: "none" }}
                          >
                            Max Quantity
                          </Button>
                        )
                      }}
                      inputRef={quantityInputRef} 
                    />
                  {quantity > 0 && (
                    <TextField label="Total Price" type="text" value={totalPrice || ""} InputProps={{ readOnly: true }} fullWidth sx={{ mt: 2 }} />
                  )}
                  {error && (
                    <Box sx={{ mt: 2, color: "red" }}>
                      <Typography variant="body2">{error}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button onClick={fetchPrice} variant="contained" sx={{
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
                      width: { xs: "100%", sm: "60%" },
                    }}>
                      Calculate Price
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button onClick={executeTrade} variant="contained" sx={{
                      fontFamily: "Raleway, Roboto",
                      padding: "10px",
                      borderRadius: "20px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      bgcolor: "green",
                      color: "white",
                      marginTop: "5px",
                      "&:hover": {
                        bgcolor: "white",
                        color: "green",
                        borderColor: "darkgreen",
                      },
                      width: { xs: "100%", sm: "60%" },
                    }}>
                      Execute Trade
                    </Button>
                  </Box>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default VirtualTrade;
