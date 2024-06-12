import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogContent
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import logo from "../assets/img/App_Logo.png";
import { RESET_PASSWORD_URL } from '../api/constants';
import axios from "axios";

const ResetPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Save original styles to revert on component unmount
    const originalBodyStyle = document.body.style.cssText;
    const originalHtmlStyle = document.documentElement.style.cssText;

    // Apply gradient background to the body for full page coverage
    document.documentElement.style.cssText = "height: 100%;";
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

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    phone_number: "",
    password: "",
    confirmPassword: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });

    // Dynamically validate inputs
    const newErrors = { ...formErrors };
    if (value.trim() === '') {
      newErrors[name] = `${name.replace(/_/g, ' ')} is required`;
    } else {
      delete newErrors[name];
    }

    if (name === 'email' && value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i.test(value)) {
      newErrors[name] = "Invalid email format";
    }

    if (name === 'phone_number' && value && !/^\d{10}$/.test(value)) {
      newErrors[name] = "Phone number must be 10 digits";
    }

    if (name === 'password' && value && value.length < 8) {
      newErrors[name] = "Password must be at least 8 characters";
    } else if (name === 'password' && formData.confirmPassword && formData.confirmPassword !== value) {
      newErrors['confirmPassword'] = "Passwords do not match";
    }

    if (name === 'confirmPassword' && formData.password && value !== formData.password) {
      newErrors[name] = "Passwords do not match";
    }

    setFormErrors(newErrors);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const errorMessage = Object.values(errors).join(', ');
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      return;
    }
  
    try {
      const response = await axios.post(RESET_PASSWORD_URL, {
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
      });
  
      if (response.data) {
        setShowSuccessPopup(true);
        setSnackbar({ open: true, message: 'Password reset successful', severity: 'success' });
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        throw new Error("Reset password failed");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setSnackbar({
        open: true,
        message: 'Failed to reset password. ' + (error.response ? error.response.data.error : error.message),
        severity: 'error'
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.username) {
      errors.username = "Username is required";
    }

    if (!formData.phone_number) {
      errors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      errors.phone_number = "Phone number must be 10 digits";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleReturn = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog open={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} PaperProps={{ style: { backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)', borderRadius: 16, } }}>
        <DialogContent style={{ padding: '40px' }}>
          <Card sx={{ padding: '20px', minWidth: 400, borderRadius: 10, boxShadow: 6 }}>
            <CardContent>
              <Typography variant="h5" component="div" sx={{ mb: 2, fontWeight: 'bold', color: '#2c774f' }}>
                Reset Password Successful!
              </Typography>
              <Typography variant="body2">
                Your password has been reset. You will be redirected to login shortly.
              </Typography>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
      <form encType="multipart/form-data" onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "center" }}>
            <Box sx={{ maxWidth: 250, maxHeight: 250 }}>
              <img src={logo} alt="App Logo" style={{ width: "100%", height: "100%" }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, maxWidth: 500, width: '100%', borderRadius: "16px", boxShadow: "8px 10px 18px 0px rgba(0,0,0,0.3)" }}>
            <CardContent>
            <Typography sx={{ fontSize: "30px", fontFamily: "Raleway, Roboto", mb: 4, textAlign: 'center' }} variant="h5">
                Reset Password
            </Typography>
            <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
            />
            <TextField
                label="Username"
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
                label="Phone Number"
                variant="outlined"
                fullWidth
                margin="normal"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                error={!!formErrors.phone_number}
                helperText={formErrors.phone_number}
            />
            <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                margin="normal"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
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
            <TextField
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                margin="normal"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
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
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                variant="contained"
                sx={{
                    fontFamily: "Raleway, Roboto",
                    padding: "10px 30px",
                    bgcolor: "green",
                    margin: '10px',
                    borderRadius: "20px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    color: "white",
                    "&:hover": {
                    bgcolor: "white",
                    color: "green",
                    borderColor: "darkgreen",
                    },
                }}
                type="submit"
                >
                Reset Password
                </Button>
                <Button
                    variant="contained"
                    sx={{
                      fontFamily: "Raleway, Roboto",
                      padding: "15px 30px",
                      bgcolor: "green",
                      margin: '10px',
                      borderRadius: "20px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "white",
                        color: "green",
                        borderColor: "darkgreen",
                      },
                    }}
                    onClick={handleReturn}
                  >
                    Return to Home
                  </Button>
            </Box>
            </CardContent>
        </Card>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default ResetPassword;
