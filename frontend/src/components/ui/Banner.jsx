import React, { useState, useEffect } from "react";
import {
Box,
Typography,
Container,
TextField,
Button,
InputAdornment,
Paper,
Autocomplete,
  Stack,
  IconButton
} from '@mui/material';
import { Search as SearchIcon, LocationOn, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import banner1 from '../../img/banner1.jpg';
import banner2 from '../../img/banner2.jpg';
import banner3 from '../../img/banner3.jpg';

const BannerContainer = styled(Box)(({ theme }) => ({
position: 'relative',
height: '95vh',
display: 'flex',
alignItems: 'center',
  overflow: 'hidden',
color: 'white',
[theme.breakpoints.down('sm')]: {
height: '80vh',
},
}));

const Slide = styled(Box)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'opacity 1s ease-in-out',
});

const SearchContainer = styled(Paper)(({ theme }) => ({
padding: theme.spacing(4),
borderRadius: theme.spacing(2),
backgroundColor: 'rgba(255, 255, 255, 0.72)',
backdropFilter: 'blur(8px)',
maxWidth: '1000px',
width: '90%',
margin: '0 auto',
marginTop: theme.spacing(4),
  position: 'relative',
  zIndex: 2,
[theme.breakpoints.down('sm')]: {
padding: theme.spacing(2.5),
width: '88%',
},
}));

const locations = [
"Harare",
"Bulawayo",
"Mutare",
"Gweru",
"Masvingo",
"Victoria Falls",
];

const propertyTypes = [
"House",
"Apartment",
"Condo",
"Townhouse",
"Villa",
"Land"
];

const banners = [
  { image: banner1, title: "Find Your Dream Home", subtitle: "Discover luxury living at its finest" },
  { image: banner2, title: "Modern Living Spaces", subtitle: "Contemporary designs for modern lifestyles" },
  { image: banner3, title: "Investment Opportunities", subtitle: "Grow your portfolio with prime properties" }
];

export default function Banner({ onSearch }) {
const [location, setLocation] = useState(null);
const [propertyType, setPropertyType] = useState(null);
const [priceRange, setPriceRange] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        location: location || '',
        type: propertyType || '',
        maxPrice: priceRange || ''
      });
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

return (
<BannerContainer>
      {banners.map((banner, index) => (
        <Slide
          key={index}
          sx={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${banner.image})`,
            opacity: index === currentSlide ? 1 : 0,
            zIndex: index === currentSlide ? 1 : 0
          }}
        />
      ))}

      <IconButton
        onClick={prevSlide}
        sx={{
          position: 'absolute',
          left: 20,
          zIndex: 3,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <NavigateBefore fontSize="large" />
      </IconButton>

      <IconButton
        onClick={nextSlide}
        sx={{
          position: 'absolute',
          right: 20,
          zIndex: 3,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <NavigateNext fontSize="large" />
      </IconButton>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
<Box
  textAlign="center"
  mb={6}
  sx={{ animation: 'heroFadeUp 760ms ease 80ms both' }}
>
<Typography
variant="h2"
component="h1"
sx={{
fontWeight: 700,
mb: 3,
fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' },
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
}}
>
            {banners[currentSlide].title}
</Typography>
<Typography
variant="h5"
sx={{
mb: 5,
fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
fontWeight: 400,
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
}}
>
            {banners[currentSlide].subtitle}
</Typography>
</Box>

    <SearchContainer
      elevation={4}
      sx={{ animation: 'heroFadeUp 760ms ease 220ms both' }}
    >
      <Stack spacing={3}>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2, md: 3 },
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr auto' },
          }}
        >
          <Autocomplete
            value={location}
            onChange={(event, newValue) => setLocation(newValue)}
            options={locations}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Location"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { height: '52px' } }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Autocomplete
            value={propertyType}
            onChange={(event, newValue) => setPropertyType(newValue)}
            options={propertyTypes}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Property Type"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { height: '52px' } }}
              />
            )}
          />

          <TextField
            label="Price Range"
            variant="outlined"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder="Max Price"
            type="number"
            sx={{ '& .MuiOutlinedInput-root': { height: '52px' } }}
          />

          <Button
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            sx={{
              height: '52px',
              fontSize: '1rem',
              px: { xs: 3, md: 4 },
              minWidth: { xs: '100%', md: '140px' },
            }}
                onClick={handleSearch}
          >
            Search
          </Button>
        </Box>
      </Stack>
    </SearchContainer>
  </Container>
</BannerContainer>
);
}
