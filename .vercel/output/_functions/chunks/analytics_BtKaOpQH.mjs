import { google } from 'googleapis';
import { createPrivateKey } from 'node:crypto';

function normalizePrivateKey(rawKey) {
  const withoutQuotes = rawKey.trim().replace(/^"([\s\S]*)"$/, "$1").replace(/^'([\s\S]*)'$/, "$1");
  const normalized = withoutQuotes.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  return normalized.endsWith("\n") ? normalized : `${normalized}
`;
}
function getValidatedPrivateKey(rawKey) {
  const key = normalizePrivateKey(rawKey);
  if (!key.includes("BEGIN PRIVATE KEY") || !key.includes("END PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY no tiene formato PEM válido. Usa el valor private_key del JSON de la cuenta de servicio."
    );
  }
  try {
    createPrivateKey({ key, format: "pem" });
  } catch {
    throw new Error(
      "GOOGLE_PRIVATE_KEY inválida o mal formateada. Verifica comillas, saltos de línea (\\n) y que la clave sea la del JSON descargado."
    );
  }
  return key;
}
const getAuth = () => {
  const email = "finanzas-negocio@subtle-presence-463217-a3.iam.gserviceaccount.com";
  const key = getValidatedPrivateKey("-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCgqFEGZrU918ll\nphq8YTmHiK3VU4oeOc+HOqyGOdgaqa7LdxwzIBIWCy/6UypnuknpqX88t/R2N+TM\nZM7wNeMwlTODBi5dKQDH4P7RKOsVAA3m4H1XjxUa/YAYdi43HzzNFNP8Q3Me7PB6\nmeOsDSBVXd53ol1jLDPLnDr1n2Xyz0pfkzKnXM1dvYAYUJedVLkOwSMBPf4IcGTM\n+E0iIC55adsiX4QLsmxlhqRBVrl5lwoYCMS7FhP3WwQsIW7CPcoj+hMxznL1mwAD\nEHPkIVSXzpF+0dPUKYkhl3QIFH6hCR84jJIaEKvXWKkU+94r90vXJrVSKc1n9jin\ny/yABs1PAgMBAAECggEABveFm/t0PJxQ9YGAg07MCd6ZezjGMo1bPIgE10VG49Eb\n7WLa7DSl1CLkD7zvh9QCRIm/JMjtZvsBhwOQHcaYdZDizPnFpPCUQha1tihKGX0J\nHUv644Mm7Sa1GVp2oplOL66JitT59wtbWlW2E8316v3JGfMGjbhq/pdlzyT8bM0S\n2zmFHutkfIwwu6socTnSquUMxj+2itc5zN/a3EedH1m2d1zKj3dI4OvhCV8H0vRE\nDkoF6yrU39jnXtalUpMlIKf2Ew0QSW+CztWAu9qPqI+yi5j6bb1xLeufftnv6R8k\nEYFVb0ce+8pH0OFLeRp652VGDjABU1o05vvlrGiIMQKBgQDN+PtwGJhrTz2vk7Q5\n8uUlVGk/Y1Fayekff7Xq/Fg9DL549ubwjjZXH0FTBg7++s/bHZ3uZs9N9mcfSv5y\nNoyG0LjMJp53gqKPdpdwUyT2wdXTvLDfanip1kgfv7AFOB7SCgoB2iDRrvyyiTq2\nAglQ6ZA53sutJZ8rHhld0ClnjQKBgQDHrbhWPrttxaffqemkbpm+Lgc1pocjpQ6w\nfCFwXiBz8yt9dNxji7sbM3dndUizppWMyfLV3JYJrkgYyYjwi6Z7As7QOwGP2gmI\nTE9BxxiDv1SFQNILaHEDvi0nBW0NlPVdKEIp3eH06yxB7R5D3ytpjejcyGUyJv+n\npKYhRY4TSwKBgA/XBf8o5Q/bmDLYeRO7ykOEqlNln+wLexIhECxyG5cWU8+ZrUjy\nptssXCm2XZDeWP3Q2URsQ6ULPgL6EXdXGpeDlbKdhbJLKZU+2YaZ3k3bukX+TNvh\npEXrZMCMTU0Zc8VTYFGkJMH7YxOX2hwFLBI85AqPR7qZGhSGzAya5ZRBAoGATRiu\nC968z215m8onA+4QPnXXIsfhdcnNGidTYed18E77g70TOvxAiggdGj0WjQbMx0dS\nE3DQHXzFKYzm6rmA1g4HfC7MM5akB5QvJd6RgIznPWwBrZXtzNwo4uAdcxkIg6d/\npFqfW8lRlULQZLRONrssJdLZ/7s/CqNv4XjRmnECgYEAnkN9gvWn98UC/DsAUO+s\nXxsx5GqI5gtBy8mmwL8Cm9gtc33qFQN80qSf5sdJjOI2NPFtzx3SrdWtn7UgP+E3\nJzGBzXf8Db9qpaPrzWdtzc23IPSA2EZNlrCZz8LshnQWi4XusktgGHWmUj+S5pO+\np/f52tdWWErEY8aYk/3tw1w=\n-----END PRIVATE KEY-----\n");
  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });
};
async function getTransacciones() {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = "11C-PJF495WQluU2SE5XarnaGHEN7WZ5hmu1CjS_Z7J0";
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "DB!A2:G"
    });
    const rows = response.data.values || [];
    return rows.map((row) => ({
      Fecha: row[0] || "",
      Hora: row[1] || "",
      Banco: row[2] || "",
      Tipo: row[3] || "",
      Destinatario: row[4] || "",
      Num_Operacion: row[5] || "",
      Monto: parseFloat(row[6]) || 0
    }));
  } catch (error) {
    console.error("Error al obtener datos del Sheet:", error);
    throw error;
  }
}
async function getTransaccionesPorFecha(fechaInicio, fechaFin) {
  const transacciones = await getTransacciones();
  if (!fechaInicio && !fechaFin) {
    return transacciones;
  }
  return transacciones.filter((transaccion) => {
    const fecha = new Date(transaccion.Fecha);
    const inicio = fechaInicio ? new Date(fechaInicio) : /* @__PURE__ */ new Date(0);
    const fin = fechaFin ? new Date(fechaFin) : /* @__PURE__ */ new Date();
    return fecha >= inicio && fecha <= fin;
  });
}

