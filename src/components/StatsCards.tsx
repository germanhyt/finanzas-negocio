import type { ResumenFinanciero } from '../lib/types';

interface StatsCardsProps {
  resumen: ResumenFinanciero;
}

export function StatsCards({ resumen }: StatsCardsProps) {
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  return (
    <div className="stats-cards">
      <div className="stat-card stat-egresos">
        <div className="stat-icon">📤</div>
        <div className="stat-content">
          <span className="stat-label">Total Egresos</span>
          <span className="stat-value">{formatMoney(resumen.totalEgresos)}</span>
        </div>
      </div>

      <div className="stat-card stat-ingresos">
        <div className="stat-icon">📥</div>
        <div className="stat-content">
          <span className="stat-label">Total Ingresos</span>
          <span className="stat-value">{formatMoney(resumen.totalIngresos)}</span>
        </div>
      </div>

      <div className={`stat-card ${resumen.balance >= 0 ? 'stat-positive' : 'stat-negative'}`}>
        <div className="stat-icon">{resumen.balance >= 0 ? '📈' : '📉'}</div>
        <div className="stat-content">
          <span className="stat-label">Balance</span>
          <span className="stat-value">{formatMoney(resumen.balance)}</span>
        </div>
      </div>

      <div className="stat-card stat-transacciones">
        <div className="stat-icon">🔢</div>
        <div className="stat-content">
          <span className="stat-label">Transacciones</span>
          <span className="stat-value">
            {resumen.transaccionesPorTipo.reduce((acc, t) => acc + t.count, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
