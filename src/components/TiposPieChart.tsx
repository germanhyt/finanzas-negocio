import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TiposPieChartProps {
  data: { tipo: string; monto: number; count: number }[];
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6', '#f97316', '#eab308'];

export function TiposPieChart({ data }: TiposPieChartProps) {
  if (!data || data.length === 0) {
    return <p className="no-data">Sin datos disponibles</p>;
  }

  const formatMoney = (value: number) => {
    return `S/ ${value.toFixed(2)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={88}
          fill="#2fbf71"
          dataKey="monto"
          nameKey="tipo"
          label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
        >
          {data.map((_, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip
          cursor={{ fill: 'rgba(47, 191, 113, 0.12)' }}
          contentStyle={{
            backgroundColor: '#0b2b1f',
            border: '1px solid #1f5f46',
            borderRadius: '8px',
            color: '#f4fff8',
          }}
          labelStyle={{ color: '#f4fff8' }}
          itemStyle={{ color: '#d6f5e5' }}
          formatter={(value, name) => [
            formatMoney(Number(value)),
            String(name).replace('_', ' '),
          ]}
        />
        <Legend 
          wrapperStyle={{ fontSize: '0.85rem' }}
          formatter={(value) => value.replace('_', ' ')}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
