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
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="fecha" 
          stroke="#9CA3AF" 
          fontSize={12}
          tickMargin={10}
        />
        <YAxis 
          stroke="#9CA3AF" 
          fontSize={12}
          tickFormatter={formatMoney}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#F3F4F6' }}
          formatter={(value) => [`S/ ${Number(value).toFixed(2)}`, '']}
        />
        <Legend />
        <Bar 
          dataKey="egresos" 
          fill="#EF4444" 
          name="Egresos" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="ingresos" 
          fill="#10B981" 
          name="Ingresos" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
