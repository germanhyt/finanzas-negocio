import { e as createComponent, g as addAttribute, k as renderHead, l as renderSlot, r as renderTemplate, h as createAstro, n as renderComponent } from '../chunks/astro/server_CuVPP981.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                 */
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell } from 'recharts';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "Finanzas Negocio - Dashboard" } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><meta name="generator"${addAttribute(Astro2.generator, "content")}><meta name="description" content="Dashboard de control financiero - Ingresos y Egresos"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code&display=swap" rel="stylesheet"><title>${title}</title>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "C:/Users/ivanh/Downloads/9_Trabajo_Empresas/PROYECTOS PERSONALES/finanzas-negocios/finanzas-negocio/src/layouts/Layout.astro", void 0);

function StatsCards({ resumen }) {
  const formatMoney = (value) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN"
    }).format(value);
  };
  return /* @__PURE__ */ jsxs("div", { className: "stats-cards", children: [
    /* @__PURE__ */ jsxs("div", { className: "stat-card stat-egresos", children: [
      /* @__PURE__ */ jsx("div", { className: "stat-icon", children: "📤" }),
      /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
        /* @__PURE__ */ jsx("span", { className: "stat-label", children: "Total Egresos" }),
        /* @__PURE__ */ jsx("span", { className: "stat-value", children: formatMoney(resumen.totalEgresos) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "stat-card stat-ingresos", children: [
      /* @__PURE__ */ jsx("div", { className: "stat-icon", children: "📥" }),
      /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
        /* @__PURE__ */ jsx("span", { className: "stat-label", children: "Total Ingresos" }),
        /* @__PURE__ */ jsx("span", { className: "stat-value", children: formatMoney(resumen.totalIngresos) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `stat-card ${resumen.balance >= 0 ? "stat-positive" : "stat-negative"}`, children: [
      /* @__PURE__ */ jsx("div", { className: "stat-icon", children: resumen.balance >= 0 ? "📈" : "📉" }),
      /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
        /* @__PURE__ */ jsx("span", { className: "stat-label", children: "Balance" }),
        /* @__PURE__ */ jsx("span", { className: "stat-value", children: formatMoney(resumen.balance) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "stat-card stat-transacciones", children: [
      /* @__PURE__ */ jsx("div", { className: "stat-icon", children: "🔢" }),
      /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
        /* @__PURE__ */ jsx("span", { className: "stat-label", children: "Transacciones" }),
        /* @__PURE__ */ jsx("span", { className: "stat-value", children: resumen.transaccionesPorTipo.reduce((acc, t) => acc + t.count, 0) })
      ] })
    ] })
  ] });
}

function BalanceChart({ data }) {
  if (!data || data.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "no-data", children: "Sin datos disponibles" });
  }
  const chartData = data.slice(-30).map((item) => ({
    ...item,
    fecha: item.fecha.slice(5)
    // Mostrar solo MM-DD
  }));
  const formatMoney = (value) => {
    return `S/ ${value.toFixed(0)}`;
  };
  return /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxs(BarChart, { data: chartData, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [
    /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#374151" }),
    /* @__PURE__ */ jsx(
      XAxis,
      {
        dataKey: "fecha",
        stroke: "#9CA3AF",
        fontSize: 12,
        tickMargin: 10
      }
    ),
    /* @__PURE__ */ jsx(
      YAxis,
      {
        stroke: "#9CA3AF",
        fontSize: 12,
        tickFormatter: formatMoney
      }
    ),
    /* @__PURE__ */ jsx(
      Tooltip,
      {
        contentStyle: {
          backgroundColor: "#1F2937",
          border: "1px solid #374151",
          borderRadius: "8px"
        },
        labelStyle: { color: "#F3F4F6" },
        formatter: (value) => [`S/ ${Number(value).toFixed(2)}`, ""]
      }
    ),
    /* @__PURE__ */ jsx(Legend, {}),
    /* @__PURE__ */ jsx(
      Bar,
      {
        dataKey: "egresos",
        fill: "#EF4444",
        name: "Egresos",
        radius: [4, 4, 0, 0]
      }
    ),
    /* @__PURE__ */ jsx(
      Bar,
      {
        dataKey: "ingresos",
        fill: "#10B981",
        name: "Ingresos",
        radius: [4, 4, 0, 0]
      }
    )
  ] }) });
}

const COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];
function TiposPieChart({ data }) {
  if (!data || data.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "no-data", children: "Sin datos disponibles" });
  }
  const formatMoney = (value) => {
    return `S/ ${value.toFixed(2)}`;
  };
  return /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxs(PieChart, { children: [
    /* @__PURE__ */ jsx(
      Pie,
      {
        data,
        cx: "50%",
        cy: "50%",
        labelLine: false,
        outerRadius: 100,
        fill: "#8884d8",
        dataKey: "monto",
        nameKey: "tipo",
        label: ({ name, percent }) => `${String(name).replace("_", " ")} ${((percent ?? 0) * 100).toFixed(0)}%`,
        children: data.map((_, index) => /* @__PURE__ */ jsx(
          Cell,
          {
            fill: COLORS[index % COLORS.length]
          },
          `cell-${index}`
        ))
      }
    ),
    /* @__PURE__ */ jsx(
      Tooltip,
      {
        contentStyle: {
          backgroundColor: "#1F2937",
          border: "1px solid #374151",
          borderRadius: "8px"
        },
        formatter: (value, name) => [
          formatMoney(Number(value)),
          String(name).replace("_", " ")
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      Legend,
      {
        formatter: (value) => value.replace("_", " ")
      }
    )
  ] }) });
}

