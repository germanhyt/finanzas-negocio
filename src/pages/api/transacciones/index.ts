import type { APIRoute } from 'astro';
import { getTransacciones, getTransaccionesPorFecha } from '../../../lib/sheets';
import { calcularResumen } from '../../../lib/analytics';

export const GET: APIRoute = async ({ url }) => {
  try {
    const fechaInicio = url.searchParams.get('desde') || undefined;
    const fechaFin = url.searchParams.get('hasta') || undefined;

    const transacciones = await getTransaccionesPorFecha(fechaInicio, fechaFin);
    const resumen = calcularResumen(transacciones);

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
