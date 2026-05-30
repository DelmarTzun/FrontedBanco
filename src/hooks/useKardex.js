import { useCallback, useEffect, useState } from 'react';
import { bitacoraApi } from '../api/bitacora.api';

export function useKardex({ idCuenta, desde, hasta } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!idCuenta) return;
    setLoading(true);
    setError(null);
    try {
      const movimientos = await bitacoraApi.kardex({ idCuenta, desde, hasta });
      setData(movimientos);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [idCuenta, desde, hasta]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
