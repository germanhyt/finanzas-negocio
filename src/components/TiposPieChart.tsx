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

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

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
          outerRadius={100}
          fill="#8884d8"
          dataKey="monto"
          nameKey="tipo"
          label={({ name, percent }) => 
            `${String(name).replace('_', ' ')} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
        >
          {data.map((_, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
          }}
          formatter={(value, name) => [
            formatMoney(Number(value)),
            String(name).replace('_', ' '),
          ]}
        />
        <Legend 
          formatter={(value) => value.replace('_', ' ')}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
