"use client";

import { useState, useEffect } from "react";

const cache: Record<string, string | null> = {};

export function useOgpImage(url?: string) {
  const [image, setImage] = useState<string | null>(url ? (cache[url] ?? null) : null);

  useEffect(() => {
    if (!url) return;
    if (url in cache) {
      setImage(cache[url]);
      return;
    }
    fetch(`/api/ogp?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then(({ image }) => {
        cache[url] = image;
        setImage(image);
      })
      .catch(() => {
        cache[url] = null;
      });
  }, [url]);

  return image;
}
