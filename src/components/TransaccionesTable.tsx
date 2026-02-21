import type { Transaccion } from '../lib/types';

interface TransaccionesTableProps {
  transacciones: Transaccion[];
}

export function TransaccionesTable({ transacciones }: TransaccionesTableProps) {
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  const getTipoClass = (tipo: string) => {
    const tiposEgreso = ['PAGO_QR', 'YAPEO_CELULAR', 'PAGO_SERVICIO', 'TRANSFERENCIA'];
    return tiposEgreso.includes(tipo.toUpperCase()) ? 'tipo-egreso' : 'tipo-ingreso';
  };

  if (!transacciones || transacciones.length === 0) {
    return <p className="no-data">No hay transacciones registradas</p>;
  }

  // Mostrar las últimas 20 transacciones ordenadas por fecha
  const displayData = [...transacciones]
    .sort((a, b) => {
      const fechaA = `${a.Fecha}T${a.Hora}`;
      const fechaB = `${b.Fecha}T${b.Hora}`;
      return fechaB.localeCompare(fechaA);
    })
    .slice(0, 20);

  return (
    <div className="table-wrapper">
      <table className="transacciones-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Banco</th>
            <th>Tipo</th>
            <th>Destinatario</th>
            <th>Monto</th>
            <th>Operación</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((t, index) => (
            <tr key={t.Num_Operacion || index}>
              <td>{t.Fecha}</td>
              <td>{t.Hora}</td>
              <td>
                <span className="badge badge-banco">{t.Banco}</span>
              </td>
              <td>
                <span className={`badge ${getTipoClass(t.Tipo)}`}>
                  {t.Tipo.replace('_', ' ')}
                </span>
              </td>
              <td className="destinatario">{t.Destinatario}</td>
              <td className={`monto ${getTipoClass(t.Tipo)}`}>
                {formatMoney(t.Monto)}
              </td>
              <td className="operacion">{t.Num_Operacion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
