import { useEffect } from "react";

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

export default function SeoHead({
  title = "BlinkStar Properties",
  description = "Find homes, land, rentals, and commercial property with BlinkStar Properties.",
  image = "/bs logo.png",
  url,
}) {
  useEffect(() => {
    const absoluteUrl =
      url || (typeof window !== "undefined" ? window.location.href : "");
    const absoluteImage =
      image?.startsWith("http") || image?.startsWith("data:")
        ? image
        : `${window.location.origin}${image?.startsWith("/") ? image : `/${image}`}`;

    document.title = title;
    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: absoluteUrl,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: absoluteImage,
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
  }, [description, image, title, url]);

  return null;
}
