import type { APIRoute } from 'astro';
import { addTransaccionSheet } from '../../../lib/sheets';
import type { Transaccion } from '../../../lib/types';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();

        // Validaciones básicas
        if (!data.Monto || !data.Movimiento || !data.Banco) {
            return new Response(
                JSON.stringify({ success: false, error: 'Datos incompletos' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const transaccion: Transaccion = {
            Fecha: data.Fecha || new Date().toISOString().split('T')[0],
            Hora: data.Hora || new Date().toLocaleTimeString('es-PE', { hour12: false }),
            Movimiento: data.Movimiento,
            Concepto: data.Concepto || 'Sin concepto',
            Banco: data.Banco,
            Tipo: data.Tipo || 'OTROS',
            Destinatario: data.Destinatario || 'Varios',
            Num_Operacion: data.Num_Operacion || 'S/N',
            Monto: Number(data.Monto),
            Categoria: data.Categoria || 'Otros',
        };


        await addTransaccionSheet(transaccion);

        return new Response(
            JSON.stringify({ success: true, message: 'Transacción guardada correctamente' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        console.error('Error al guardar transacción:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Error al guardar en Google Sheets',
                details: error.message || String(error)
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
