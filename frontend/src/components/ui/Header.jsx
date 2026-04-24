import React, { useState } from "react";
import bsLogo from "../../bs.png";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import BusinessIcon from "@mui/icons-material/Business";
import MapIcon from "@mui/icons-material/Map";
import CalculateIcon from "@mui/icons-material/Calculate";
import GroupsIcon from "@mui/icons-material/Groups";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SavedSearchIcon from "@mui/icons-material/SavedSearch";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTheme } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserAvatarSrc, getUserInitial } from "../../utils/userAvatar";

const navLinks = [
  { label: "Home", path: "/", icon: <HomeIcon /> },
  { label: "Properties", path: "/properties", icon: <BusinessIcon /> },
  { label: "Map", path: "/map", icon: <MapIcon /> },
  { label: "Mortgage", path: "/mortgage", icon: <CalculateIcon /> },
  { label: "Agents", path: "/agents", icon: <GroupsIcon /> },
];

const userLinks = [
  { label: "Saved Properties", path: "/favorites", icon: <FavoriteIcon /> },
  { label: "Saved Searches", path: "/saved-searches", icon: <SavedSearchIcon /> },
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Profile", path: "/profile", icon: <PersonIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));
  const showAuthButtons =
    !user && !["/signin", "/signup"].includes(location.pathname);

  const isActive = (path) =>
    path === "/"
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

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
    setDrawerOpen(false);
    logout();
    navigate("/");
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
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.96)",
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(12px)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          minHeight: { xs: 64, sm: 72 },
          width: "100%",
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2.5, sm: 3, md: 3 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <Box
            component="img"
            src={bsLogo}
            alt="Logo"
            sx={{
              height: { xs: 42, sm: 50 },
              width: { xs: 42, sm: 50 },
              mr: { xs: 0.75, sm: 1 },
              flexShrink: 0,
            }}
          />
          <Typography
            variant="h5"
            fontWeight={800}
            noWrap
            sx={{
              letterSpacing: 0,
              color: "text.primary",
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.4rem" },
              maxWidth: { xs: "calc(100vw - 138px)", sm: 320, md: "none" },
            }}
          >
            BlinkStar Properties
          </Typography>
        </Box>
        {isCompact ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {user && (
                <Tooltip title={user?.name || user?.email || "Account"}>
                  <IconButton
                    onClick={handleAvatarClick}
                    size="small"
                    aria-label="Open account menu"
                  >
                    <Avatar
                      src={getUserAvatarSrc(user)}
                      sx={{ width: 34, height: 34 }}
                    >
                      {getUserInitial(user)}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              )}
              <IconButton
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  width: 42,
                  height: 42,
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{
                sx: {
                  width: { xs: "min(86vw, 320px)", sm: 340 },
                  bgcolor: "#f8fafc",
                },
              }}
            >
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                    <Box
                      component="img"
                      src={bsLogo}
                      alt="Logo"
                      sx={{ height: 38, width: 38, mr: 1, flexShrink: 0 }}
                    />
                    <Typography fontWeight={800} noWrap sx={{ fontSize: "0.98rem" }}>
                      BlinkStar Properties
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close navigation"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>

                {user && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      py: 1.5,
                    }}
                  >
                    <Avatar
                      src={getUserAvatarSrc(user)}
                      sx={{ bgcolor: "primary.main" }}
                    >
                      {getUserInitial(user)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>
                        {user?.name || "Your account"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my: 1 }} />
                <List sx={{ py: 0 }}>
                  {navLinks.map((link) => (
                    <ListItem disablePadding key={link.label} sx={{ mb: 0.5 }}>
                      <ListItemButton
                        selected={isActive(link.path)}
                        onClick={() => handleNav(link.path)}
                        sx={{ borderRadius: 2 }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {link.icon}
                        </ListItemIcon>
                        <ListItemText primary={link.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 1 }} />
                <List sx={{ py: 0 }}>
                  {showAuthButtons ? (
                    <>
                      <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          selected={isActive("/signin")}
                          onClick={() => handleNav("/signin")}
                          sx={{ borderRadius: 2 }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <LoginIcon />
                          </ListItemIcon>
                          <ListItemText primary="Sign In" />
                        </ListItemButton>
                      </ListItem>
                    </>
                  ) : user ? (
                    <>
                      {userLinks.map((link) => (
                        <ListItem disablePadding key={link.label} sx={{ mb: 0.5 }}>
                          <ListItemButton
                            selected={isActive(link.path)}
                            onClick={() => handleNav(link.path)}
                            sx={{ borderRadius: 2 }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {link.icon}
                            </ListItemIcon>
                            <ListItemText primary={link.label} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={handleLogout}
                          sx={{ borderRadius: 2 }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <LogoutIcon />
                          </ListItemIcon>
                          <ListItemText primary="Logout" />
                        </ListItemButton>
                      </ListItem>
                    </>
                  ) : null}
                </List>
              </Box>
            </Drawer>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleDashboard}>Dashboard</MenuItem>
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={() => {
                handleMenuClose();
                navigate("/settings");
              }}>
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Box
              display="flex"
              alignItems="center"
              gap={0.5}
              sx={{ flex: 1, justifyContent: "center", minWidth: 0 }}
            >
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  color="inherit"
                  onClick={() => navigate(link.path)}
                  sx={{
                    fontWeight: isActive(link.path) ? 800 : 600,
                    px: 1.25,
                    color: isActive(link.path) ? "primary.main" : "text.primary",
                  }}
                >
                  {link.label}
                </Button>
              ))}
              {user && (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/favorites")}
                    sx={{ fontWeight: isActive("/favorites") ? 800 : 600 }}
                  >
                    Saved
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/saved-searches")}
                    sx={{ fontWeight: isActive("/saved-searches") ? 800 : 600 }}
                  >
                    Alerts
                  </Button>
                </>
              )}
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {showAuthButtons ? (
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => navigate("/signin")}
                  sx={{ fontWeight: 700 }}
                >
                  Sign In
                </Button>
              ) : user ? (
                <>
                  <Tooltip title={user?.name || user?.email || "Account"}>
                    <IconButton
                      onClick={handleAvatarClick}
                      size="large"
                      sx={{ ml: 1 }}
                    >
                      <Avatar src={getUserAvatarSrc(user)}>
                        {getUserInitial(user)}
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
                    <MenuItem onClick={() => {
                      handleMenuClose();
                      navigate("/settings");
                    }}>
                      Settings
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : null}
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
