import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Transaccion } from '../lib/types';

interface TendenciaHoraChartProps {
  transacciones: Transaccion[];
}

const TIPOS_EGRESO = new Set(['PAGO_QR', 'YAPEO_CELULAR', 'PAGO_SERVICIO', 'TRANSFERENCIA']);

function getHour(hora: string): number | null {
  const hourPart = hora?.split(':')[0];
  const hour = Number(hourPart);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return null;
  }
  return hour;
}

export function TendenciaHoraChart({ transacciones }: TendenciaHoraChartProps) {
  const chartData = Array.from({ length: 24 }, (_, hour) => ({
    hora: `${String(hour).padStart(2, '0')}:00`,
    ingresos: 0,
    egresos: 0,
  }));

  transacciones.forEach((tx) => {
    const hour = getHour(tx.Hora);
    if (hour === null) {
      return;
    }

    const monto = Number(tx.Monto || 0);
    const tipo = tx.Tipo?.toUpperCase() ?? '';

    if (TIPOS_EGRESO.has(tipo)) {
      chartData[hour].egresos += monto;
    } else {
      chartData[hour].ingresos += monto;
    }
  });

  const hasData = chartData.some((item) => item.ingresos > 0 || item.egresos > 0);

  if (!hasData) {
    return <p className="no-data">Sin datos por hora para el rango seleccionado</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 20, right: 24, left: 6, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f5f46" />
        <XAxis dataKey="hora" stroke="#a6c7b7" fontSize={11} interval={1} />
        <YAxis
          stroke="#a6c7b7"
          fontSize={11}
          tickFormatter={(value) => `S/ ${Number(value).toFixed(0)}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0b2b1f',
            border: '1px solid #1f5f46',
            borderRadius: '8px',
            color: '#f4fff8',
          }}
          labelStyle={{ color: '#f4fff8' }}
          itemStyle={{ color: '#d6f5e5' }}
          formatter={(value, name) => [`S/ ${Number(value).toFixed(2)}`, name]}
        />
        <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
        <Line
          type="monotone"
          dataKey="ingresos"
          name="Ingresos"
          stroke="#2fbf71"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="egresos"
          name="Egresos"
          stroke="#960018"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
