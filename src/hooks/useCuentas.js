import { useCallback, useEffect, useState } from 'react';
import { cuentasApi } from '../api/cuentas.api';
import { useAuthStore } from '../store/authStore';

/**
 * Hook reactivo para las cuentas del cliente actual.
 * Maneja loading, error y refresh manual.
 */
export function useCuentas() {
  const idCliente = useAuthStore((s) => s.idCliente);
  const cuentaActivaId = useAuthStore((s) => s.cuentaActivaId);
  const setCuentaActiva = useAuthStore((s) => s.setCuentaActiva);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!idCliente) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const cuentas = await cuentasApi.listarPorCliente(idCliente);
      setData(cuentas);
      // Si no hay cuenta activa o la activa ya no existe, seleccionamos la primera
      if (
        cuentas.length > 0 &&
        (!cuentaActivaId || !cuentas.find((c) => c.idCuenta === cuentaActivaId))
      ) {
        setCuentaActiva(cuentas[0].idCuenta);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCliente]);

  useEffect(() => {
    load();
  }, [load]);

  const cuentaActiva = data.find((c) => c.idCuenta === cuentaActivaId) || data[0];

  return {
    cuentas: data,
    cuentaActiva,
    loading,
    error,
    refresh: load,
    setCuentaActiva,
  };
}
