import React, { useMemo, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import Header from "../ui/Header";

const money = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;

export default function MortgageCalculator() {
  const [price, setPrice] = useState(120000);
  const [deposit, setDeposit] = useState(24000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(20);

  const result = useMemo(() => {
    const principal = Math.max(Number(price) - Number(deposit), 0);
    const monthlyRate = Number(rate) / 100 / 12;
    const payments = Number(years) * 12;

    if (!principal || !payments) return { principal, monthly: 0, total: 0 };

    const monthly = monthlyRate
      ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -payments))
      : principal / payments;

    return {
      principal,
      monthly,
      total: monthly * payments,
    };
  }, [deposit, price, rate, years]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
          Mortgage Calculator
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Estimate monthly payments for a property purchase.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2 }}>
              {[
                ["Property Price", price, setPrice, 10000, 1000000, 5000],
                ["Deposit", deposit, setDeposit, 0, price, 1000],
                ["Interest Rate (%)", rate, setRate, 0, 30, 0.25],
                ["Loan Term (Years)", years, setYears, 1, 30, 1],
              ].map(([label, value, setter, min, max, step]) => (
                <Box key={label} sx={{ mb: 3 }}>
                  <TextField
                    label={label}
                    type="number"
                    value={value}
                    onChange={(event) => setter(Number(event.target.value))}
                    fullWidth
                    sx={{ mb: 1.5 }}
                  />
                  <Slider
                    value={Number(value)}
                    min={Number(min)}
                    max={Number(max)}
                    step={Number(step)}
                    onChange={(_, nextValue) => setter(nextValue)}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 2,
                bgcolor: "#0f172a",
                color: "white",
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                Estimated Monthly Payment
              </Typography>
              <Typography variant="h3" fontWeight={900} sx={{ my: 2 }}>
                {money(result.monthly)}
              </Typography>
              <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.16)", pt: 2 }}>
                <Typography>Loan Amount: {money(result.principal)}</Typography>
                <Typography>Total Payment: {money(result.total)}</Typography>
                <Typography>Deposit: {money(deposit)}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
