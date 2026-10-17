/**
 * useApi - Generic data-fetching hook with automatic loading/error state
 * const { data, loading, error, refetch } = useApi(apiFn)
 */
import { useState, useEffect, useCallback, useRef } from "react";

export function useApi(apiFn) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const mountedRef            = useRef(true);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) setError(err.message || "Request failed");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [apiFn]);

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => { mountedRef.current = false; };
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

/**
 * useMutation - fires an async function on demand, tracks loading/error
 * const { mutate, loading, error } = useMutation(apiFn)
 */
export function useMutation(apiFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      return result;
    } catch (err) {
      const msg = err.message || "Operation failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { mutate, loading, error };
}
