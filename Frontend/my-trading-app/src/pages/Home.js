import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Typography, Button, TextField, Box, InputAdornment,
  IconButton, Snackbar, Alert, Dialog,  DialogContent } from '@mui/material';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import logo from '../assets/img/App_Logo.png';
import { LOGIN_URL, PROFILE_URL } from '../api/constants';
import { startTokenRefreshInterval } from '../api/apiCalls';


const Home = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword); // This will toggle the state between true and false
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username) {
      errors.username = 'Username is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }

    if(formData.password.length < 8){
      errors.password = 'Password must be at least 8 characters long';
    }
    return errors;
  };

  useEffect(() => {
    // Save original styles to revert on component unmount
    const originalBodyStyle = document.body.style.cssText;
    const originalHtmlStyle = document.documentElement.style.cssText;
  
    // Apply gradient background to the body for full page coverage
    document.documentElement.style.cssText = `
      height: 100%;
    `;
    document.body.style.cssText = `
      margin: 0;
      padding: 0;
      height: 100%;
      background: linear-gradient(135deg, #0d432a, #2c774f, #3c9d70);
      background-attachment: fixed;
      min-height: 100%;
    `;
  
    // Revert back to the original background when the component unmounts
    return () => {
      document.body.style.cssText = originalBodyStyle;
      document.documentElement.style.cssText = originalHtmlStyle;
    };
  }, []);
  

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await axios.post(LOGIN_URL, formData);
      console.log('Login response:', response.data);
      const { access, refresh } = response.data;

      // Save token and refresh token in localStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);

      const response2 = await axios.get(PROFILE_URL, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response2.status === 200 || response2.status === 201) {
            const user = response2.data;
            localStorage.setItem('user', JSON.stringify(user));
        }

      startTokenRefreshInterval();

      // Show success popup before redirecting
      setShowSuccessPopup(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error('Login failed:', error);
      setSnackbar({
        open: true,
        message: 'Failed to log in: Wrong username or password.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleResetPassword = () => {
    navigate('/resetpassword');
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSignIn(event);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5}}>
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
                  Login Successful!
                </Typography>
                <Typography variant="body2">
                  You will be redirected to the dashboard shortly.
                </Typography>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
        <img src={logo} alt="App Logo" style={{ maxWidth: '250px', maxHeight: '250px' }} /> {/* Adjust size as needed */}
      </Box>
      <Grid container spacing={4} justifyContent="center" alignItems="stretch" style={{ flexGrow: 1 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '6px 4px 18px 8px rgba(0,0,0,0.3)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '16px' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '30px', fontFamily: 'Raleway, Roboto' }} variant="h5" component="h2" mb={2}>
                Sign In
              </Typography>
              <TextField
                label="Username"
                autoFocus
                onKeyDown={handleKeyPress}
                placeholder="Insert Username"
                variant="outlined"
                fullWidth
                margin="normal"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                error={!!formErrors.username}
                helperText={formErrors.username}
              />
              <TextField
                label="Password"
                onKeyDown={handleKeyPress}
                placeholder="Insert Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                margin="normal"
                name="password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                value={formData.password}
                onChange={handleInputChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
              <Button variant="contained" sx={{ mt: 3, fontFamily: 'Raleway, Roboto', padding: '10px', bgcolor: 'green', borderRadius: '20px', boxShadow: 'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)', color: 'white', '&:hover': { bgcolor: 'white', color: 'green', borderColor: 'darkgreen' } }} onClick={handleSignIn} fullWidth>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '6px 4px 18px 8px rgba(0,0,0,0.3)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '16px' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography sx={{fontSize: '36px', fontFamily: 'Raleway, Roboto'}} variant="h5" component="h2" mb={4}>
                InvestmentTracker
              </Typography>
              <Typography sx={{fontSize: '20px', fontFamily: 'Raleway, Roboto'}} variant="body1" mb={3}>
                Welcome to the world of trading Stocks, Crypto, and ETFs through an easy application!
              </Typography>
              <Button variant="contained" sx={{ mb: 0, mt: 8, fontFamily: 'Raleway, Roboto' , padding: '10px', borderRadius: '20px', boxShadow: 'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)', bgcolor: 'green', color: 'white', '&:hover': { bgcolor: 'white', color: "green", borderColor: 'darkgreen' } }} onClick={handleSignUp} fullWidth>
                Sign Up
              </Button>
              <Button variant="contained" sx={{ mb: 0, mt: 2, fontFamily: 'Raleway, Roboto' , padding: '10px', borderRadius: '20px', boxShadow: 'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)', bgcolor: 'green', color: 'white', '&:hover': { bgcolor: 'white', color: "green", borderColor: 'darkgreen' } }} onClick={handleResetPassword} fullWidth>
                Reset Password
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;







