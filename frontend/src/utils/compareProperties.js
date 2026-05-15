const comparePropertiesKey = "comparedProperties";
export const MAX_COMPARED_PROPERTIES = 3;
export const comparePropertiesUpdatedEventName = "compare-properties-updated";

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
    bedrooms: property.bedrooms ?? property.beds ?? "",
    bathrooms: property.bathrooms ?? property.baths ?? "",
    area: property.area ?? "",
    furnished: property.furnished || "",
    description: property.description || "",
  };
};

const emitCompareUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(comparePropertiesUpdatedEventName));
  }
};

export const readComparedProperties = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(comparePropertiesKey) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item?._id) : [];
  } catch {
    return [];
  }
};

export const toggleComparedProperty = (property) => {
  const snapshot = buildPropertySnapshot(property);

  if (!snapshot) {
    return readComparedProperties();
  }

  const current = readComparedProperties();
  const exists = current.some((item) => item._id === snapshot._id);

  let next = current;

  if (exists) {
    next = current.filter((item) => item._id !== snapshot._id);
  } else if (current.length < MAX_COMPARED_PROPERTIES) {
    next = [...current, snapshot];
  }

  localStorage.setItem(comparePropertiesKey, JSON.stringify(next));
  emitCompareUpdate();
  return next;
};

export const removeComparedProperty = (propertyId) => {
  const next = readComparedProperties().filter((item) => item._id !== propertyId);
  localStorage.setItem(comparePropertiesKey, JSON.stringify(next));
  emitCompareUpdate();
  return next;
};

export const clearComparedProperties = () => {
  localStorage.removeItem(comparePropertiesKey);
  emitCompareUpdate();
};
