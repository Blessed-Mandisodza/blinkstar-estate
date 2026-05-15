import { buildLeadInsights } from "./dashboardInsights";

test("builds lead breakdowns and hotspot insights", () => {
  const inquiries = [
    {
      _id: "i1",
      source: "whatsapp",
      status: "New",
      property: { _id: "p1", title: "Borrowdale House" },
      followUpNotes: "",
    },
    {
      _id: "i2",
      source: "whatsapp",
      status: "Contacted",
      property: { _id: "p1", title: "Borrowdale House" },
      followUpNotes: "Shared brochure",
    },
    {
      _id: "i3",
      source: "email",
      status: "Closed",
      property: { _id: "p2", title: "Avondale Apartment" },
      followUpNotes: "Closed after viewing",
    },
    {
      _id: "i4",
      source: "phone",
      status: "New",
      property: { _id: "p2", title: "Avondale Apartment" },
      followUpNotes: "",
    },
  ];

  const insights = buildLeadInsights(inquiries, [
    { _id: "p1", title: "Borrowdale House" },
    { _id: "p2", title: "Avondale Apartment" },
  ]);

  expect(insights.topSource).toEqual({ key: "whatsapp", count: 2 });
  expect(insights.sourceBreakdown).toEqual([
    { key: "whatsapp", count: 2 },
    { key: "phone", count: 1 },
    { key: "email", count: 1 },
  ]);
  expect(insights.statusBreakdown).toEqual([
    { key: "New", count: 2 },
    { key: "Contacted", count: 1 },
    { key: "Closed", count: 1 },
  ]);
  expect(insights.needsAttentionCount).toBe(2);
  expect(insights.respondedCount).toBe(2);
  expect(insights.openLeadCount).toBe(3);
  expect(insights.hottestProperty).toEqual({
    key: "p1",
    count: 2,
    title: "Borrowdale House",
  });
});

test("returns empty insight defaults when no inquiries exist", () => {
  expect(buildLeadInsights([], [])).toEqual({
    sourceBreakdown: [],
    statusBreakdown: [],
    topSource: null,
    hottestProperty: null,
    needsAttentionCount: 0,
    respondedCount: 0,
    openLeadCount: 0,
  });
});
