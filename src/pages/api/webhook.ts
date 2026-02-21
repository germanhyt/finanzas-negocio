import type { APIRoute } from 'astro';
import { addTransaccion } from '../../lib/store';
import type { WebhookPayload, Transaccion } from '../../lib/types';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Validar secret del webhook (opcional pero recomendado)
    const webhookSecret = import.meta.env.WEBHOOK_SECRET;
    const authHeader = request.headers.get('X-Webhook-Secret');
    
    if (webhookSecret && authHeader !== webhookSecret) {
      return new Response(
        JSON.stringify({ success: false, error: 'No autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload: WebhookPayload = await request.json();

    // Validar payload
    if (!payload.num_operacion || !payload.monto) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payload inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convertir a formato de transacción
    const transaccion: Transaccion = {
      Fecha: payload.fecha,
      Hora: payload.hora,
      Banco: payload.banco,
      Tipo: payload.tipo,
      Destinatario: payload.destinatario,
      Num_Operacion: payload.num_operacion,
      Monto: typeof payload.monto === 'string' 
        ? parseFloat(payload.monto) 
        : payload.monto,
    };

    // Agregar al store en memoria
    addTransaccion(transaccion);

    console.log('Nueva transacción recibida:', transaccion.Num_Operacion);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Transacción registrada',
        data: transaccion,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error en webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error procesando webhook' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Health check para el webhook
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ status: 'ok', message: 'Webhook endpoint activo' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
