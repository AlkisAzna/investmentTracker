import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  IconButton,
  Box,
  Avatar,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import { PhotoCamera, Visibility, VisibilityOff } from '@mui/icons-material';
import logo from '../assets/img/App_Logo.png';
import UserAssets from "../components/UserAssets";
import Navbar from '../components/Navbar';
import axios from 'axios';
import { PROFILE_URL } from '../api/constants';

const Profile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    firstname: '',
    last_name: '',
    email: '',
    phone_number: '',
    country: '',
    birth_date: '',
    username: '',
    profile_picture: logo,
  });
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(PROFILE_URL, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        localStorage.setItem('user', JSON.stringify(response.data));
        const { email, phone_number, country, birth_date, username, first_name, last_name, profile_picture } = response.data;
        
        setProfileData({
          first_name,
          last_name,
          email,
          phone_number,
          country,
          birth_date,
          username,
          profile_picture: profile_picture || logo,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };


  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setProfileData((prevData) => ({
        ...prevData,
        profile_picture: reader.result,
      }));
    };
  };

  const validateProfileForm = () => {
    const errors = {};
    if (!profileData.email) {
      errors.email = 'Email is required';
    }
    if (!profileData.phone_number) {
      errors.phone_number = 'Phone number is required';
    }
    if (!profileData.country) {
      errors.country = 'Country is required';
    }
    if (!profileData.birth_date) {
      errors.birth_date = 'Birth date is required';
    }
    if (!profileData.username) {
      errors.username = 'Username is required';
    }
    return errors;
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordData.password) {
      errors.password = 'Password is required';
    } else if (passwordData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Confirm Password is required';
    } else if (passwordData.password !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleSaveProfile = async () => {
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSnackbar({
        open: true,
        message: Object.values(errors).join(', '),
        severity: 'error'
      });
      return;
    }
    try {
      const formDataObject = new FormData();
      for (const key in profileData) {
        formDataObject.append(key, profileData[key]);
      }
      await axios.put(PROFILE_URL, formDataObject, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating profile: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleSavePassword = async () => {
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSnackbar({
        open: true,
        message: Object.values(errors).join(', '),
        severity: 'error'
      });
      return;
    }
    try {
      await axios.put(PROFILE_URL, passwordData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSnackbar({
        open: true,
        message: 'Password updated successfully',
        severity: 'success'
      });
      // Clear the password fields
      setPasswordData({
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating password: ' + error.message,
        severity: 'error'
      });
    }
  };


  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <Navbar position="static" />
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ boxShadow: '0 8px 18px 0 rgba(0,0,0,0.3)', borderRadius: '16px' }}>
              <CardContent>
                <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                  <Avatar src={profileData.profile_picture} sx={{ width: 200, height: 200, boxShadow: 3, borderRadius: '50%' }} />
                  <IconButton color="primary" aria-label="upload picture" component="label" sx={{ mt: 1 }}>
                    <input hidden accept="image/*" type="file" onChange={handleProfileImageUpload} />
                    <PhotoCamera />
                  </IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="First Name" 
                      InputProps={{ readOnly: true }} 
                      name="first_name" 
                      value={profileData.first_name || ''} 
                      onChange={handleProfileInputChange} 
                      fullWidth 
                      margin="normal" 
                      sx={{ bgcolor: '#f0f0f0' }} 
                    />
                  </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Last Name" 
                        InputProps={{ readOnly: true }} 
                        name="last_name" 
                        value={profileData.last_name || ''} 
                        onChange={handleProfileInputChange} 
                        fullWidth 
                        margin="normal" 
                        sx={{ bgcolor: '#f0f0f0' }} 
                      />
                    </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Username" 
                      InputProps={{ readOnly: true }} 
                      name="username" 
                      value={profileData.username || ''} 
                      onChange={handleProfileInputChange} 
                      fullWidth 
                      margin="normal" 
                      sx={{ bgcolor: '#f0f0f0' }} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Email" 
                      name="email" 
                      value={profileData.email || ''} 
                      onChange={handleProfileInputChange} 
                      fullWidth 
                      margin="normal" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Phone" 
                      name="phone_number" 
                      value={profileData.phone_number || ''} 
                      onChange={handleProfileInputChange} 
                      fullWidth 
                      margin="normal" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Country" 
                      name="country" 
                      value={profileData.country || ''} 
                      onChange={handleProfileInputChange} 
                      fullWidth 
                      margin="normal" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Birth Date" 
                      InputProps={{ readOnly: true }} 
                      name="birth_date" 
                      value={profileData.birth_date || ''} 
                      onChange={handleProfileInputChange} 
                      fullWidth 
                      margin="normal" 
                      sx={{ bgcolor: '#f0f0f0' }} 
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                  <Button sx={{ mt: 1, ...buttonStyle }} variant="contained" onClick={handleSaveProfile}>
                    Update Information
                  </Button>
                  <Button sx={{ mt: 2, ...buttonStyle }} variant="contained" onClick={handleReturnToDashboard}>
                    Return to Dashboard
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ boxShadow: '0 8px 18px 0 rgba(0,0,0,0.3)', borderRadius: '16px' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Password"
                      placeholder="Insert Password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      name="password"
                      value={passwordData.password}
                      onChange={handlePasswordInputChange}
                      error={!!formErrors.password}
                      helperText={formErrors.password}
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
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Confirm Password"
                      placeholder="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      error={!!formErrors.confirmPassword}
                      helperText={formErrors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowConfirmPassword}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                  <Button sx={{ mt: 1, ...buttonStyle }} variant="contained" onClick={handleSavePassword}>
                    Update Password
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <UserAssets />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

const buttonStyle = {
  fontFamily: 'Raleway, Roboto',
  padding: '10px 15px',
  borderRadius: '20px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  bgcolor: 'green',
  color: 'white',
  width: '60%',
  '&:hover': {
    bgcolor: 'white',
    color: 'green',
    borderColor: 'darkgreen',
  },
};

export default Profile;
