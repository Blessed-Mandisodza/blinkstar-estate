import {
  clearComparedProperties,
  MAX_COMPARED_PROPERTIES,
  readComparedProperties,
  removeComparedProperty,
  toggleComparedProperty,
} from "./compareProperties";

const buildProperty = (id) => ({
  _id: id,
  title: `Property ${id}`,
  price: 100000 + Number(id),
  location: "Harare",
  propertyType: "House",
});

beforeEach(() => {
  localStorage.clear();
});

test("adds and removes compared properties", () => {
  toggleComparedProperty(buildProperty("1"));
  toggleComparedProperty(buildProperty("2"));

  expect(readComparedProperties().map((property) => property._id)).toEqual([
    "1",
    "2",
  ]);

  toggleComparedProperty(buildProperty("1"));

  expect(readComparedProperties().map((property) => property._id)).toEqual([
    "2",
  ]);
});

test("does not exceed the compare limit", () => {
  toggleComparedProperty(buildProperty("1"));
  toggleComparedProperty(buildProperty("2"));
  toggleComparedProperty(buildProperty("3"));
  toggleComparedProperty(buildProperty("4"));

  const comparedProperties = readComparedProperties();

  expect(comparedProperties).toHaveLength(MAX_COMPARED_PROPERTIES);
  expect(comparedProperties.map((property) => property._id)).toEqual([
    "1",
    "2",
    "3",
  ]);
});

test("clears or removes compared properties directly", () => {
  toggleComparedProperty(buildProperty("1"));
  toggleComparedProperty(buildProperty("2"));

  removeComparedProperty("1");
  expect(readComparedProperties().map((property) => property._id)).toEqual([
    "2",
  ]);

  clearComparedProperties();
  expect(readComparedProperties()).toEqual([]);
});
