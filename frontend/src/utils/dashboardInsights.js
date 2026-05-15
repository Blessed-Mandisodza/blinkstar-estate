const sourceOrder = ["whatsapp", "phone", "email", "contact_form"];
const statusOrder = ["New", "Contacted", "Closed", "Archived"];

const sortBreakdown = (items, preferredOrder) =>
  items.sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    const leftIndex = preferredOrder.indexOf(left.key);
    const rightIndex = preferredOrder.indexOf(right.key);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.key.localeCompare(right.key);
    }

    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });

export const buildLeadInsights = (inquiries = [], properties = []) => {
  const safeInquiries = Array.isArray(inquiries) ? inquiries : [];
  const safeProperties = Array.isArray(properties) ? properties : [];
  const propertyTitles = new Map(
    safeProperties.map((property) => [property._id, property.title || "Property inquiry"])
  );
  const sourceCounts = {};
  const statusCounts = {};
  const propertyCounts = {};

  safeInquiries.forEach((inquiry) => {
    const sourceKey = inquiry?.source || "contact_form";
    const statusKey = inquiry?.status || "New";
    const propertyKey = inquiry?.property?._id;

    sourceCounts[sourceKey] = (sourceCounts[sourceKey] || 0) + 1;
    statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;

    if (propertyKey) {
      propertyCounts[propertyKey] = {
        key: propertyKey,
        count: (propertyCounts[propertyKey]?.count || 0) + 1,
        title:
          propertyTitles.get(propertyKey) ||
          inquiry.property?.title ||
          "Property inquiry",
      };
    }
  });

  const sourceBreakdown = sortBreakdown(
    Object.entries(sourceCounts).map(([key, count]) => ({ key, count })),
    sourceOrder
  );
  const statusBreakdown = sortBreakdown(
    Object.entries(statusCounts).map(([key, count]) => ({ key, count })),
    statusOrder
  );
  const hottestProperty = sortBreakdown(Object.values(propertyCounts), []).shift() || null;
  const needsAttentionCount = safeInquiries.filter((inquiry) => {
    const status = inquiry?.status || "New";
    const notes = String(inquiry?.followUpNotes || "").trim();

    return status !== "Closed" && status !== "Archived" && !notes;
  }).length;
  const respondedCount = safeInquiries.filter((inquiry) => {
    const status = inquiry?.status || "New";
    return status !== "New";
  }).length;
  const openLeadCount = safeInquiries.filter((inquiry) => {
    const status = inquiry?.status || "New";
    return status !== "Closed" && status !== "Archived";
  }).length;

  return {
    sourceBreakdown,
    statusBreakdown,
    topSource: sourceBreakdown[0] || null,
    hottestProperty,
    needsAttentionCount,
    respondedCount,
    openLeadCount,
  };
};
