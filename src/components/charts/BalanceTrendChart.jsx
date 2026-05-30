import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { fmtMoney, fmtDate } from '../../lib/format';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

/**
 * Reconstruye una serie temporal de saldo a partir de la bitácora.
 * Los movimientos vienen DESC; aquí los recorremos para deducir saldo "después" de cada movimiento.
 * Como la API solo entrega monto y código, asumimos que los "in" suman y "out" restan.
 */
function buildSeries(movimientos = [], saldoActual = 0) {
  const asc = [...movimientos].sort(
    (a, b) => new Date(a.fechaUtc) - new Date(b.fechaUtc)
  );
  let saldo = saldoActual;
  const inflowCodes = new Set(['DEP', 'TRF_IN']);

  // Caminamos hacia atrás para deducir saldos previos a partir del actual
  const seriesDesc = [];
  for (let i = asc.length - 1; i >= 0; i--) {
    const m = asc[i];
    seriesDesc.push({ fecha: m.fechaUtc, saldo });
    const code = (m.codigoTipoTransaccion || '').toUpperCase();
    if (inflowCodes.has(code) || code.startsWith('DEP') || code.includes('TRF_IN')) {
      saldo -= Math.abs(m.monto);
    } else {
      saldo += Math.abs(m.monto);
    }
  }
  seriesDesc.push({ fecha: asc[0]?.fechaUtc || new Date().toISOString(), saldo });
  return seriesDesc.reverse();
}

export default function BalanceTrendChart({
  movimientos = [],
  saldoActual = 0,
  height = 220,
}) {
  const series = useMemo(
    () => buildSeries(movimientos, saldoActual),
    [movimientos, saldoActual]
  );

  const data = useMemo(
    () => ({
      labels: series.map((p) => fmtDate(p.fecha)),
      datasets: [
        {
          label: 'Saldo',
          data: series.map((p) => Number(p.saldo.toFixed(2))),
          borderColor: '#6d5dfb',
          backgroundColor: (ctx) => {
            const { ctx: c, chartArea } = ctx.chart;
            if (!chartArea) return 'rgba(109,93,251,0.2)';
            const g = c.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom
            );
            g.addColorStop(0, 'rgba(109,93,251,0.45)');
            g.addColorStop(1, 'rgba(109,93,251,0)');
            return g;
          },
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#22d3ee',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          borderWidth: 2.5,
        },
      ],
    }),
    [series]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(12,12,22,0.92)',
          padding: 10,
          titleColor: '#a8a8c0',
          bodyColor: '#fff',
          borderColor: 'rgba(109,93,251,0.4)',
          borderWidth: 1,
          callbacks: {
            label: (ctx) => `Saldo: ${fmtMoney(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#7a7a96', maxTicksLimit: 6, font: { size: 11 } },
        },
        y: {
          grid: { color: 'rgba(125,125,160,0.12)' },
          ticks: {
            color: '#7a7a96',
            font: { size: 11 },
            callback: (v) => fmtMoney(v).replace('GTQ', '').trim(),
          },
        },
      },
    }),
    []
  );

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
}
