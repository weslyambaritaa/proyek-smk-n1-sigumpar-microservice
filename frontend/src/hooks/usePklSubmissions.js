import { useState, useCallback } from 'react';
import { vocationApi } from '../api/vocationApi';

export function usePklSubmissions() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vocationApi.getSubmissions();
      const rows = res.data?.data ?? res.data ?? [];
      setData(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, load };
}
