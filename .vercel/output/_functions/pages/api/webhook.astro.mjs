export { renderers } from '../../renderers.mjs';

const store = {
  transacciones: [],
  lastUpdate: null,
  subscribers: /* @__PURE__ */ new Set()
};
function addTransaccion(transaccion) {
  const existe = store.transacciones.some(
    (t) => t.Num_Operacion === transaccion.Num_Operacion
  );
  if (!existe) {
    store.transacciones.unshift(transaccion);
    store.lastUpdate = /* @__PURE__ */ new Date();
    notifySubscribers();
  }
}
function notifySubscribers() {
  store.subscribers.forEach((callback) => {
    callback(store.transacciones);
  });
}

const POST = async ({ request }) => {
  try {
    const webhookSecret = "q5jWc72zgIMeYXGnCakKrSTsRDJmt69fbP0LZ4l1Q3NvyxwHFVBiEdOh8UopAu";
    const authHeader = request.headers.get("X-Webhook-Secret");
    if (webhookSecret && authHeader !== webhookSecret) {
      return new Response(
        JSON.stringify({ success: false, error: "No autorizado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const payload = await request.json();
    if (!payload.num_operacion || !payload.monto) {
      return new Response(
        JSON.stringify({ success: false, error: "Payload inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const transaccion = {
      Fecha: payload.fecha,
      Hora: payload.hora,
      Banco: payload.banco,
      Tipo: payload.tipo,
      Destinatario: payload.destinatario,
      Num_Operacion: payload.num_operacion,
      Monto: typeof payload.monto === "string" ? parseFloat(payload.monto) : payload.monto
    };
    addTransaccion(transaccion);
    console.log("Nueva transacción recibida:", transaccion.Num_Operacion);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Transacción registrada",
        data: transaccion
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error en webhook:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Error procesando webhook" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const GET = async () => {
  return new Response(
    JSON.stringify({ status: "ok", message: "Webhook endpoint activo" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
