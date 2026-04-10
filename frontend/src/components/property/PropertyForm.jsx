import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Grid, CircularProgress, Paper, Divider } from '@mui/material';
import { apiFetch, authFetch, resolveMediaUrl } from '../../utils/authFetch';
import 'leaflet/dist/leaflet.css';

const initialState = {
  title: '',
  description: '',
  price: '',
  location: '',
  propertyType: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
};

const PropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (id) {
      apiFetch(`/api/property/${id}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            title: data.title || '',
            description: data.description || '',
            price: data.price || '',
            location: data.location || '',
            propertyType: data.propertyType || '',
            bedrooms: data.bedrooms || '',
            bathrooms: data.bathrooms || '',
            area: data.area || '',
          });
          setExistingImages(data.images || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = e => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    selectedFiles.forEach(file => formData.append('images', file));
    try {
      const res = await authFetch(id ? `/api/property/${id}` : '/api/property', {
        method: id ? 'PUT' : 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to save property');
      const data = await res.json();
      navigate(`/property/${data._id || id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ maxWidth: 650, mx: 'auto', mt: 6 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={2} align="center">
          {id ? 'Edit Property' : 'Add Property'}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth required helperText="e.g. Modern House" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth required multiline rows={3} helperText="Brief description of the property" />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Price" name="price" value={form.price} onChange={handleChange} fullWidth required type="number" helperText="e.g. 450000" />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Location" name="location" value={form.location} onChange={handleChange} fullWidth required helperText="e.g. Harare" />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" fullWidth sx={{ py: 2, fontWeight: 600 }}>
                Upload Images
                <input type="file" name="images" multiple hidden onChange={handleFileChange} />
              </Button>
              <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                {selectedFiles.map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                  />
                ))}
                {selectedFiles.length === 0 && existingImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={resolveMediaUrl(img)}
                    alt="existing"
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Property Type" name="propertyType" value={form.propertyType} onChange={handleChange} fullWidth required helperText="e.g. Apartment, House" />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Area (sq ft)" name="area" value={form.area} onChange={handleChange} fullWidth required type="number" helperText="e.g. 2000" />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Bedrooms" name="bedrooms" value={form.bedrooms} onChange={handleChange} fullWidth required type="number" helperText="e.g. 3" />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Bathrooms" name="bathrooms" value={form.bathrooms} onChange={handleChange} fullWidth required type="number" helperText="e.g. 2" />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 2, fontWeight: 700, fontSize: '1.1rem', mt: 2 }}>
                {id ? 'Update Property' : 'Add Property'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default PropertyForm; 
