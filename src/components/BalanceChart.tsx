import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BalanceChartProps {
  data: { fecha: string; ingresos: number; egresos: number }[];
}

export function BalanceChart({ data }: BalanceChartProps) {
  if (!data || data.length === 0) {
    return <p className="no-data">Sin datos disponibles</p>;
  }

  // Limitar a últimos 30 días para mejor visualización
  const chartData = data.slice(-30).map((item) => ({
    ...item,
    fecha: item.fecha.slice(5), // Mostrar solo MM-DD
  }));

  const formatMoney = (value: number) => {
    return `S/ ${value.toFixed(0)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f5f46" />
        <XAxis 
          dataKey="fecha" 
          stroke="#a6c7b7" 
          fontSize={11}
          tickMargin={10}
          interval="preserveStartEnd"
        />
        <YAxis 
          stroke="#a6c7b7" 
          fontSize={11}
          tickFormatter={formatMoney}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0b2b1f',
            border: '1px solid #1f5f46',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#f4fff8' }}
          formatter={(value) => [`S/ ${Number(value).toFixed(2)}`, '']}
        />
        <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
        <Bar 
          dataKey="egresos" 
          fill="#ff7a7a" 
          name="Egresos" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="ingresos" 
          fill="#2fbf71" 
          name="Ingresos" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
