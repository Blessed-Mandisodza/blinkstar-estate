import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Header from "../ui/Header";
import Loader from "../ui/Loader";
import SeoHead from "../ui/SeoHead";
import { apiFetch } from "../../utils/authFetch";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/users/agents")
      .then((res) => res.json())
      .then((data) => setAgents(data.agents || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <SeoHead
        title="Agents | BlinkStar Properties"
        description="Meet BlinkStar property agents and browse their active listings."
      />
      <Header />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
          Agents
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Meet the people behind BlinkStar Properties.
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <Loader size="large" />
          </Box>
        ) : (
          <Grid container spacing={3} justifyContent={{ xs: "center", md: "flex-start" }}>
            {agents.map((agent) => (
              <Grid item xs={12} sm={6} md={4} key={agent._id} sx={{ display: "flex", justifyContent: { xs: "center", md: "stretch" } }}>
                <Card sx={{ height: "100%", width: "100%", maxWidth: { xs: 380, md: "none" }, borderRadius: 2 }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      justifyContent={{ xs: "center", md: "flex-start" }}
                      sx={{ textAlign: { xs: "center", md: "left" } }}
                    >
                      <Avatar
                        src={agent.avatarUrl}
                        sx={{ width: 64, height: 64, bgcolor: "primary.main" }}
                      >
                        {(agent.name?.[0] || agent.email?.[0] || "A").toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={800} noWrap>
                          {agent.name || "BlinkStar Agent"}
                        </Typography>
                        <Typography color="text.secondary" noWrap>
                          {agent.location || agent.email}
                        </Typography>
                        {agent.verified && (
                          <Chip
                            size="small"
                            color="success"
                            label="Verified"
                            sx={{ mt: 0.75, fontWeight: 700 }}
                          />
                        )}
                      </Box>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 2,
                        color: "text.secondary",
                        textAlign: { xs: "center", md: "left" },
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 3,
                        overflow: "hidden",
                      }}
                    >
                      {agent.bio || "Property consultant at BlinkStar Properties."}
                    </Typography>
                    <Button
                      href={`/agents/${agent._id}`}
                      variant="contained"
                      sx={{ mt: 2, alignSelf: { xs: "center", md: "flex-start" } }}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
