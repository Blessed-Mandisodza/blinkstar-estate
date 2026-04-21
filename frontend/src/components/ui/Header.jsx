import React, { useState } from "react";
import bsLogo from "../../bs.png";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Properties", path: "/properties" },
  { label: "Map", path: "/map" },
  { label: "Mortgage", path: "/mortgage" },
  { label: "Agents", path: "/agents" },
];

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
  };
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };
  const handleDashboard = () => {
    handleMenuClose();
    navigate("/dashboard");
  };
  const handleNav = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <Box
            component="img"
            src={bsLogo}
            alt="Logo"
            sx={{ height: 55, width: 55, mr: 1 }}
          />
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: 1 }}>
            BlinkStar Properties
          </Typography>
        </Box>
        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              <Box sx={{ width: 220, p: 2 }}>
                <List>
                  {navLinks.map((link) => (
                    <ListItem
                      button
                      key={link.label}
                      onClick={() => handleNav(link.path)}
                    >
                      <ListItemText primary={link.label} />
                    </ListItem>
                  ))}
                  {!user && window.location.pathname !== "/properties" ? (
                    <>
                      <ListItem button onClick={() => handleNav("/signin")}>
                        <ListItemText primary="Sign In" />
                      </ListItem>
                      <ListItem button onClick={() => handleNav("/signup")}>
                        <ListItemText primary="Sign Up" />
                      </ListItem>
                    </>
                  ) : user ? (
                    <>
                      <ListItem button onClick={() => handleNav("/favorites")}>
                        <ListItemText primary="Saved Properties" />
                      </ListItem>
                      <ListItem
                        button
                        onClick={() => handleNav("/saved-searches")}
                      >
                        <ListItemText primary="Saved Searches" />
                      </ListItem>
                      <ListItem button onClick={handleProfile}>
                        <ListItemText primary="Profile" />
                      </ListItem>
                      <ListItem button onClick={handleLogout}>
                        <ListItemText primary="Logout" />
                      </ListItem>
                    </>
                  ) : null}
                </List>
              </Box>
            </Drawer>
            {user && (
              <Tooltip title={user?.name || user?.email || "Account"}>
                <IconButton
                  onClick={handleAvatarClick}
                  size="large"
                  sx={{ ml: 1 }}
                >
                  <Avatar>
                    {(
                      user?.name?.[0] || user?.email?.[0] || "U"
                    ).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            )}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleDashboard}>Dashboard</MenuItem>
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Box display="flex" alignItems="center" gap={2}>
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  color="inherit"
                  onClick={() => navigate(link.path)}
                >
                  {link.label}
                </Button>
              ))}
              {user && (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/favorites")}
                    sx={{ fontWeight: 600 }}
                  >
                    Saved
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/saved-searches")}
                    sx={{ fontWeight: 600 }}
                  >
                    Alerts
                  </Button>
                </>
              )}
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              {!user && window.location.pathname !== "/properties" ? (
                <>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={() => navigate("/signin")}
                  >
                    Sign In
                  </Button>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => navigate("/signup")}
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  <Tooltip title={user?.name || user?.email || "Account"}>
                    <IconButton
                      onClick={handleAvatarClick}
                      size="large"
                      sx={{ ml: 1 }}
                    >
                      <Avatar>
                        {(
                          user?.name?.[0] || user?.email?.[0] || "U"
                        ).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <MenuItem onClick={handleDashboard}>Dashboard</MenuItem>
                    <MenuItem onClick={handleProfile}>Profile</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
