import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { apiFetch } from '../../utils/authFetch';

const ContactForm = ({ propertyTitle, propertyId }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await apiFetch('/api/property/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, propertyId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Contact Agent/Owner
      </Typography>
      {propertyTitle && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Inquiring about: <b>{propertyTitle}</b>
        </Typography>
      )}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Your inquiry has been sent!</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          required
          type="email"
          sx={{ mb: 2 }}
        />
        <TextField
          label="Phone (optional)"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Message"
          name="message"
          value={form.message}
          onChange={handleChange}
          fullWidth
          required
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ py: 1.2, fontWeight: 600 }}>
          {loading ? 'Sending...' : 'Send Inquiry'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ContactForm; 
