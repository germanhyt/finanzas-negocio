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
}

export interface ResumenFinanciero {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  transaccionesPorDia: { fecha: string; ingresos: number; egresos: number }[];
  transaccionesPorTipo: { tipo: string; monto: number; count: number }[];
  transaccionesPorBanco: { banco: string; monto: number; count: number }[];
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
