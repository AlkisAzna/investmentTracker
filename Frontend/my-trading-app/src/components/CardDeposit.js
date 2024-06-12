import React, { useState } from "react";
import { Button, TextField, Box, Typography, Card, CardContent, Dialog, DialogContent } from "@mui/material";
import axios from "axios";
import { USER_FUNDS_URL } from "../api/constants";

const CardDeposit = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [amount, setAmount] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [userFunds, setUserFunds] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const isValidCardNumber = (number) => number.replace(/\s+/g, '').length === 16 && /^\d+$/.test(number.replace(/\s+/g, ''));
  const isValidCvv = (cvv) => (cvv.length === 3 || cvv.length === 4) && /^\d+$/.test(cvv);
  const hasExpired = (date) => {
    const [month, year] = date.split('/');
    const expiryDate = new Date(`20${year}-${month}-01`);
    return expiryDate < new Date();
  };
  const isPositiveAmount = (amount) => parseFloat(amount) > 0;
  

  const handleCardNumberChange = (e) => {
    let value = e.target.value;
    // Allow max 16 digits, spaces included in the visual representation (19 characters: 16 digits + 3 spaces)
    const v = value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(v.slice(0, 19));
  };

  const handleExpirationDateChange = (e) => {
    let value = e.target.value;
    // Allow max 5 characters "MM/YY"
    const v = value.replace(
      /[^0-9]/g, '' // Remove non-numeric chars
    ).replace(
      /^([2-9])$/g, '0$1' // 2 -> 02
    ).replace(
      /^(1{1})([3-9]{1})$/g, '0$1/$2' // 13 -> 01/3
    ).replace(
      /^0{1,}/g, '0' // 00 -> 0
    ).replace(
      /^([0-1]{1}[0-9]{1})([0-9]{1,2}).*/g, '$1/$2' // 113 -> 11/3
    );
    setExpirationDate(v.slice(0, 5));
  };
  
  const addFunds = async (e) => {
    e.preventDefault();
    if (!isValidCardNumber(cardNumber)) {
      setSubmitStatus("Card number must be 16 digits.");
      return;
    }
    if (hasExpired(expirationDate)) {
      setSubmitStatus("Card has expired.");
      return;
    }
    if (!isValidCvv(cvv)) {
      setSubmitStatus("CVV must be 3 or 4 digits.");
      return;
    }
    if (!isPositiveAmount(amount)) {
      setSubmitStatus("Amount must be positive.");
      return;
    }

    try {
      const response = await axios.post(
        USER_FUNDS_URL,
        { amount: parseFloat(amount) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}` // Ensure you have a token management strategy
          },
        }
      );
      setUserFunds(userFunds + parseFloat(amount));
      setAmount(""); // Clear the amount field after successful submission
      setShowSuccessPopup(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error adding funds:", error);
      setSubmitStatus("Error adding funds. Please try again.");
    }
  };

  return (
    <Card sx={{
        p: 3,
        borderRadius: "16px",
        boxShadow: "6px 4px 18px 8px rgba(0,0,0,0.3)",
     }}>
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
                Deposit Successful!
              </Typography>
              <Typography variant="body2">
                The page will be refreshed to show the new amount!
              </Typography>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
      <CardContent>
        <Typography variant="h5" sx={{  fontFamily: "Raleway, Roboto", fontWeight: 'bold', mb: 2, textAlign: "center" }}>
          Add Funds
        </Typography>
        <Box component="form" onSubmit={addFunds} noValidate sx={{ mt: 1 }}>
        <TextField
            margin="normal"
            required
            fullWidth
            id="cardNumber"
            label="Card Number"
            name="cardNumber"
            sx={{ fontFamily: "Raleway, Roboto"}}
            autoComplete="cc-number"
            placeholder="XXXX XXXX XXXX XXXX"
            value={cardNumber}
            onChange={handleCardNumberChange}
            autoFocus
          />
          <TextField
            margin="normal"
            sx={{ fontFamily: "Raleway, Roboto"}}
            required
            fullWidth
            name="expirationDate"
            label="Expiration Date"
            placeholder="MM/YY"
            value={expirationDate}
            onChange={handleExpirationDateChange}
            autoComplete="cc-exp"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            sx={{ fontFamily: "Raleway, Roboto"}}
            name="cvv"
            label="CVV"
            onChange={(e) => setCvv(e.target.value)}
            autoComplete="cc-csc"
          />
           <TextField
                margin="normal"
                required
                fullWidth
                sx={{ fontFamily: "Raleway, Roboto"}}
                id="cardHolderName"
                placeholder="First Name and Last Name"
                label="Full Name"
                name="cardHolderName"
                autoComplete="cc-name"
                />
          <TextField
            margin="normal"
            required
            fullWidth
            id="amountToAdd"
            sx={{ fontFamily: "Raleway, Roboto"}}
            label="Amount"
            name="amount"
            onChange={(e) => setAmount(e.target.value)}
            type="number"
          />
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
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
                }}
            >
                Deposit Funds
            </Button>
            </Box>
          {submitStatus && (
            <Typography color="textSecondary" sx={{ mt: 2, textAlign: "center" }}>
              {submitStatus}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CardDeposit;
