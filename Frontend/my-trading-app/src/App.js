// App.js
import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeContext } from './header/ThemeContext';
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Assets from './pages/Assets';
import VirtualTrade from './pages/VirtualTrade';
import Portfolio from './pages/Portfolio';
import FAQ from './pages/FAQ';
import 'bootstrap/dist/css/bootstrap.min.css';
import ResetPassword from './pages/ResetPassword';

const light = createTheme({
  palette: {
    mode: 'light',

    primary: {
      main: '#16b71e',
    },
    secondary: {
      main: '#16b71e',
    },
  },
}),
dark = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#white',
    },
    primary: {
      main: '#16b71e',
    },
    secondary: {
      main: '#16b71e',
    },
  },
})

const theme = createTheme({
  typography: {
    fontFamily: [
      'Raleway',
      '"Roboto"',
      'Arial',
      'sans-serif'
    ].join(','),
  },
});

const App = () => {
  const baseUrl = "/api/v1/";
  const theme = useContext(ThemeContext)
  const darkMode = theme.state.darkMode
  return (
    <ThemeProvider theme={light}>
      <CssBaseline enableColorScheme />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/assets" element={<Assets />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/virtualtrade" element={<VirtualTrade />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/resetpassword" element={<ResetPassword />} />
    </Routes>
    </ThemeProvider>
  );
};

export default App;
