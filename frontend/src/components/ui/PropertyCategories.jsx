import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Business as BusinessIcon,
  Landscape as LandscapeIcon,
  Villa as VillaIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { apiFetch } from '../../utils/authFetch';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const CategoryIcon = styled(Box)(({ theme, color }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: color,
  color: 'white',
  fontSize: '2rem',
  [theme.breakpoints.down('sm')]: {
    width: 50,
    height: 50,
    fontSize: '1.5rem',
  },
}));

const categories = [
  {
    id: 'houses',
    title: 'Houses for Sale',
    description: 'Find your dream home with our extensive collection of houses',
    icon: <HomeIcon />,
    color: '#2196f3',
    image: 'https://source.unsplash.com/random/400x300/?house',
    count: 0
  },
  {
    id: 'apartments',
    title: 'Apartments for Rent',
    description: 'Modern apartments in prime locations for comfortable living',
    icon: <ApartmentIcon />,
    color: '#4caf50',
    image: 'https://source.unsplash.com/random/400x300/?apartment',
    count: 0
  },
  {
    id: 'commercial',
    title: 'Commercial Properties',
    description: 'Office spaces, retail stores, and industrial properties',
    icon: <BusinessIcon />,
    color: '#ff9800',
    image: 'https://source.unsplash.com/random/400x300/?office',
    count: 0
  },
  {
    id: 'land',
    title: 'Land for Sale',
    description: 'Prime land plots for development and investment',
    icon: <LandscapeIcon />,
    color: '#795548',
    image: 'https://source.unsplash.com/random/400x300/?land',
    count: 0
  },
  {
    id: 'villas',
    title: 'Luxury Villas',
    description: 'Exclusive villas with premium amenities and locations',
    icon: <VillaIcon />,
    color: '#9c27b0',
    image: 'https://source.unsplash.com/random/400x300/?villa',
    count: 0
  },
  {
    id: 'retail',
    title: 'Retail Spaces',
    description: 'Shop spaces and retail properties for your business',
    icon: <StoreIcon />,
    color: '#f44336',
    image: 'https://source.unsplash.com/random/400x300/?shop',
    count: 0
  }
];

export default function PropertyCategories() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [categoryCounts, setCategoryCounts] = useState({});

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const response = await apiFetch('/api/property');
        const properties = await response.json();
        
        // Count properties by type
        const counts = {};
        properties.forEach(property => {
          const type = property.propertyType?.toLowerCase() || 'other';
          counts[type] = (counts[type] || 0) + 1;
        });
        
        setCategoryCounts(counts);
      } catch (error) {
        console.error('Error fetching property counts:', error);
      }
    };

    fetchCategoryCounts();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/properties?type=${category.id}`);
  };

  return (
    <Box 
      sx={{ 
        py: { xs: 4, sm: 6, md: 8 },
        backgroundColor: 'background.default'
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            mb: { xs: 4, sm: 5, md: 6 },
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              color: 'text.primary'
            }}
          >
            Browse by Category
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: { xs: 3, sm: 4 },
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
              px: { xs: 2, sm: 0 },
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Find the perfect property that matches your needs and lifestyle
          </Typography>
        </Box>

        <Grid 
          container 
          spacing={{ xs: 2, sm: 3, md: 4 }}
          justifyContent="center"
        >
          {categories.map((category) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={category.id}
              sx={{ display: 'flex' }}
            >
              <StyledCard 
                onClick={() => handleCategoryClick(category)}
                sx={{ width: '100%' }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={category.image}
                  alt={category.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent 
                  sx={{ 
                    p: { xs: 2, sm: 3 },
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  <CategoryIcon color={category.color}>
                    {category.icon}
                  </CategoryIcon>
                  
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ 
                      fontWeight: 600,
                      mb: 1,
                      fontSize: { xs: '1rem', sm: '1.1rem' }
                    }}
                  >
                    {category.title}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ 
                      mb: 2,
                      lineHeight: 1.6,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    {category.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={`${categoryCounts[category.id] || 0} Properties`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        <Box 
          sx={{ 
            mt: { xs: 4, sm: 5, md: 6 },
            textAlign: 'center'
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/properties')}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 2
            }}
          >
            View All Properties
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 
