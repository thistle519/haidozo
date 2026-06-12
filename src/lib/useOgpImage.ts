"use client";

import { useState, useEffect } from "react";

const cache: Record<string, string | null> = {};

export function useOgpImage(url?: string) {
  const [image, setImage] = useState<string | null>(url ? (cache[url] ?? null) : null);

  useEffect(() => {
    if (!url) return;
    let alive = true;

    // キャッシュ済みなら fetch せず非同期に反映（effect 内同期 setState を避ける）
    if (url in cache) {
      const cached = cache[url];
      queueMicrotask(() => {
        if (alive) setImage(cached);
      });
      return () => {
        alive = false;
      };
    }

    fetch(`/api/ogp?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then(({ image }: { image: string | null }) => {
        cache[url] = image;
        if (alive) setImage(image);
      })
      .catch(() => {
        cache[url] = null;
      });

    return () => {
      alive = false;
    };
  }, [url]);

  return image;
}
