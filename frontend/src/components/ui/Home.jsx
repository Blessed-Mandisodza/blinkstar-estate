import React, { useState } from "react";
import { Box } from "@mui/material";
import { Parallax } from "react-parallax";
import Header from "./Header";
import SeoHead from "./SeoHead";
import Banner from "./Banner";
import HomeHighlights from "./HomeHighlights";
import FeaturedProperties from "./FeaturedProperties";
import Footer from "./Footer";
import PropertyList from "../property/PropertyList";

const Home = () => {
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    maxPrice: "",
  });
  const [showResults, setShowResults] = useState(false);

  const handleBannerSearch = (searchFilters) => {
    setFilters(searchFilters);
    setShowResults(true);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SeoHead
        title="BlinkStar Properties | Homes, Rentals, Land and Commercial Listings"
        description="Find homes, rentals, land, and commercial property with BlinkStar Properties."
      />
      <Header />
      <Parallax strength={300}>
        <Banner onSearch={handleBannerSearch} />
      </Parallax>
      <HomeHighlights />
      {showResults && (
        <Box mb={6} px={2}>
          <PropertyList filters={filters} />
        </Box>
      )}
      {/* Property Categories Section */}
      <React.Suspense fallback={null}>
        {React.createElement(
          require("../property/PropertyCategories.jsx").default
        )}
      </React.Suspense>
      <FeaturedProperties />
      <Footer />
    </Box>
  );
};

export default Home;
