import { useEffect, useMemo, useState } from 'react';
import type { Transaccion } from '../lib/types';
import { clasificarTransaccion } from '../lib/analytics';

interface TransaccionesTableProps {
  transacciones: Transaccion[];
}

const PAGE_SIZE = 10;

export function TransaccionesTable({ transacciones }: TransaccionesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  const getTipoClass = (tipo: string, movimiento?: string) => {
    return `tipo-${clasificarTransaccion(tipo, movimiento)}`;
  };

  const sortedData = useMemo(() => {
    if (!transacciones) return [];
    return [...transacciones].sort((a, b) => {
      const fechaA = `${a.Fecha}T${a.Hora}`;
      const fechaB = `${b.Fecha}T${b.Hora}`;
      return fechaB.localeCompare(fechaA);
    });
  }, [transacciones]);

  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [totalItems]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
  const displayData = sortedData.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="transacciones-table-block">
      <div className="table-wrapper">
        <table className="transacciones-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Movimiento</th>
              <th>Banco</th>
              <th>Concepto</th>
              <th>Tipo</th>
              <th>Destinatario</th>
              <th>Monto</th>
              <th>Operación</th>
            </tr>
          </thead>
          <tbody>
            {displayData.length > 0 ? (
              displayData.map((t, index) => (
                <tr key={t.Num_Operacion || `${t.Fecha}-${t.Hora}-${index}`}>
                  <td>{t.Fecha}</td>
                  <td>{t.Hora}</td>
                  <td>
                    <span className="badge badge-movimiento">{t.Movimiento || '-'}</span>
                  </td>
                  <td>
                    <span className="badge badge-banco">{t.Banco}</span>
                  </td>
                  <td className="concepto" title={t.Concepto || ''}>{t.Concepto || '-'}</td>
                  <td>
                    <span className={`badge ${getTipoClass(t.Tipo || '', t.Movimiento)}`}>
                      {(t.Tipo || '').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="destinatario">{t.Destinatario}</td>
                  <td className={`monto ${getTipoClass(t.Tipo || '', t.Movimiento)}`}>
                    {formatMoney(t.Monto)}
                  </td>
                  <td className="operacion">{t.Num_Operacion}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="no-data-cell">
                  No se encontraron transacciones con los filtros actuales
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-pagination" role="navigation" aria-label="Paginación de transacciones">
        <p className="table-pagination-info">
          Mostrando {startIndex + 1}-{endIndex} de {totalItems}
        </p>
        <div className="table-pagination-actions">
          <button
            type="button"
            className="table-page-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            Anterior
          </button>
          <span className="table-page-status" aria-live="polite">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            className="table-page-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
