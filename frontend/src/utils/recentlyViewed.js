const recentlyViewedKey = "recentlyViewedProperties";
const MAX_RECENTLY_VIEWED = 6;

const buildPropertySnapshot = (property) => {
  if (!property?._id) return null;

  return {
    _id: property._id,
    title: property.title || "",
    price: property.price ?? "",
    location: property.location || "",
    images: Array.isArray(property.images) ? property.images.slice(0, 1) : [],
    imageUrl: property.imageUrl || "",
    propertyType: property.propertyType || "",
    status: property.status || "",
    reviewStatus: property.reviewStatus || "",
    bedrooms: property.bedrooms ?? "",
    bathrooms: property.bathrooms ?? "",
    contactName: property.contactName || "",
    contactPhone: property.contactPhone || "",
    contactEmail: property.contactEmail || "",
  };
};

export const readRecentlyViewedProperties = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(recentlyViewedKey) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item?._id) : [];
  } catch {
    return [];
  }
};

export const saveRecentlyViewedProperty = (property) => {
  const snapshot = buildPropertySnapshot(property);

  if (!snapshot) return;

  const current = readRecentlyViewedProperties();
  const next = [snapshot, ...current.filter((item) => item._id !== snapshot._id)].slice(
    0,
    MAX_RECENTLY_VIEWED
  );

  localStorage.setItem(recentlyViewedKey, JSON.stringify(next));
};