const TIPOS_EGRESO = ["PAGO_QR", "YAPEO_CELULAR", "PAGO_SERVICIO", "TRANSFERENCIA"];
function clasificarTransaccion(tipo) {
  return TIPOS_EGRESO.includes(tipo.toUpperCase()) ? "egreso" : "ingreso";
}
function calcularResumen(transacciones) {
  let totalIngresos = 0;
  let totalEgresos = 0;
  transacciones.forEach((t) => {
    if (clasificarTransaccion(t.Tipo) === "egreso") {
      totalEgresos += t.Monto;
    } else {
      totalIngresos += t.Monto;
    }
  });
  const porDia = /* @__PURE__ */ new Map();
  transacciones.forEach((t) => {
    const fecha = t.Fecha;
    if (!porDia.has(fecha)) {
      porDia.set(fecha, { ingresos: 0, egresos: 0 });
    }
    const dia = porDia.get(fecha);
    if (clasificarTransaccion(t.Tipo) === "egreso") {
      dia.egresos += t.Monto;
    } else {
      dia.ingresos += t.Monto;
    }
  });
  const transaccionesPorDia = Array.from(porDia.entries()).map(([fecha, data]) => ({ fecha, ...data })).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const porTipo = /* @__PURE__ */ new Map();
  transacciones.forEach((t) => {
    const tipo = t.Tipo || "SIN_TIPO";
    if (!porTipo.has(tipo)) {
      porTipo.set(tipo, { monto: 0, count: 0 });
    }
    const tipoData = porTipo.get(tipo);
    tipoData.monto += t.Monto;
    tipoData.count += 1;
  });
  const transaccionesPorTipo = Array.from(porTipo.entries()).map(([tipo, data]) => ({ tipo, ...data })).sort((a, b) => b.monto - a.monto);
  const porBanco = /* @__PURE__ */ new Map();
  transacciones.forEach((t) => {
    const banco = t.Banco || "SIN_BANCO";
    if (!porBanco.has(banco)) {
      porBanco.set(banco, { monto: 0, count: 0 });
    }
    const bancoData = porBanco.get(banco);
    bancoData.monto += t.Monto;
    bancoData.count += 1;
  });
  const transaccionesPorBanco = Array.from(porBanco.entries()).map(([banco, data]) => ({ banco, ...data })).sort((a, b) => b.monto - a.monto);
  return {
    totalIngresos,
    totalEgresos,
    balance: totalIngresos - totalEgresos,
    transaccionesPorDia,
    transaccionesPorTipo,
    transaccionesPorBanco
  };
}

export { getTransaccionesPorFecha as a, calcularResumen as c, getTransacciones as g };