function TransaccionesTable({ transacciones }) {
  const formatMoney = (value) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN"
    }).format(value);
  };
  const getTipoClass = (tipo) => {
    const tiposEgreso = ["PAGO_QR", "YAPEO_CELULAR", "PAGO_SERVICIO", "TRANSFERENCIA"];
    return tiposEgreso.includes(tipo.toUpperCase()) ? "tipo-egreso" : "tipo-ingreso";
  };
  if (!transacciones || transacciones.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "no-data", children: "No hay transacciones registradas" });
  }
  const displayData = [...transacciones].sort((a, b) => {
    const fechaA = `${a.Fecha}T${a.Hora}`;
    const fechaB = `${b.Fecha}T${b.Hora}`;
    return fechaB.localeCompare(fechaA);
  }).slice(0, 20);
  return /* @__PURE__ */ jsx("div", { className: "table-wrapper", children: /* @__PURE__ */ jsxs("table", { className: "transacciones-table", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { children: "Fecha" }),
      /* @__PURE__ */ jsx("th", { children: "Hora" }),
      /* @__PURE__ */ jsx("th", { children: "Banco" }),
      /* @__PURE__ */ jsx("th", { children: "Tipo" }),
      /* @__PURE__ */ jsx("th", { children: "Destinatario" }),
      /* @__PURE__ */ jsx("th", { children: "Monto" }),
      /* @__PURE__ */ jsx("th", { children: "Operación" })
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: displayData.map((t, index) => /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("td", { children: t.Fecha }),
      /* @__PURE__ */ jsx("td", { children: t.Hora }),
      /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: "badge badge-banco", children: t.Banco }) }),
      /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: `badge ${getTipoClass(t.Tipo)}`, children: t.Tipo.replace("_", " ") }) }),
      /* @__PURE__ */ jsx("td", { className: "destinatario", children: t.Destinatario }),
      /* @__PURE__ */ jsx("td", { className: `monto ${getTipoClass(t.Tipo)}`, children: formatMoney(t.Monto) }),
      /* @__PURE__ */ jsx("td", { className: "operacion", children: t.Num_Operacion })
    ] }, t.Num_Operacion || index)) })
  ] }) });
}

