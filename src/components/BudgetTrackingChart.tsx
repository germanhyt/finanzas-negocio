import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { PresupuestoEstado } from '../lib/types';

interface BudgetTrackingChartProps {
  data: PresupuestoEstado[];
}

export function BudgetTrackingChart({ data }: BudgetTrackingChartProps) {
  const currentMonthName = useMemo(() => {
    if (!data || data.length === 0) return '';
    try {
      const [year, month] = data[0].mesAnio.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }).toUpperCase();
    } catch {
      return '';
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="no-data-chart">
        <p>No hay presupuestos para mostrar en el gráfico.</p>
      </div>
    );
  }

  // Preparar datos para el gráfico
  const chartData = data.map((p) => ({
    name: p.categoria,
    Presupuestado: p.presupuestado,
    Real: p.real,
    mes: p.mesAnio,
  }));

  const formatMoney = (value: number) => {
    return `S/ ${value.toLocaleString()}`;
  };

  return (
    <div className="budget-tracking-chart-wrapper" style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
        Seguimiento Mensual: <span style={{ color: 'var(--accent-primary)' }}>{currentMonthName}</span>
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f5f46" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#a6c7b7" 
            fontSize={12}
            tick={{ fill: '#a6c7b7' }}
            angle={-25}
            textAnchor="end"
            interval={0}
          />
          <YAxis 
            stroke="#a6c7b7" 
            fontSize={12}
            tickFormatter={formatMoney}
            tick={{ fill: '#a6c7b7' }}
          />
          <Tooltip
            cursor={false}
            contentStyle={{
              backgroundColor: '#0b2b1f',
              border: '1px solid #1f5f46',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.7)'
            }}
            labelStyle={{ 
              color: '#2fbf71', 
              fontWeight: 'bold', 
              marginBottom: '10px', 
              borderBottom: '1px solid #1f5f46', 
              paddingBottom: '6px',
              fontSize: '1rem'
            }}
            itemStyle={{ 
              fontSize: '0.9rem', 
              padding: '4px 0',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px'
            }}
            formatter={(value, name) => [
              <span style={{ fontWeight: '700', color: '#f4fff8' }}>{formatMoney(Number(value))}</span>,
              <span style={{ color: '#a6c7b7', marginRight: '8px' }}>{name}:</span>
            ]}
          />
          <Legend 
            verticalAlign="top" 
            height={48}
            iconType="circle"
            wrapperStyle={{ paddingTop: '10px' }}
          />
          <Bar 
            dataKey="Presupuestado" 
            fill="#2fbf71" 
            name="P. Ajustado" 
            radius={[4, 4, 0, 0]} 
            barSize={24}
            activeBar={{ fillOpacity: 0.8 }}
          />
          <Bar 
            dataKey="Real" 
            name="Gasto Real" 
            fill="#f5b971" 
            radius={[4, 4, 0, 0]} 
            barSize={24}
            activeBar={{ fillOpacity: 0.8 }}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.Real > entry.Presupuestado ? '#ff7a7a' : '#f4be37'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
