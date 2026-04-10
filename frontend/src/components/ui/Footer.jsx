import React from 'react';
import { Container, Grid, Typography, Link, Box, IconButton, Stack } from '@mui/material';
import { Facebook, Twitter, Instagram, Phone, Email, LocationOn } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledFooter = styled('footer')(({ theme }) => ({
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(4),
  position: 'relative',
  marginTop: 'auto',
  width: '100%',
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: '#ffffff',
  textDecoration: 'none',
  transition: 'color 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateY(-2px)',
  },
}));

const FooterSection = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(3),
  },
}));

const Footer = () => {
  return (
    <StyledFooter>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <FooterSection>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                BlinkStar Properties
              </Typography>
              <Stack spacing={2}>
                <FooterLink href="#" underline="none">
                  <LocationOn fontSize="small" />
                  7401 1st Crescent, Warren Park 1, Harare
                </FooterLink>
                <FooterLink href="tel:+263782931905" underline="none">
                  <Phone fontSize="small" />
                  +263 78 293 1905
                </FooterLink>
                <FooterLink href="mailto:info@blinkstarprop.co.zw" underline="none">
                  <Email fontSize="small" />
                  info@blinkstarprop.co.zw
                </FooterLink>
              </Stack>
            </FooterSection>
          </Grid>

          <Grid item xs={12} md={4}>
            <FooterSection>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Stack spacing={1.5}>
                <FooterLink href="/" underline="none">Home</FooterLink>
                <FooterLink href="/about" underline="none">About Us</FooterLink>
                <FooterLink href="/properties" underline="none">Properties</FooterLink>
                <FooterLink href="/contact" underline="none">Contact</FooterLink>
              </Stack>
            </FooterSection>
          </Grid>

          <Grid item xs={12} md={4}>
            <FooterSection>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Connect With Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <SocialButton href="https://www.facebook.com/profile.php?id=61559780460174" target="_blank" aria-label="Facebook">
                  <Facebook />
                </SocialButton>
                <SocialButton href="https://www.twitter.com" target="_blank" aria-label="Twitter">
                  <Twitter />
                </SocialButton>
                <SocialButton href="https://www.instagram.com" target="_blank" aria-label="Instagram">
                  <Instagram />
                </SocialButton>
              </Box>
            </FooterSection>
          </Grid>
        </Grid>

        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            mt: 4,
            pt: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            © {new Date().getFullYear()} BlinkStar Properties. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