function DateFilter({
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange,
  onFilter,
  onClear
}) {
  return /* @__PURE__ */ jsxs("div", { className: "date-filter", children: [
    /* @__PURE__ */ jsxs("div", { className: "filter-group", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "fecha-desde", children: "Desde:" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "date",
          id: "fecha-desde",
          value: fechaDesde,
          onChange: (e) => onFechaDesdeChange(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "filter-group", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "fecha-hasta", children: "Hasta:" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "date",
          id: "fecha-hasta",
          value: fechaHasta,
          onChange: (e) => onFechaHastaChange(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "filter-actions", children: [
      /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: onFilter, children: "Filtrar" }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-secondary", onClick: onClear, children: "Limpiar" })
    ] })
  ] });
}

function Dashboard({ initialData }) {
  const [transacciones, setTransacciones] = useState(
    initialData?.transacciones || []
  );
  const [resumen, setResumen] = useState(
    initialData?.resumen || null
  );
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.append("desde", fechaDesde);
      if (fechaHasta) params.append("hasta", fechaHasta);
      const url = `/api/transacciones${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setTransacciones(data.data.transacciones);
        setResumen(data.data.resumen);
      } else {
        setError(data.error || "Error al cargar datos");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!initialData) {
      fetchData();
    }
  }, []);
  const handleFilter = () => {
    fetchData();
  };
  const handleClearFilter = () => {
    setFechaDesde("");
    setFechaHasta("");
    fetchData();
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "loading-container", children: [
      /* @__PURE__ */ jsx("div", { className: "spinner" }),
      /* @__PURE__ */ jsx("p", { children: "Cargando datos financieros..." })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "error-container", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        "Error: ",
        error
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: fetchData, children: "Reintentar" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "dashboard", children: [
    /* @__PURE__ */ jsxs("header", { className: "dashboard-header", children: [
      /* @__PURE__ */ jsx("h1", { children: "Análisis del negocio" }),
      /* @__PURE__ */ jsx("p", { className: "subtitle", children: "Control de ingresos y egresos en tiempo real" })
    ] }),
    /* @__PURE__ */ jsx(
      DateFilter,
      {
        fechaDesde,
        fechaHasta,
        onFechaDesdeChange: setFechaDesde,
        onFechaHastaChange: setFechaHasta,
        onFilter: handleFilter,
        onClear: handleClearFilter
      }
    ),
    resumen && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(StatsCards, { resumen }),
      /* @__PURE__ */ jsxs("div", { className: "charts-grid", children: [
        /* @__PURE__ */ jsxs("div", { className: "chart-container", children: [
          /* @__PURE__ */ jsx("h3", { children: "Balance por Día" }),
          /* @__PURE__ */ jsx(BalanceChart, { data: resumen.transaccionesPorDia })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "chart-container", children: [
          /* @__PURE__ */ jsx("h3", { children: "Distribución por Tipo" }),
          /* @__PURE__ */ jsx(TiposPieChart, { data: resumen.transaccionesPorTipo })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "table-container", children: [
      /* @__PURE__ */ jsx("h3", { children: "Últimas Transacciones" }),
      /* @__PURE__ */ jsx(TransaccionesTable, { transacciones })
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Finanzas Negocio - Dashboard" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Dashboard", Dashboard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/ivanh/Downloads/9_Trabajo_Empresas/PROYECTOS PERSONALES/finanzas-negocios/finanzas-negocio/src/components/Dashboard", "client:component-export": "Dashboard" })} ` })}`;
}, "C:/Users/ivanh/Downloads/9_Trabajo_Empresas/PROYECTOS PERSONALES/finanzas-negocios/finanzas-negocio/src/pages/index.astro", void 0);

const $$file = "C:/Users/ivanh/Downloads/9_Trabajo_Empresas/PROYECTOS PERSONALES/finanzas-negocios/finanzas-negocio/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
