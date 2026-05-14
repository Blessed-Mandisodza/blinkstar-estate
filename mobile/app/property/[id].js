import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Screen from "../../src/components/Screen";
import Loader from "../../src/components/Loader";
import EmptyState from "../../src/components/EmptyState";
import { apiFetch } from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import {
  formatDate,
  formatLabel,
  formatPrice,
  normalizeWhatsAppPhone,
  resolveImageUrl,
} from "../../src/utils/format";
import { useFavorites } from "../../src/context/FavoritesContext";
import { useAuth } from "../../src/context/AuthContext";

const fallbackContact = {
  email: "blinkstardesigns@gmail.com",
  phone: "+263782931905",
  whatsapp: "263782931905",
};

const actionButton = (backgroundColor) => ({
  backgroundColor,
  borderRadius: 999,
  paddingVertical: 12,
  paddingHorizontal: 14,
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
});

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams();
  const propertyId = Array.isArray(id) ? id[0] : id;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: user?.name || current.name,
      email: user?.email || current.email,
    }));
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError("");

    apiFetch(`/api/property/${propertyId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Property not found.");
        }

        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setProperty(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Could not load property.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyId]);

  const images = useMemo(() => {
    if (!property) return [];
    const gallery = Array.isArray(property.images) ? property.images : [];
    if (gallery.length) return gallery;
    if (property.imageUrl) return [property.imageUrl];
    return [];
  }, [property]);

  const contactEmail =
    property?.contactEmail || property?.listedBy?.email || fallbackContact.email;
  const contactPhone =
    property?.contactPhone ||
    property?.listedBy?.whatsapp ||
    property?.listedBy?.phone ||
    fallbackContact.phone;
  const buildLeadDetails = () => ({
    name: String(form.name || user?.name || "").trim(),
    email: String(form.email || user?.email || "").trim(),
    phone: String(form.phone || user?.phone || user?.whatsapp || "").trim(),
  });

  const trackContactClick = async (source, extra = {}) => {
    try {
      await apiFetch(`/api/property/${propertyId}/contact-click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          pageUrl: `blinkstar://property/${propertyId}`,
          ...extra,
        }),
      });
    } catch {
      // Non-blocking by design.
    }
  };

  const openWhatsApp = async () => {
    const leadDetails = buildLeadDetails();

    if (!leadDetails.phone) {
      Alert.alert(
        "Phone number required",
        "Add your phone number in the inquiry form before opening WhatsApp so the agent can reply from the inbox."
      );
      return;
    }

    const whatsappNumber = normalizeWhatsAppPhone(contactPhone);
    await trackContactClick("whatsapp", {
      ...leadDetails,
      message: `Hi, I am interested in ${property.title}.`,
    });
    Linking.openURL(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hi, I am interested in ${property.title}.`
      )}`
    );
  };

  const makeCall = async () => {
    await trackContactClick("phone");
    Linking.openURL(`tel:${contactPhone}`);
  };

  const sendEmail = async () => {
    await trackContactClick("email");
    Linking.openURL(
      `mailto:${contactEmail}?subject=${encodeURIComponent(
        property?.title || "BlinkStar Property Inquiry"
      )}`
    );
  };

  const submitInquiry = async () => {
    if (!form.name || !form.email || !form.message || !property?._id) {
      Alert.alert("Missing details", "Please complete your name, email, and message.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiFetch("/api/property/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          propertyId: property._id,
          inquiryType: "general",
          source: "mobile_app",
          pageUrl: `blinkstar://property/${property._id}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not send inquiry.");
      }

      Alert.alert("Inquiry sent", "Your message has been saved and sent.");
      setForm((current) => ({ ...current, phone: "", message: "" }));
    } catch (err) {
      Alert.alert("Could not send inquiry", err.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Screen scroll={false}>
        <Loader label="Loading property" />
      </Screen>
    );
  }

  if (!property || error) {
    return (
      <Screen scroll={false}>
        <EmptyState title="Property unavailable" message={error || "This listing could not be found."} />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
          {images.length ? (
            images.map((image, index) => (
              <Image
                key={`${image}-${index}`}
                source={{ uri: resolveImageUrl(image) }}
                style={styles.heroImage}
              />
            ))
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Text style={styles.heroPlaceholderText}>No image</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.headerCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{property.title}</Text>
              <Text style={styles.location}>{property.location || "Zimbabwe"}</Text>
            </View>
            <Pressable
              style={[styles.heartButton, isFavorite(property._id) && styles.heartButtonActive]}
              onPress={() => toggleFavorite(property)}
            >
              <Text style={[styles.heartIcon, isFavorite(property._id) && styles.heartIconActive]}>
                {isFavorite(property._id) ? "♥" : "♡"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.price}>{formatPrice(property.price)}</Text>

          <View style={styles.statRow}>
            <View style={styles.statChip}>
              <Text style={styles.statChipLabel}>{property.bedrooms || 0} beds</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statChipLabel}>{property.bathrooms || 0} baths</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statChipLabel}>{property.area || "N/A"} sqm</Text>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{formatLabel(property.propertyType)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>{formatLabel(property.status)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Listed</Text>
              <Text style={styles.detailValue}>{formatDate(property.createdAt)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Furnished</Text>
              <Text style={styles.detailValue}>{formatLabel(property.furnished || "No")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>About this place</Text>
          <Text style={styles.description}>
            {property.description || "The listing owner has not added more detail yet."}
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Contact options</Text>
          <View style={styles.contactRow}>
            <Pressable style={actionButton(colors.primary)} onPress={openWhatsApp}>
              <Text style={styles.actionText}>WhatsApp</Text>
            </Pressable>
            <Pressable style={actionButton("#0f172a")} onPress={makeCall}>
              <Text style={styles.actionText}>Call</Text>
            </Pressable>
            <Pressable style={actionButton("#475569")} onPress={sendEmail}>
              <Text style={styles.actionText}>Email</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Send inquiry</Text>
          <TextInput
            value={form.name}
            onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
            placeholder="Name"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <TextInput
            value={form.email}
            onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            value={form.phone}
            onChangeText={(value) => setForm((current) => ({ ...current, phone: value }))}
            placeholder="Phone"
            placeholderTextColor={colors.muted}
            style={styles.input}
            keyboardType="phone-pad"
          />
          <TextInput
            value={form.message}
            onChangeText={(value) => setForm((current) => ({ ...current, message: value }))}
            placeholder="Message"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.messageInput]}
            multiline
          />
          <Pressable style={styles.submitButton} onPress={submitInquiry} disabled={submitting}>
            <Text style={styles.submitButtonText}>
              {submitting ? "Sending..." : "Send Inquiry"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 120,
    gap: 16,
  },
  galleryRow: {
    gap: 12,
  },
  heroImage: {
    width: 280,
    height: 210,
    borderRadius: 22,
    backgroundColor: colors.border,
  },
  heroPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroPlaceholderText: {
    color: colors.mutedDark,
    fontWeight: "700",
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
  },
  location: {
    color: colors.mutedDark,
    fontSize: 15,
  },
  price: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "800",
  },
  heartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  heartButtonActive: {
    backgroundColor: "#fee2e2",
  },
  heartIcon: {
    fontSize: 22,
    color: colors.text,
  },
  heartIconActive: {
    color: colors.danger,
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  statChipLabel: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detailItem: {
    width: "47%",
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "700",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.mutedDark,
  },
  contactRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 13,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
  },
  messageInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonText: {
    color: colors.surface,
    fontWeight: "800",
    fontSize: 16,
  },
});
