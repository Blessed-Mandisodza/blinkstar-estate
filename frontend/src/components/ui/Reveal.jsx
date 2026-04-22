import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

export default function Reveal({ children, delay = 0, sx = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      className={`motion-reveal${visible ? " is-visible" : ""}`}
      sx={{ "--reveal-delay": `${delay}ms`, ...sx }}
    >
      {children}
    </Box>
  );
}
