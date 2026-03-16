import { useState, useMemo } from 'react';
import type { PresupuestoEstado } from '../lib/types';
import { BudgetTrackingChart } from './BudgetTrackingChart';

interface BudgetViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  presupuestos: PresupuestoEstado[];
  onRefresh: () => void;
  onEditBudget: (budget: any) => void;
  onAddBudget: () => void;
}

export function BudgetViewerModal({ 
  isOpen, 
  onClose, 
  presupuestos, 
  onRefresh,
  onEditBudget,
  onAddBudget 
}: BudgetViewerModalProps) {
  const [mesFiltro, setMesFiltro] = useState<string>(() => {
    return new Date().toISOString().slice(0, 7); // Default current month YYYY-MM
  });

  const mesesDisponibles = useMemo(() => {
    if (!presupuestos) return [];
    const meses = Array.from(new Set(presupuestos.map(p => p.mesAnio)));
    return meses.sort((a, b) => b.localeCompare(a)); // Newest first
  }, [presupuestos]);

  const presupuestosFiltrados = useMemo(() => {
    if (!presupuestos) return [];
    if (!mesFiltro) return presupuestos;
    return presupuestos.filter(p => p.mesAnio === mesFiltro);
  }, [presupuestos, mesFiltro]);

  if (!isOpen) return null;

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  const getProgressColor = (porcentaje: number) => {
    if (porcentaje >= 100) return '#ef4444'; // Rojo
    if (porcentaje >= 80) return '#f59e0b'; // Ámbar/Naranja
    return '#10b981'; // Verde
  };

  const formatMonth = (monthStr: string) => {
    if (!monthStr) return '';
    try {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }).toUpperCase();
    } catch {
      return monthStr;
    }
  };

  const handleEdit = (p: PresupuestoEstado) => {
    onEditBudget({
      ID: p.id || '',
      Mes_Anio: p.mesAnio,
      Categoria: p.categoria,
      Monto_Presupuestado: p.presupuestado
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glassmorphism budget-viewer-modal">
        <div className="modal-header">
          <h2>Control de Presupuesto</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="budget-viewer-top-actions" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div className="filter-group" style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Filtrar por Mes</label>
            <select 
              value={mesFiltro} 
              onChange={(e) => setMesFiltro(e.target.value)}
              className="filter-select"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              {mesesDisponibles.map(mes => (
                <option key={mes} value={mes}>{formatMonth(mes)}</option>
              ))}
              {mesesDisponibles.length === 0 && <option value="">No hay datos</option>}
            </select>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ alignSelf: 'flex-end', height: '44px' }}
            onClick={onAddBudget}
          >
            + Nuevo Presupuesto
          </button>
        </div>

        {presupuestosFiltrados.length > 0 && (
          <BudgetTrackingChart data={presupuestosFiltrados} />
        )}

        <div className="budget-viewer-list">
          {presupuestosFiltrados.length === 0 ? (
            <div className="budget-empty" style={{ margin: '2rem 0' }}>
              <p>No hay presupuestos definidos para {formatMonth(mesFiltro)}.</p>
              <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={onAddBudget}>
                Crear presupuesto para este mes
              </button>
            </div>
          ) : (
            <div className="budget-grid">
              {presupuestosFiltrados.map((p) => (
                <div key={`${p.categoria}-${p.mesAnio}`} className="budget-item">
                  <div className="budget-item-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <span className="budget-category" style={{ fontSize: '1.1rem' }}>{p.categoria}</span>
                      <span className="budget-date-badge">{formatMonth(p.mesAnio)}</span>
                    </div>
                    <span className="budget-values" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                      {formatMoney(p.real)} / <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>{formatMoney(p.presupuestado)}</span>
                    </span>
                  </div>
                  
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(p.porcentaje, 100)}%`,
                        backgroundColor: getProgressColor(p.porcentaje),
                      }}
                    />
                  </div>
                  <div className="budget-item-footer">
                    <span className="budget-percentage">{p.porcentaje.toFixed(1)}% consumido</span>
                    <span className={`budget-diff ${p.diferencia < 0 ? 'text-danger' : 'text-success'}`}>
                      {p.diferencia < 0 
                        ? `Exceso: ${formatMoney(Math.abs(p.diferencia))}` 
                         : `Disponible: ${formatMoney(p.diferencia)}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="btn-edit-budget" onClick={() => handleEdit(p)}>
                      ⚙️ Ajustar Límite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}



