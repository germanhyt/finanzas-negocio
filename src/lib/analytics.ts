import type { Transaccion, ResumenFinanciero } from './types';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';

// Tipos de operación que se consideran egresos
const TIPOS_EGRESO = ['PAGO_QR', 'YAPEO_CELULAR', 'PAGO_SERVICIO', 'TRANSFERENCIA'];

export function clasificarTransaccion(tipo: string): 'ingreso' | 'egreso' {
  return TIPOS_EGRESO.includes(tipo.toUpperCase()) ? 'egreso' : 'ingreso';
}

export function calcularResumen(transacciones: Transaccion[]): ResumenFinanciero {
  let totalIngresos = 0;
  let totalEgresos = 0;

  // Calcular totales
  transacciones.forEach((t) => {
    if (clasificarTransaccion(t.Tipo) === 'egreso') {
      totalEgresos += t.Monto;
    } else {
      totalIngresos += t.Monto;
    }
  });

  // Agrupar por día
  const porDia = new Map<string, { ingresos: number; egresos: number }>();
  transacciones.forEach((t) => {
    const fecha = t.Fecha;
    if (!porDia.has(fecha)) {
      porDia.set(fecha, { ingresos: 0, egresos: 0 });
    }
    const dia = porDia.get(fecha)!;
    if (clasificarTransaccion(t.Tipo) === 'egreso') {
      dia.egresos += t.Monto;
    } else {
      dia.ingresos += t.Monto;
    }
  });

  const transaccionesPorDia = Array.from(porDia.entries())
    .map(([fecha, data]) => ({ fecha, ...data }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Agrupar por tipo
  const porTipo = new Map<string, { monto: number; count: number }>();
  transacciones.forEach((t) => {
    const tipo = t.Tipo || 'SIN_TIPO';
    if (!porTipo.has(tipo)) {
      porTipo.set(tipo, { monto: 0, count: 0 });
    }
    const tipoData = porTipo.get(tipo)!;
    tipoData.monto += t.Monto;
    tipoData.count += 1;
  });

  const transaccionesPorTipo = Array.from(porTipo.entries())
    .map(([tipo, data]) => ({ tipo, ...data }))
    .sort((a, b) => b.monto - a.monto);

  // Agrupar por banco
  const porBanco = new Map<string, { monto: number; count: number }>();
  transacciones.forEach((t) => {
    const banco = t.Banco || 'SIN_BANCO';
    if (!porBanco.has(banco)) {
      porBanco.set(banco, { monto: 0, count: 0 });
    }
    const bancoData = porBanco.get(banco)!;
    bancoData.monto += t.Monto;
    bancoData.count += 1;
  });

  const transaccionesPorBanco = Array.from(porBanco.entries())
    .map(([banco, data]) => ({ banco, ...data }))
    .sort((a, b) => b.monto - a.monto);

  return {
    totalIngresos,
    totalEgresos,
    balance: totalIngresos - totalEgresos,
    transaccionesPorDia,
    transaccionesPorTipo,
    transaccionesPorBanco,
  };
}

export function filtrarPorMes(
  transacciones: Transaccion[],
  año: number,
  mes: number
): Transaccion[] {
  const inicio = startOfMonth(new Date(año, mes - 1));
  const fin = endOfMonth(new Date(año, mes - 1));

  return transacciones.filter((t) => {
    try {
      const fecha = parseISO(t.Fecha);
      return fecha >= inicio && fecha <= fin;
    } catch {
      return false;
    }
  });
}

export function obtenerUltimasTransacciones(
  transacciones: Transaccion[],
  limite: number = 10
): Transaccion[] {
  return [...transacciones]
    .sort((a, b) => {
      const fechaA = `${a.Fecha}T${a.Hora}`;
      const fechaB = `${b.Fecha}T${b.Hora}`;
      return fechaB.localeCompare(fechaA);
    })
    .slice(0, limite);
}
