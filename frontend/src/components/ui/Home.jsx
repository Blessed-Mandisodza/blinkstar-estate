import React, { useRef, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { Parallax } from "react-parallax";
import Header from "./Header";
import SeoHead from "./SeoHead";
import Banner from "./Banner";
import HomeHighlights from "./HomeHighlights";
import FeaturedProperties from "./FeaturedProperties";
import Footer from "./Footer";
import PropertyList from "../property/PropertyList";
import PropertyCategories from "../property/PropertyCategories";
import RecentlyViewedProperties from "../property/RecentlyViewedProperties";

const defaultFilters = {
  location: "",
  type: "",
  maxPrice: "",
  search: "",
  status: "",
};

const Home = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [showResults, setShowResults] = useState(false);
  const [resultsHeading, setResultsHeading] = useState("Search Results");
  const resultsRef = useRef(null);

  const showFilteredResults = (nextFilters, heading) => {
    setFilters({ ...defaultFilters, ...nextFilters });
    setResultsHeading(heading);
    setShowResults(true);

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    }
  };

  const handleBannerSearch = (searchFilters) => {
    showFilteredResults(searchFilters, "Search Results");
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
      {showResults && (
        <Box
          ref={resultsRef}
          sx={{
            py: { xs: 4, md: 5 },
            px: 2,
            backgroundColor: "#ffffff",
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ mb: 3 }}>
              <Typography variant="overline" color="primary" fontWeight={900}>
                Matching Properties
              </Typography>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{
                  mt: 0.75,
                  fontSize: { xs: "1.6rem", sm: "1.9rem", md: "2.2rem" },
                }}
              >
                {resultsHeading}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                Updated from the home search and category shortcuts.
              </Typography>
            </Box>
            <PropertyList
              filters={filters}
              desktopColumns={3}
              pageSizeOverride={6}
              showContactInfo={false}
            />
          </Container>
        </Box>
      )}
      <HomeHighlights
        afterTrustContent={
          <>
            <PropertyCategories />
            <FeaturedProperties />
            <RecentlyViewedProperties showContactInfo={false} />
          </>
        }
      />
      <Footer />
    </Box>
  );
};

export default Home;
