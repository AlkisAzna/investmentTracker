import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Button,
  Tooltip,
  MenuItem,
  Menu,
  Avatar,
} from "@mui/material";
import logo from "../assets/img/App_Logo.png";
import { fetchUserFunds } from "../api/apiCalls";

const pages = ["Dashboard", "Assets", "Portfolio", "Virtual Trade", "FAQ"];
const settings = ["Profile", "Logout"];

function Navbar() {
  const navigate = useNavigate();
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [profileImage, setProfileImage] = useState("/static/images/avatar/2.jpg");
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [userName, setUsername] = useState("Username");

  // Utility function to check if user is logged in
  const isLoggedIn = () => localStorage.getItem("user") !== null;

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/");
    } else {
      fetchUserFunds().then((data) => {
        setPortfolioValue(data.amount);
      });

      const user = JSON.parse(localStorage.getItem("user"));
      setUsername(user.username);
      setProfileImage(user.profile_picture || "/static/images/avatar/2.jpg");
    }
  }, []);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogoClick = () => {
    if (isLoggedIn()) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleNavButtonClick = (page) => {
    if (isLoggedIn()) {
      if (page === "Virtual Trade"){
          navigate('/virtualtrade');
      }else{
        navigate(`/${page.toLowerCase()}`);
      }
    } else {
      navigate("/");
    }
  };

  const handleSettingsClick = (setting) => {
    if (setting === "Logout") {
      localStorage.removeItem("user");
      navigate("/");
    } else {
      navigate(`/${setting.toLowerCase()}`);
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        marginBottom: "20px",
        background: "linear-gradient(135deg, #0d432a, #2c774f, #3c9d70)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <IconButton onClick={handleLogoClick}>
            <img src={logo} alt="Logo" style={{ maxHeight: "80px" }} />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => handleNavButtonClick(page)}
                sx={{
                  my: 2,
                  color: "white",
                  fontSize: "16px",
                  display: "block",
                  fontFamily: "Raleway",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "white",
                    color: "#105937",
                  },
                }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              fontSize: "18px",
              flexGrow: 0.3,
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              color: "white",
              fontFamily: "Raleway",
            }}
          >
            Total USD in Portfolio: {portfolioValue}
          </Typography>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              fontWeight: "bold",
              fontSize: "18px",
              flexGrow: 0.05,
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              color: "white",
              fontFamily: "Raleway",
            }}
          >
            {userName}
          </Typography>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User Avatar" src={profileImage} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => handleSettingsClick(setting)}
                >
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
