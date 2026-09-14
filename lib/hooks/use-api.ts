"use client";

import { useCallback, useEffect, useState } from "react";

interface UseApiResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Minimal fetch hook used across the dashboard so pages don't each hand-roll
 * loading/error state. Deliberately dependency-free (no SWR/React Query) to
 * keep the starter's footprint small — swap in a query library later if the
 * app grows past this.
 */
export function useApi<T>(url: string | null, deps: unknown[] = []): UseApiResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, version, ...deps]);

  return { data, isLoading, error, refetch };
}
