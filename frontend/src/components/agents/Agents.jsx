import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Header from "../ui/Header";
import Loader from "../ui/Loader";
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
          <Grid container spacing={3}>
            {agents.map((agent) => (
              <Grid item xs={12} sm={6} md={4} key={agent._id}>
                <Card sx={{ height: "100%", borderRadius: 2 }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
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
                      </Box>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 2,
                        color: "text.secondary",
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
                      sx={{ mt: 2 }}
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
