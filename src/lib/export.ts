import type { Transaccion } from './types';
import { clasificarTransaccion } from './analytics';

export interface CuadreCierreDia {
  fecha: string;
  ingresos: number;
  egresos: number;
  balance: number;
  totalTransacciones: number;
}

function formatDateForFile(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function formatMoney(value: number) {
  return `S/ ${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function calcularCuadreCierreDia(transacciones: Transaccion[]): CuadreCierreDia | null {
  if (!transacciones.length) {
    return null;
  }

  const fechaCierre = [...transacciones]
    .map((tx) => tx.Fecha)
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))[0];

  if (!fechaCierre) {
    return null;
  }

  const transaccionesDelDia = transacciones.filter((tx) => tx.Fecha === fechaCierre);

  let ingresos = 0;
  let egresos = 0;

  transaccionesDelDia.forEach((tx) => {
    const monto = Number(tx.Monto || 0);
    if (clasificarTransaccion(tx.Tipo) === 'egreso') {
      egresos += monto;
    } else {
      ingresos += monto;
    }
  });

  return {
    fecha: fechaCierre,
    ingresos,
    egresos,
    balance: ingresos - egresos,
    totalTransacciones: transaccionesDelDia.length,
  };
}

export async function exportarCuadreExcel(
  transacciones: Transaccion[],
  cuadre: CuadreCierreDia
): Promise<void> {
  const rowsHtml = transacciones
    .map((tx) => {
      return `
      <tr>
        <td>${escapeHtml(tx.Fecha || '-')}</td>
        <td>${escapeHtml(tx.Hora || '-')}</td>
        <td>${escapeHtml(tx.Banco || '-')}</td>
        <td>${escapeHtml(tx.Tipo || '-')}</td>
        <td>${escapeHtml(tx.Destinatario || '-')}</td>
        <td>${escapeHtml(tx.Num_Operacion || '-')}</td>
        <td>${formatMoney(Number(tx.Monto || 0))}</td>
        <td>${escapeHtml(clasificarTransaccion(tx.Tipo))}</td>
      </tr>`;
    })
    .join('');

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <h2>Cuadre de cierre del día</h2>
        <table border="1" cellspacing="0" cellpadding="6">
          <tr><th>Fecha</th><th>Ingresos</th><th>Egresos</th><th>Balance</th><th>Transacciones</th></tr>
          <tr>
            <td>${escapeHtml(cuadre.fecha)}</td>
            <td>${formatMoney(cuadre.ingresos)}</td>
            <td>${formatMoney(cuadre.egresos)}</td>
            <td>${formatMoney(cuadre.balance)}</td>
            <td>${cuadre.totalTransacciones}</td>
          </tr>
        </table>
        <br />
        <h2>Detalle de transacciones</h2>
        <table border="1" cellspacing="0" cellpadding="6">
          <tr>
            <th>Fecha</th><th>Hora</th><th>Banco</th><th>Tipo</th><th>Destinatario</th><th>Operación</th><th>Monto</th><th>Naturaleza</th>
          </tr>
          ${rowsHtml}
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const fileName = `reporte_finanzas_${formatDateForFile(new Date())}.xls`;
  triggerDownload(blob, fileName);
}

export async function exportarCuadrePdf(
  transacciones: Transaccion[],
  cuadre: CuadreCierreDia
): Promise<void> {
  const rowsHtml = transacciones
    .map((tx) => {
      return `
      <tr>
        <td>${escapeHtml(tx.Fecha || '-')}</td>
        <td>${escapeHtml(tx.Hora || '-')}</td>
        <td>${escapeHtml(tx.Banco || '-')}</td>
        <td>${escapeHtml(tx.Tipo || '-')}</td>
        <td>${escapeHtml(tx.Destinatario || '-')}</td>
        <td>${escapeHtml(tx.Num_Operacion || '-')}</td>
        <td>${formatMoney(Number(tx.Monto || 0))}</td>
        <td>${escapeHtml(clasificarTransaccion(tx.Tipo))}</td>
      </tr>`;
    })
    .join('');

  const printWindow = window.open('', '_blank', 'width=1200,height=800');

  if (!printWindow) {
    throw new Error('No se pudo abrir la ventana de impresión');
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>reporte_finanzas_${formatDateForFile(new Date())}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; }
          h1, h2 { margin-bottom: 8px; }
          .summary { margin-bottom: 14px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #d0d0d0; padding: 6px; text-align: left; }
          th { background: #f3f3f3; }
        </style>
      </head>
      <body>
        <h1>Reporte Financiero - Cuadre de Cierre del Día</h1>
        <div class="summary">
          <div><strong>Fecha de cierre:</strong> ${escapeHtml(cuadre.fecha)}</div>
          <div><strong>Ingresos:</strong> ${formatMoney(cuadre.ingresos)}</div>
          <div><strong>Egresos:</strong> ${formatMoney(cuadre.egresos)}</div>
          <div><strong>Balance:</strong> ${formatMoney(cuadre.balance)}</div>
          <div><strong>Transacciones:</strong> ${cuadre.totalTransacciones}</div>
        </div>
        <h2>Detalle de transacciones</h2>
        <table>
          <tr>
            <th>Fecha</th><th>Hora</th><th>Banco</th><th>Tipo</th><th>Destinatario</th><th>Operación</th><th>Monto</th><th>Naturaleza</th>
          </tr>
          ${rowsHtml}
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
