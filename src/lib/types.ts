// Tipos para las transacciones financieras
export interface Transaccion {
  Fecha: string;
  Hora: string;
  Movimiento: string;
  Concepto: string;
  Banco: string;
  Tipo: string;
  Destinatario: string;
  Num_Operacion: string;
  Monto: number;
  Categoria?: string;
}

export interface Presupuesto {
  ID: string;
  Mes_Anio: string;
  Categoria: string;
  Monto_Presupuestado: number;
}


export interface ResumenFinanciero {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  transaccionesPorDia: { fecha: string; ingresos: number; egresos: number }[];
  transaccionesPorTipo: { tipo: string; monto: number; count: number }[];
  transaccionesPorBanco: { banco: string; monto: number; count: number }[];
  presupuestos: PresupuestoEstado[];
}

export interface PresupuestoEstado {
  id?: string;
  mesAnio: string;
  categoria: string;
  presupuestado: number;
  real: number;
  porcentaje: number;
  diferencia: number;
}



export interface WebhookPayload {
  fecha: string;
  hora: string;
  movimiento?: string;
  concepto?: string;
  banco: string;
  tipo: string;
  monto: number;
  destinatario: string;
  num_operacion: string;
}
