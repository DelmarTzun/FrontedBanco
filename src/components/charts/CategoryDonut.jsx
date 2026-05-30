import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { fmtMoney } from '../../lib/format';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ['#6d5dfb', '#22d3ee', '#f472b6', '#f59e0b', '#10b981', '#ef4444'];

/**
 * Agrupa movimientos por descripción/tipo y muestra distribución.
 */
function buildBuckets(movimientos = []) {
  const buckets = new Map();
  for (const m of movimientos) {
    const code = (m.codigoTipoTransaccion || 'OTRO').toUpperCase();
    if (code.startsWith('DEP') || code.includes('TRF_IN')) continue; // solo egresos
    const key = m.descripcionTipoTransaccion || code;
    buckets.set(key, (buckets.get(key) || 0) + Math.abs(m.monto));
  }
  return Array.from(buckets.entries()).sort((a, b) => b[1] - a[1]);
}

export default function CategoryDonut({ movimientos = [], height = 220 }) {
  const buckets = useMemo(() => buildBuckets(movimientos), [movimientos]);
  const labels = buckets.map(([k]) => k);
  const values = buckets.map(([, v]) => Number(v.toFixed(2)));
  const total = values.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: PALETTE,
        borderColor: 'transparent',
        borderRadius: 6,
        spacing: 4,
        cutout: '70%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#7a7a96',
          font: { size: 11 },
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(12,12,22,0.92)',
        padding: 10,
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: ${fmtMoney(ctx.parsed)} (${(
              (ctx.parsed / total) *
              100
            ).toFixed(0)}%)`,
        },
      },
    },
  };

  if (buckets.length === 0) {
    return (
      <div className="grid place-items-center text-sm text-muted" style={{ height }}>
        Aún no hay egresos para distribuir
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <Doughnut data={data} options={options} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-12">
        <p className="text-[10px] uppercase tracking-wider text-muted">Egresos</p>
        <p className="font-mono text-base font-bold">{fmtMoney(total)}</p>
      </div>
    </div>
  );
}
