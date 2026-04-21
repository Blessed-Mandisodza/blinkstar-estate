import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Header from "../ui/Header";
import Loader from "../ui/Loader";
import PropertyCard from "../property/PropertyCard";
import { apiFetch } from "../../utils/authFetch";

export default function AgentProfile() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/users/agents/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAgent(data.agent);
        setProperties(data.properties || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
        <Header />
        <Box display="flex" justifyContent="center" py={8}>
          <Loader size="large" />
        </Box>
      </Box>
    );
  }

  if (!agent) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Typography variant="h5">Agent not found.</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 2, mb: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Avatar
              src={agent.avatarUrl}
              sx={{ width: 96, height: 96, bgcolor: "primary.main" }}
            >
              {(agent.name?.[0] || agent.email?.[0] || "A").toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h4" fontWeight={900}>
                {agent.name || "BlinkStar Agent"}
              </Typography>
              <Typography color="text.secondary">
                {agent.location || "Property Consultant"}
              </Typography>
              <Typography sx={{ mt: 1.5 }}>
                {agent.bio || "Helping buyers and sellers find the right match."}
              </Typography>
            </Box>
            <Stack spacing={1}>
              {agent.whatsapp && (
                <Button
                  startIcon={<WhatsAppIcon />}
                  href={`https://api.whatsapp.com/send?phone=${agent.whatsapp}`}
                  target="_blank"
                  variant="contained"
                  color="success"
                >
                  WhatsApp
                </Button>
              )}
              {agent.phone && (
                <Button startIcon={<PhoneIcon />} href={`tel:${agent.phone}`}>
                  Call
                </Button>
              )}
              <Button startIcon={<EmailIcon />} href={`mailto:${agent.email}`}>
                Email
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
          Listings
        </Typography>
        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={property._id}>
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
