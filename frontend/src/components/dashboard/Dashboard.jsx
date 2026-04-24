import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
  Button,
  Chip,
  Alert,
  Stack,
  TextField,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  Map as MapIcon,
  Calculate as CalculateIcon,
  SavedSearch as SavedSearchIcon,
  Groups as GroupsIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import RefreshIcon from "@mui/icons-material/Refresh";
import { styled } from "@mui/material/styles";
import bsLogo from "../../bs.png";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "./PropertyCard";
import Loader from "../ui/Loader";
import { authFetch } from "../../utils/authFetch";
import AdminModeration from "./AdminModeration";
import { getUserAvatarSrc, getUserInitial } from "../../utils/userAvatar";

// Setup Socket.IO client

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    minHeight: "100vh",
    padding: theme.spacing(3),
    background: "#f6f8fb",
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    }),
  })
);

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  background: "#0b1220",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.12)",
  },
}));

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Properties", icon: <HomeIcon />, path: "/properties" },
  { text: "Saved Properties", icon: <FavoriteIcon />, path: "/favorites" },
  { text: "Saved Searches", icon: <SavedSearchIcon />, path: "/saved-searches" },
  { text: "Map", icon: <MapIcon />, path: "/map" },
  { text: "Mortgage", icon: <CalculateIcon />, path: "/mortgage" },
  { text: "Agents", icon: <GroupsIcon />, path: "/agents" },
  { text: "Profile", icon: <PersonIcon />, path: "/profile" },
  { text: "Messages", icon: <MessageIcon />, path: "/messages" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const formatInquiryDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatInquirySource = (source = "contact_form") =>
  source
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const leadStatusOptions = ["New", "Contacted", "Closed", "Archived"];

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [savingLeadId, setSavingLeadId] = useState("");
  const [leadError, setLeadError] = useState("");
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalViews: 0,
    newInquiries: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);

  const newLeadCount = inquiries.filter((inquiry) => inquiry.status === "New").length;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch user profile
        const userRes = await authFetch("/api/users/me");
        const userData = await userRes.json();
        setUser(userData);
        // Fetch user's properties
        const propRes = await authFetch(`/api/property/user/${userData._id}`);
        const propData = await propRes.json();
        setProperties(propData.properties || []);
        // Fetch dashboard statistics
        const statsRes = await authFetch(`/api/property/stats/${userData._id}`);
        const statsData = await statsRes.json();
        setStats(statsData);
        // Fetch recent enquiries
        const inquiryRes = await authFetch("/api/property/inquiries?limit=12");
        if (inquiryRes.ok) {
          const inquiryData = await inquiryRes.json();
          setInquiries(inquiryData.inquiries || []);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
      setLoading(false);
    };
    if (authUser) {
      fetchDashboardData();
    }

    // Listen for real-time property view updates

    // Listen for real-time new property listings
  }, [authUser]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const updateInquiryLocal = (inquiryId, changes) => {
    setInquiries((current) =>
      current.map((inquiry) =>
        inquiry._id === inquiryId ? { ...inquiry, ...changes } : inquiry
      )
    );
  };

  const saveInquiry = async (inquiryId, changes) => {
    setSavingLeadId(inquiryId);
    setLeadError("");

    try {
      const res = await authFetch(`/api/property/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update inquiry");
      }

      setInquiries((current) =>
        current.map((inquiry) =>
          inquiry._id === inquiryId ? data.inquiry : inquiry
        )
      );
    } catch (err) {
      setLeadError(err.message || "Failed to update inquiry");
    } finally {
      setSavingLeadId("");
    }
  };

  const removeInquiry = async (inquiryId) => {
    const confirmed = window.confirm("Remove this lead from the inbox?");

    if (!confirmed) return;

    setSavingLeadId(inquiryId);
    setLeadError("");

    try {
      const res = await authFetch(`/api/property/inquiries/${inquiryId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove inquiry");
      }

      setInquiries((current) =>
        current.filter((inquiry) => inquiry._id !== inquiryId)
      );
    } catch (err) {
      setLeadError(err.message || "Failed to remove inquiry");
    } finally {
      setSavingLeadId("");
    }
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ justifyContent: "center", py: 2 }}>
        <Typography
          variant="h6"
          noWrap
          component={Link}
          to="/"
          sx={{ textDecoration: "none", color: "inherit" }}
        >
          BlinkStar Properties
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleMenuItemClick(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const statsData = [
    {
      title: "Total Properties",
      value:
        stats.totalProperties != null ? stats.totalProperties.toString() : "0",
      color: "#2196f3",
    },
    {
      title: "Active Listings",
      value:
        stats.activeListings != null ? stats.activeListings.toString() : "0",
      color: "#4caf50",
    },
    {
      title: "Total Views",
      value: stats.totalViews != null ? stats.totalViews.toLocaleString() : "0",
      color: "#ff9800",
    },
    {
      title: "New Inquiries",
      value: stats.newInquiries != null ? stats.newInquiries.toString() : "0",
      color: "#f44336",
    },
    ...(user?.role === "admin"
      ? [
          {
            title: "Pending Approvals",
            value:
              stats.pendingApprovals != null
                ? stats.pendingApprovals.toString()
                : "0",
            color: "#7c3aed",
          },
        ]
      : []),
  ];

  return (
    <Box sx={{ display: "flex", width: "100%", overflowX: "clip" }}>
      <CssBaseline />
      <StyledAppBar position="fixed" open={open}>
        <Toolbar
          sx={{
            minHeight: 64,
            display: "flex",
            justifyContent: "space-between",
            px: { xs: 1.25, sm: 2 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 }, minWidth: 0 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                gap: 1,
                minWidth: 0,
              }}
            >
              <Box
                component="img"
                src={bsLogo}
                alt="Logo"
                sx={{ height: { xs: 40, sm: 56 }, width: { xs: 40, sm: 56 }, mr: { xs: 0.5, sm: 1 } }}
              />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0,
                  fontSize: { xs: "0.98rem", sm: "1.25rem" },
                  maxWidth: { xs: "calc(100vw - 220px)", sm: "none" },
                }}
              >
                BlinkStar Properties
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pr: { xs: 0.5, sm: 1 } }}>
            <IconButton color="inherit" onClick={() => navigate("/notifications")}>
              <Badge badgeContent={newLeadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={() => navigate("/messages")}>
              <Badge badgeContent={newLeadCount} color="error">
                <MessageIcon />
              </Badge>
            </IconButton>
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 1 }}
            >
              <Avatar
                src={getUserAvatarSrc(user)}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "#fff",
                  color: "#1976d2",
                  fontWeight: 700,
                }}
              >
                {getUserInitial(user)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawer}
      </Drawer>

      <Main
        open={open}
        sx={{
          "& .MuiInputBase-input": {
            fontSize: { xs: "16px", sm: "0.95rem" },
          },
          "& textarea.MuiInputBase-input": {
            fontSize: { xs: "16px", sm: "0.95rem" },
          },
        }}
      >
        <Toolbar /> {/* Spacing for AppBar */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 1280,
            ml: 0,
            mr: "auto",
            pt: { xs: 2, md: 3 },
            pb: 5,
          }}
        >
          {loading ? (
            <Box
              sx={{
                minHeight: "55vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader size="large" />
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  mb: 4,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: "#0f172a",
                      overflowWrap: "anywhere",
                    }}
                  >
                    Welcome back,{" "}
                    {user?.name || user?.email?.split("@")[0] || "User"}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {formatInquiryDate(new Date())}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddHomeWorkIcon />}
                  onClick={() => navigate("/property/add")}
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    fontWeight: 700,
                    px: 3,
                  }}
                >
                  Add Property
                </Button>
              </Box>

              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                {statsData.map((stat) => (
                  <Grid item xs={12} sm={6} md={user?.role === "admin" ? 4 : 3} key={stat.title}>
                    <StatsCard>
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 700, mb: 1 }}
                        >
                          {stat.title}
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            color: stat.color,
                            fontWeight: 900,
                            lineHeight: 1,
                            fontSize: { xs: "2rem", md: "2.4rem" },
                          }}
                        >
                          {stat.value}
                        </Typography>
                      </CardContent>
                    </StatsCard>
                  </Grid>
                ))}
              </Grid>

            {user?.role === "admin" && <AdminModeration />}

            {/* Lead Inbox Section */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Lead Inbox
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {inquiries.length} recent lead
                    {inquiries.length === 1 ? "" : "s"}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={async () => {
                    try {
                      const inquiryRes = await authFetch(
                        "/api/property/inquiries?limit=12"
                      );
                      const inquiryData = await inquiryRes.json();
                      setInquiries(inquiryData.inquiries || []);
                    } catch (err) {
                      setLeadError("Could not refresh enquiries");
                    }
                  }}
                >
                  Refresh
                </Button>
              </Box>
              {leadError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {leadError}
                </Alert>
              )}
              {inquiries.length === 0 ? (
                <Card sx={{ borderRadius: 2, border: "1px solid #e5e7eb" }}>
                  <CardContent>
                    <Typography sx={{ textAlign: "center", color: "#777" }}>
                      No leads yet.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  {inquiries.map((inquiry) => (
                    <Box key={inquiry._id} sx={{ minWidth: 0 }}>
                      <Card
                        sx={{
                          height: "100%",
                          borderRadius: 2,
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ mb: 0.75, flexWrap: "wrap", rowGap: 0.75 }}
                          >
                            <Chip
                              label={formatInquirySource(inquiry.source)}
                              size="small"
                              color={
                                inquiry.source === "whatsapp"
                                  ? "success"
                                  : "primary"
                              }
                            />
                            <Chip label={inquiry.status} size="small" />
                          </Stack>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 2,
                              overflow: "hidden",
                              lineHeight: 1.25,
                            }}
                          >
                            {inquiry.property?.title || "Property inquiry"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ overflowWrap: "anywhere" }}
                          >
                            {inquiry.name || "Website Visitor"}
                            {inquiry.phone ? ` | ${inquiry.phone}` : ""}
                            {inquiry.email ? ` | ${inquiry.email}` : ""}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.75,
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 1,
                              overflow: "hidden",
                            }}
                          >
                            {inquiry.message || "Contact action recorded."}
                          </Typography>
                          <TextField
                            select
                            size="small"
                            label="Status"
                            value={inquiry.status || "New"}
                            fullWidth
                            sx={{ mt: 1.25 }}
                            onChange={(event) => {
                              const status = event.target.value;
                              updateInquiryLocal(inquiry._id, { status });
                              saveInquiry(inquiry._id, { status });
                            }}
                          >
                            {leadStatusOptions.map((status) => (
                              <MenuItem key={status} value={status}>
                                {status}
                              </MenuItem>
                            ))}
                          </TextField>
                          <TextField
                            size="small"
                            label="Follow-up notes"
                            value={inquiry.followUpNotes || ""}
                            fullWidth
                            multiline
                            minRows={1}
                            sx={{ mt: 1.25 }}
                            onChange={(event) =>
                              updateInquiryLocal(inquiry._id, {
                                followUpNotes: event.target.value,
                              })
                            }
                            onBlur={(event) =>
                              saveInquiry(inquiry._id, {
                                followUpNotes: event.target.value,
                              })
                            }
                          />
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ mt: 1.25, flexWrap: "wrap", rowGap: 0.75 }}
                          >
                            {inquiry.phone && (
                              <Button
                                size="small"
                                variant="outlined"
                                href={`tel:${inquiry.phone}`}
                              >
                                Call
                              </Button>
                            )}
                            {inquiry.email && (
                              <Button
                                size="small"
                                variant="outlined"
                                href={`mailto:${inquiry.email}`}
                              >
                                Email
                              </Button>
                            )}
                            {inquiry.pageUrl && (
                              <Button
                                size="small"
                                variant="text"
                                href={inquiry.pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View
                              </Button>
                            )}
                            <Button
                              size="small"
                              color="error"
                              variant="text"
                              onClick={() => removeInquiry(inquiry._id)}
                              disabled={savingLeadId === inquiry._id}
                            >
                              Remove
                            </Button>
                          </Stack>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 1 }}
                          >
                            {formatInquiryDate(inquiry.createdAt)}
                            {savingLeadId === inquiry._id ? " | Saving..." : ""}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Recent Properties Section */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Your Properties
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {properties.length} listing
                    {properties.length === 1 ? "" : "s"}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddHomeWorkIcon />}
                  onClick={() => navigate("/property/add")}
                  sx={{ width: { xs: "100%", sm: "auto" }, fontWeight: 700 }}
                >
                  Add Property
                </Button>
              </Box>
              <Grid container spacing={3} alignItems="stretch">
                {properties.length === 0 ? (
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, border: "1px solid #e5e7eb" }}>
                      <CardContent>
                        <Typography sx={{ textAlign: "center", color: "#777" }}>
                          No properties listed yet.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ) : (
                  properties.map((property) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={property._id} sx={{ display: "flex" }}>
                      <PropertyCard
                        property={property}
                        onEdit={() =>
                          navigate(`/property/edit/${property._id}`)
                        }
                        onDelete={async () => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this property?"
                            )
                          ) {
                            try {
                              const res = await authFetch(
                                `/api/property/${property._id}`,
                                {
                                  method: "DELETE",
                                  credentials: "include",
                                }
                              );
                              if (res.ok) {
                                setProperties((prev) =>
                                  prev.filter((p) => p._id !== property._id)
                                );
                              } else {
                                alert("Failed to delete property");
                              }
                            } catch {
                              alert("Error deleting property");
                            }
                          }
                        }}
                      />
                    </Grid>
                  ))
                )}
              </Grid>
            </Box>
            </>
          )}
        </Box>
      </Main>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
      >
        <MenuItem onClick={() => navigate("/profile")}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate("/settings")}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
