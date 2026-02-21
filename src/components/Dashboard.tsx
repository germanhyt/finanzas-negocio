import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Transaccion, ResumenFinanciero } from '../lib/types';
import { StatsCards } from './StatsCards';
import { BalanceChart } from './BalanceChart';
import { TiposPieChart } from './TiposPieChart';
import { TendenciaHoraChart } from './TendenciaHoraChart';
import { TransaccionesTable } from './TransaccionesTable';
import { DateFilter } from './DateFilter';
import { LatestNotifications } from './LatestNotifications';
import {
  calcularCuadreCierreDia,
  exportarCuadreExcel,
  exportarCuadrePdf,
} from '../lib/export';

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
  const [cuadreDesde, setCuadreDesde] = useState<string>('');
  const [cuadreHasta, setCuadreHasta] = useState<string>('');
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  const transaccionesCuadre = useMemo(() => {
    return transacciones.filter((tx) => {
      if (cuadreDesde && tx.Fecha < cuadreDesde) return false;
      if (cuadreHasta && tx.Fecha > cuadreHasta) return false;
      return true;
    });
  }, [transacciones, cuadreDesde, cuadreHasta]);

  const cuadreCierreDia = useMemo(() => {
    return calcularCuadreCierreDia(transaccionesCuadre);
  }, [transaccionesCuadre]);

  const fetchData = useCallback(async (
    options?: { silent?: boolean; desde?: string; hasta?: string }
  ) => {
    const silent = options?.silent ?? false;
    const desde = options?.desde ?? fechaDesde;
    const hasta = options?.hasta ?? fechaHasta;

    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const params = new URLSearchParams();
      if (desde) params.append('desde', desde);
      if (hasta) params.append('hasta', hasta);

      const url = `/api/transacciones${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setTransacciones(data.data.transacciones);
        setResumen(data.data.resumen);
      } else if (!silent) {
        setError(data.error || 'Error al cargar datos');
      }
    } catch (err) {
      if (!silent) {
        setError('Error de conexión');
      }
      console.error(err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [fechaDesde, fechaHasta]);

  useEffect(() => {
    if (!initialData) {
      fetchData();
    }
  }, [initialData, fetchData]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData({ silent: true });
      }
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [fetchData]);

  const handleFilter = () => {
    fetchData();
  };

  const handleClearFilter = () => {
    setFechaDesde('');
    setFechaHasta('');
    fetchData({ desde: '', hasta: '' });
  };

  const handleClearCuadreFilter = () => {
    setCuadreDesde('');
    setCuadreHasta('');
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  const handleExportExcel = async () => {
    if (!cuadreCierreDia || exporting) return;

    setExporting('excel');
    try {
      await exportarCuadreExcel(transaccionesCuadre, cuadreCierreDia);
    } catch (err) {
      console.error(err);
      setError('No se pudo exportar el archivo Excel');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async () => {
    if (!cuadreCierreDia || exporting) return;

    setExporting('pdf');
    try {
      await exportarCuadrePdf(transaccionesCuadre, cuadreCierreDia);
    } catch (err) {
      console.error(err);
      setError('No se pudo exportar el archivo PDF');
    } finally {
      setExporting(null);
    }
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
        <button onClick={() => { void fetchData(); }}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-main">
          <h1>Análisis de negocio</h1>
          <p className="subtitle">
            Control de ingresos y egresos en tiempo real
          </p>
        </div>

        <LatestNotifications transacciones={transacciones} />
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

            <div className="chart-container chart-full-width">
              <h3>Tendencia por Hora (Ingresos y Egresos)</h3>
              <TendenciaHoraChart transacciones={transacciones} />
            </div>
          </div>
        </>
      )}

      <div className="table-container">
        <h3>Últimas Transacciones</h3>
        <TransaccionesTable transacciones={transacciones} />
      </div>

      {transacciones.length > 0 && (
        <section className="export-panel">
          <div className="cierre-card">
            <h3>Cuadre de cierre del día</h3>
            <div className="cuadre-filter-row">
              <div className="cuadre-filter-group">
                <label htmlFor="cuadre-desde">Desde</label>
                <input
                  id="cuadre-desde"
                  type="date"
                  value={cuadreDesde}
                  onChange={(e) => setCuadreDesde(e.target.value)}
                />
              </div>
              <div className="cuadre-filter-group">
                <label htmlFor="cuadre-hasta">Hasta</label>
                <input
                  id="cuadre-hasta"
                  type="date"
                  value={cuadreHasta}
                  onChange={(e) => setCuadreHasta(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-cuadre-clear"
                onClick={handleClearCuadreFilter}
              >
                Limpiar rango
              </button>
            </div>

            {cuadreCierreDia ? (
              <>
                <p className="cierre-date">Fecha: {cuadreCierreDia.fecha}</p>
                <div className="cierre-values">
                  <span>Ingresos: {formatMoney(cuadreCierreDia.ingresos)}</span>
                  <span>Egresos: {formatMoney(cuadreCierreDia.egresos)}</span>
                  <span>Balance: {formatMoney(cuadreCierreDia.balance)}</span>
                  <span>Transacciones: {cuadreCierreDia.totalTransacciones}</span>
                </div>
              </>
            ) : (
              <p className="cierre-empty">Sin movimientos para el rango seleccionado.</p>
            )}
          </div>

          <div className="export-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { void handleExportExcel(); }}
              disabled={exporting !== null || !cuadreCierreDia}
            >
              {exporting === 'excel' ? '📊 Exportando Excel...' : '📊 Exportar Excel'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => { void handleExportPdf(); }}
              disabled={exporting !== null || !cuadreCierreDia}
            >
              {exporting === 'pdf' ? '🧾 Exportando PDF...' : '🧾 Exportar PDF'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
