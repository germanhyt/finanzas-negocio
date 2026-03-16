import type { APIRoute } from 'astro';
import { getTransacciones, getPresupuestos } from '../../lib/sheets';
import { calcularResumen, verificarYEnviarAlertas } from '../../lib/analytics';


export const GET: APIRoute = async () => {
  try {
    const [transacciones, presupuestos] = await Promise.all([
      getTransacciones(),
      getPresupuestos(),
    ]);
    const resumen = calcularResumen(transacciones, presupuestos);
    
    // Ejecutar verificación de alertas sin bloquear la respuesta
    void verificarYEnviarAlertas(resumen.presupuestos);

    return new Response(
      JSON.stringify({
        success: true,
        data: resumen,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error en API resumen:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al calcular resumen',
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
