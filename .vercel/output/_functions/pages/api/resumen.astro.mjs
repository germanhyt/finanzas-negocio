import { g as getTransacciones, c as calcularResumen } from '../../chunks/analytics_BtKaOpQH.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async () => {
  try {
    const transacciones = await getTransacciones();
    const resumen = calcularResumen(transacciones);
    return new Response(
      JSON.stringify({
        success: true,
        data: resumen
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error en API resumen:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error al calcular resumen"
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
