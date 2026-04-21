import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import PropertyCard from "./components/property/PropertyCard";
import Home from "./components/ui/Home";
import SignIn from "./components/sign/SignIn";
import SignUp from "./components/sign/SignUp";
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/dashboard/Profile";
import PrivateRoute from "./components/auth/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import Properties from "./components/ui/Properties";
import PropertyDetail from "./components/property/PropertyDetail";
import PropertyForm from "./components/property/PropertyForm";
import SavedProperties from "./components/property/SavedProperties";
import SavedSearches from "./components/property/SavedSearches";
import PropertyMap from "./components/property/PropertyMap";
import MortgageCalculator from "./components/property/MortgageCalculator";
import Agents from "./components/agents/Agents";
import AgentProfile from "./components/agents/AgentProfile";
import SeoListings from "./components/property/SeoListings";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/property" element={<PropertyCard />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:type/:location" element={<SeoListings />} />
            <Route path="/map" element={<PropertyMap />} />
            <Route path="/mortgage" element={<MortgageCalculator />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/:id" element={<AgentProfile />} />
            <Route
              path="/favorites"
              element={
                <PrivateRoute>
                  <SavedProperties />
                </PrivateRoute>
              }
            />
            <Route
              path="/saved-searches"
              element={
                <PrivateRoute>
                  <SavedSearches />
                </PrivateRoute>
              }
            />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route
              path="/property/add"
              element={
                <PrivateRoute>
                  <PropertyForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/property/edit/:id"
              element={
                <PrivateRoute>
                  <PropertyForm />
                </PrivateRoute>
              }
            />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </Box>
      </Router>
    </AuthProvider>
  );
}

export default App;
