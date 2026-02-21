import { useState, useEffect } from 'react';
import type { Transaccion, ResumenFinanciero } from '../lib/types';
import { StatsCards } from './StatsCards';
import { BalanceChart } from './BalanceChart';
import { TiposPieChart } from './TiposPieChart';
import { TransaccionesTable } from './TransaccionesTable';
import { DateFilter } from './DateFilter';

interface DashboardProps {
  initialData?: {
    transacciones: Transaccion[];
    resumen: ResumenFinanciero;
  };
}

export function Dashboard({ initialData }: DashboardProps) {
  const [transacciones, setTransacciones] = useState<Transaccion[]>(
    initialData?.transacciones || []
  );
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(
    initialData?.resumen || null
  );
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.append('desde', fechaDesde);
      if (fechaHasta) params.append('hasta', fechaHasta);

      const url = `/api/transacciones${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setTransacciones(data.data.transacciones);
        setResumen(data.data.resumen);
      } else {
        setError(data.error || 'Error al cargar datos');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchData();
    }
  }, []);

  const handleFilter = () => {
    fetchData();
  };

  const handleClearFilter = () => {
    setFechaDesde('');
    setFechaHasta('');
    fetchData();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando datos financieros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={fetchData}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Análisis del negocio</h1>
        <p className="subtitle">
          Control de ingresos y egresos en tiempo real
        </p>
      </header>

      <DateFilter
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onFechaDesdeChange={setFechaDesde}
        onFechaHastaChange={setFechaHasta}
        onFilter={handleFilter}
        onClear={handleClearFilter}
      />

      {resumen && (
        <>
          <StatsCards resumen={resumen} />

          <div className="charts-grid">
            <div className="chart-container">
              <h3>Balance por Día</h3>
              <BalanceChart data={resumen.transaccionesPorDia} />
            </div>

            <div className="chart-container">
              <h3>Distribución por Tipo</h3>
              <TiposPieChart data={resumen.transaccionesPorTipo} />
            </div>
          </div>
        </>
      )}

      <div className="table-container">
        <h3>Últimas Transacciones</h3>
        <TransaccionesTable transacciones={transacciones} />
      </div>
    </div>
  );
}
