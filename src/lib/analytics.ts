import type { Transaccion, ResumenFinanciero, Presupuesto, PresupuestoEstado } from './types';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { MOVIMIENTO, TIPOS_EGRESO, CATEGORIA, ALERTAS } from './constants';

export function clasificarTransaccion(tipo: string, movimiento?: string): 'ingreso' | 'egreso' {
  if (movimiento) return movimiento === MOVIMIENTO.EGRESO ? 'egreso' : 'ingreso';
  return TIPOS_EGRESO.includes(tipo.toUpperCase() as any) ? 'egreso' : 'ingreso';
}

export function calcularResumen(
  transacciones: Transaccion[],
  presupuestosDef: Presupuesto[] = []
): ResumenFinanciero {
  let totalIngresos = 0;
  let totalEgresos = 0;

  // Calcular totales
  transacciones.forEach((t) => {
    if (clasificarTransaccion(t.Tipo, t.Movimiento) === 'egreso') {
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
    if (clasificarTransaccion(t.Tipo, t.Movimiento) === 'egreso') {
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
    presupuestos: calcularEstadoPresupuesto(transacciones, presupuestosDef),
  };
}


export async function verificarYEnviarAlertas(presupuestos: PresupuestoEstado[]) {
  const WEBHOOK_URL = import.meta.env.WEBHOOK_NOTIFICATION;

  if (!WEBHOOK_URL) return;

  for (const p of presupuestos) {
    // Alerta al 80% y 100%
    if (p.porcentaje >= 80 && p.porcentaje < 85) {
      await enviarAlerta(WEBHOOK_URL, p, ALERTAS.ADVERTENCIA);
    } else if (p.porcentaje >= 100 && p.porcentaje < 105) {
      await enviarAlerta(WEBHOOK_URL, p, ALERTAS.LIMITE_ALCANZADO);
    }
  }
}

async function enviarAlerta(url: string, p: PresupuestoEstado, tipo: string) {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alerta: tipo,
        categoria: p.categoria,
        presupuestado: p.presupuestado,
        real: p.real,
        porcentaje: p.porcentaje,
        diferencia: p.diferencia
      })
    });
  } catch (e) {
    console.error('Error enviando alerta a n8n:', e);
  }
}


export function calcularEstadoPresupuesto(
  transacciones: Transaccion[],
  presupuestosDef: Presupuesto[]
): PresupuestoEstado[] {
  return presupuestosDef.map((p) => {
    // Filtrar transacciones que coincidan con la categoría Y el mes/año del presupuesto
    const real = transacciones
      .filter((t) => {
        const esEgreso = clasificarTransaccion(t.Tipo, t.Movimiento) === 'egreso';
        const mismaCategoria = (t.Categoria || CATEGORIA.OTROS) === p.Categoria;
        const mismoMes = t.Fecha.startsWith(p.Mes_Anio); // p.Mes_Anio es YYYY-MM
        return esEgreso && mismaCategoria && mismoMes;
      })
      .reduce((sum, t) => sum + t.Monto, 0);

    return {
      id: p.ID,
      mesAnio: p.Mes_Anio,
      categoria: p.Categoria,
      presupuestado: p.Monto_Presupuestado,
      real,
      porcentaje: p.Monto_Presupuestado > 0 ? (real / p.Monto_Presupuestado) * 100 : 0,
      diferencia: p.Monto_Presupuestado - real,
    };
  });
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
