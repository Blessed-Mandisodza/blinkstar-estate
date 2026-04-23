import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Grid, CircularProgress, Paper, Divider, MenuItem } from '@mui/material';
import { apiFetch, authFetch, resolveMediaUrl } from '../../utils/authFetch';
import 'leaflet/dist/leaflet.css';

const initialState = {
  title: '',
  description: '',
  price: '',
  location: '',
  propertyType: '',
  status: 'Available',
  furnished: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  latitude: '',
  longitude: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  reviewStatus: '',
  reviewNotes: '',
};

const compressImageFile = (file) =>
  new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.size <= 450 * 1024) {
      resolve(file);
      return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const maxSize = 1400;
      const scale = Math.min(1, maxSize / image.width, maxSize / image.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);

          if (!blob) {
            resolve(file);
            return;
          }

          const nextName = file.name.replace(/\.[^.]+$/, '') || 'property';
          const compressedFile = new File([blob], `${nextName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve(compressedFile.size < file.size ? compressedFile : file);
        },
        'image/jpeg',
        0.68
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    image.src = objectUrl;
  });

const PropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
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
            status: data.status || 'Available',
            furnished: data.furnished || '',
            bedrooms: data.bedrooms || '',
            bathrooms: data.bathrooms || '',
            area: data.area || '',
            latitude: data.latitude || '',
            longitude: data.longitude || '',
            contactName: data.contactName || '',
            contactPhone: data.contactPhone || '',
            contactEmail: data.contactEmail || '',
            reviewStatus: data.reviewStatus || '',
            reviewNotes: data.reviewNotes || '',
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

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const handleFileChange = e => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const limitedFiles = imageFiles.slice(0, 10);

    if (imageFiles.length !== files.length) {
      setImageError('Only image files can be uploaded.');
    } else if (imageFiles.length > 10) {
      setImageError('You can upload up to 10 images per listing.');
    } else {
      setImageError('');
    }

    setSelectedFiles(limitedFiles);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (['reviewStatus', 'reviewNotes'].includes(key)) return;
      formData.append(key, value);
    });
    try {
      const uploadFiles = await Promise.all(selectedFiles.map(compressImageFile));
      uploadFiles.forEach(file => formData.append('images', file));
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
        {form.reviewStatus && form.reviewStatus !== 'approved' && (
          <Typography
            mb={2}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: form.reviewStatus === 'pending' ? '#fff7ed' : '#fef2f2',
              color: form.reviewStatus === 'pending' ? '#9a3412' : '#991b1b',
              fontWeight: 700,
            }}
          >
            {form.reviewStatus === 'pending'
              ? 'This listing is waiting for admin approval.'
              : `This listing was rejected.${form.reviewNotes ? ` ${form.reviewNotes}` : ''}`}
          </Typography>
        )}
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
                {selectedFiles.length ? `${selectedFiles.length} Image${selectedFiles.length === 1 ? '' : 's'} Selected` : 'Upload Images'}
                <input type="file" name="images" accept="image/*" multiple hidden onChange={handleFileChange} />
              </Button>
              <Typography variant="caption" color={imageError ? 'error' : 'text.secondary'} sx={{ display: 'block', mt: 1 }}>
                {imageError || 'Upload up to 10 clear property photos.'}
              </Typography>
              <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                {previewUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
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
              <TextField select label="Status" name="status" value={form.status} onChange={handleChange} fullWidth>
                {['Available', 'For Sale', 'For Rent', 'Sold', 'Rented', 'Pending'].map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Furnished" name="furnished" value={form.furnished} onChange={handleChange} fullWidth>
                {['', 'Furnished', 'Unfurnished', 'Partly Furnished'].map(value => (
                  <MenuItem key={value || 'none'} value={value}>{value || 'Not specified'}</MenuItem>
                ))}
              </TextField>
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
            <Grid item xs={6}>
              <TextField label="Latitude" name="latitude" value={form.latitude} onChange={handleChange} fullWidth type="number" helperText="For map view" />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Longitude" name="longitude" value={form.longitude} onChange={handleChange} fullWidth type="number" helperText="For map view" />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={700}>
                Contact Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Contact Name" name="contactName" value={form.contactName} onChange={handleChange} fullWidth helperText="Optional listing contact" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Contact Phone" name="contactPhone" value={form.contactPhone} onChange={handleChange} fullWidth helperText="Call or WhatsApp number" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Contact Email" name="contactEmail" value={form.contactEmail} onChange={handleChange} fullWidth type="email" helperText="Optional reply email" />
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
