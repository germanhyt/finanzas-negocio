import type { APIRoute } from 'astro';
import { getTransacciones, getTransaccionesPorFecha, getPresupuestos } from '../../../lib/sheets';
import { calcularResumen, verificarYEnviarAlertas } from '../../../lib/analytics';


export const GET: APIRoute = async ({ url }) => {
  try {
    const fechaInicio = url.searchParams.get('desde') || undefined;
    const fechaFin = url.searchParams.get('hasta') || undefined;

    const [transacciones, presupuestos] = await Promise.all([
      getTransaccionesPorFecha(fechaInicio, fechaFin),
      getPresupuestos(),
    ]);
    const resumen = calcularResumen(transacciones, presupuestos);

    // Ejecutar verificación de alertas sin bloquear la respuesta
    void verificarYEnviarAlertas(resumen.presupuestos);


    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transacciones,
          resumen,
          total: transacciones.length,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error en API transacciones:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener transacciones',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
