import { a as getTransaccionesPorFecha, c as calcularResumen } from '../../chunks/analytics_BtKaOpQH.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url }) => {
  try {
    const fechaInicio = url.searchParams.get("desde") || void 0;
    const fechaFin = url.searchParams.get("hasta") || void 0;
    const transacciones = await getTransaccionesPorFecha(fechaInicio, fechaFin);
    const resumen = calcularResumen(transacciones);
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transacciones,
          resumen,
          total: transacciones.length
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error en API transacciones:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error al obtener transacciones"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
