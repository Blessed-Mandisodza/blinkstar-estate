import React, { useEffect, useMemo, useState } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import Header from "../ui/Header";
import Loader from "../ui/Loader";
import PropertyCard from "./PropertyCard";
import { apiFetch } from "../../utils/authFetch";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const hasCoordinates = (property) =>
  Number.isFinite(Number(property.latitude)) &&
  Number.isFinite(Number(property.longitude));

export default function PropertyMap() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/property?limit=100&sort=createdAt")
      .then((res) => res.json())
      .then((data) => setProperties(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const mappedProperties = useMemo(
    () => properties.filter(hasCoordinates),
    [properties]
  );

  const center = mappedProperties.length
    ? [
        Number(mappedProperties[0].latitude),
        Number(mappedProperties[0].longitude),
      ]
    : [-17.8252, 31.0335];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb" }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
          Map Search
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {mappedProperties.length} mapped listing
          {mappedProperties.length === 1 ? "" : "s"}
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <Loader size="large" />
          </Box>
        ) : (
          <Box>
            <Paper
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                height: { xs: 380, md: 560 },
                mb: { xs: 2.5, md: 3 },
              }}
            >
              <MapContainer
                center={center}
                zoom={mappedProperties.length ? 12 : 11}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mappedProperties.map((property) => (
                  <Marker
                    key={property._id}
                    position={[
                      Number(property.latitude),
                      Number(property.longitude),
                    ]}
                  >
                    <Popup>
                      <Typography fontWeight={800}>{property.title}</Typography>
                      <Typography>{property.location}</Typography>
                      <Typography color="primary">
                        ${Number(property.price || 0).toLocaleString()}
                      </Typography>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Paper>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2.5,
              }}
            >
              {(mappedProperties.length ? mappedProperties : properties)
                .slice(0, 6)
                .map((property) => (
                  <Box key={property._id} sx={{ minWidth: 0 }}>
                    <PropertyCard property={property} />
                  </Box>
                ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
