import { motion } from "framer-motion";
import { LayoutDashboard, Users, CreditCard, HelpCircle, Mail, Loader2, FileText, BookOpen, ShoppingCart, Activity } from "lucide-react";
import { useState, useEffect, useMemo, type CSSProperties } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  adminGetStats,
  adminGetOrders,
  adminGetBlogPosts,
  adminGetQuestions,
  adminGetReports,
  type AdminStats,
} from "@/lib/api";
import EmptyState from "@/components/EmptyState";

const subscriptionPieColors = {
  Activas: "hsl(38, 70%, 55%)",
  Inactivas: "hsl(225, 15%, 40%)",
  Canceladas: "hsl(0, 50%, 45%)",
};

const TOOLTIP_LIGHT_TEXT = "#e8e6e3";
const tooltipContentStyle: CSSProperties = {
  background: "hsl(225, 25%, 12%)",
  border: "1px solid hsl(225, 15%, 22%)",
  borderRadius: "12px",
  fontSize: "12px",
  padding: "8px 12px",
  color: TOOLTIP_LIGHT_TEXT,
};

type TooltipPayloadItem = { name?: string | number; value?: number; dataKey?: string; color?: string; payload?: Record<string, unknown> };

function DashboardTooltip(props: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  formatter?: (value: number, name: string, item: TooltipPayloadItem) => [string, string];
  labelFormatter?: (label: unknown) => string;
}) {
  const { active, payload, label, formatter, labelFormatter } = props;
  if (!active || !payload?.length) return null;
  const title = labelFormatter ? labelFormatter(label) : (label != null ? String(label) : payload[0]?.name != null ? String(payload[0].name) : "");
  return (
    <div style={tooltipContentStyle}>
      {title && <div style={{ marginBottom: 4, color: TOOLTIP_LIGHT_TEXT, fontWeight: 500 }}>{title}</div>}
      {payload.map((item, i) => {
        const value = item.value ?? 0;
        const nameStr = item.name != null ? String(item.name) : "";
        const display = formatter ? formatter(value, nameStr, item)?.[0] : `${nameStr}: ${value}`;
        return (
          <div key={i} style={{ color: TOOLTIP_LIGHT_TEXT }}>
            {display}
          </div>
        );
      })}
    </div>
  );
}

const CHART_COLORS = {
  primary: "hsl(38, 70%, 55%)",
  secondary: "hsl(225, 60%, 55%)",
  muted: "hsl(225, 15%, 40%)",
  accent: "hsl(280, 60%, 55%)",
  success: "hsl(142, 55%, 45%)",
  draft: "hsl(225, 20%, 35%)",
};

const ORDER_TYPE_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.accent,
  CHART_COLORS.success,
  "hsl(20, 70%, 55%)",
  "hsl(180, 55%, 50%)",
];

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [orders, setOrders] = useState<{ type: string; amount: string }[]>([]);
  const [blogPosts, setBlogPosts] = useState<{ status: string }[]>([]);
  const [questions, setQuestions] = useState<{ status: string }[]>([]);
  const [reports, setReports] = useState<{ type: string }[]>([]);

  useEffect(() => {
    adminGetStats()
      .then(setStats)
      .catch((e) => setStatsError(e instanceof Error ? e.message : "Error al cargar estadísticas"));
    adminGetOrders().then((o) => setOrders(o));
    adminGetBlogPosts().then((p) => setBlogPosts(p));
    adminGetQuestions().then((q) => setQuestions(q));
    adminGetReports().then((r) => setReports(r));
  }, []);

  const kpiCards = stats
    ? [
        { icon: Users, label: "Usuarios totales", value: stats.totalUsers, up: true },
        { icon: CreditCard, label: "Suscripciones activas", value: stats.activeSubscriptions, up: true },
        { icon: HelpCircle, label: "Suscripciones inactivas", value: stats.inactiveSubscriptions, up: false },
        { icon: Mail, label: "Suscripciones canceladas", value: stats.cancelledSubscriptions, up: false },
      ]
    : [];

  const subscriptionPieData = stats
    ? [
        { name: "Activas", value: stats.activeSubscriptions, color: subscriptionPieColors.Activas },
        { name: "Inactivas", value: stats.inactiveSubscriptions, color: subscriptionPieColors.Inactivas },
        { name: "Canceladas", value: stats.cancelledSubscriptions, color: subscriptionPieColors.Canceladas },
      ].filter((d) => d.value > 0)
    : [];

  const barChartData = stats
    ? [
        { name: "Usuarios", valor: stats.totalUsers, fill: "hsl(225, 60%, 55%)" },
        { name: "Activas", valor: stats.activeSubscriptions, fill: subscriptionPieColors.Activas },
        { name: "Inactivas", valor: stats.inactiveSubscriptions, fill: subscriptionPieColors.Inactivas },
        { name: "Canceladas", valor: stats.cancelledSubscriptions, fill: subscriptionPieColors.Canceladas },
      ]
    : [];

  const totalSubs =
    stats == null
      ? 0
      : stats.activeSubscriptions + stats.inactiveSubscriptions + stats.cancelledSubscriptions;
  const radialData =
    stats && totalSubs > 0
      ? [
          {
            name: "Activas",
            value: Math.round((stats.activeSubscriptions / totalSubs) * 100),
            fill: subscriptionPieColors.Activas,
          },
          {
            name: "Inactivas",
            value: Math.round((stats.inactiveSubscriptions / totalSubs) * 100),
            fill: subscriptionPieColors.Inactivas,
          },
          {
            name: "Canceladas",
            value: Math.round((stats.cancelledSubscriptions / totalSubs) * 100),
            fill: subscriptionPieColors.Canceladas,
          },
        ].filter((d) => d.value > 0)
      : [];

  const compositionData =
    stats && totalSubs > 0
      ? [
          {
            name: "Activas",
            cantidad: stats.activeSubscriptions,
            porcentaje: Math.round((stats.activeSubscriptions / totalSubs) * 100),
            fill: subscriptionPieColors.Activas,
          },
          {
            name: "Inactivas",
            cantidad: stats.inactiveSubscriptions,
            porcentaje: Math.round((stats.inactiveSubscriptions / totalSubs) * 100),
            fill: subscriptionPieColors.Inactivas,
          },
          {
            name: "Canceladas",
            cantidad: stats.cancelledSubscriptions,
            porcentaje: Math.round((stats.cancelledSubscriptions / totalSubs) * 100),
            fill: subscriptionPieColors.Canceladas,
          },
        ].filter((d) => d.cantidad > 0)
      : [];

  const hasData = stats != null && (stats.totalUsers > 0 || totalSubs > 0);

  // Orders by type (for chart) — distinct color per type
  const ordersByType = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      const key = o.type.replace(/_/g, " ") || "Otro";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      fill: ORDER_TYPE_PALETTE[i % ORDER_TYPE_PALETTE.length],
    }));
  }, [orders]);

  // Questions by status
  const questionsByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    questions.forEach((q) => {
      const key = q.status === "new" ? "Nueva" : q.status === "waiting" ? "En espera" : q.status === "answered" ? "Respondida" : q.status;
      map[key] = (map[key] || 0) + 1;
    });
    const colors: Record<string, string> = { Nueva: CHART_COLORS.primary, "En espera": CHART_COLORS.accent, Respondida: CHART_COLORS.success };
    return Object.entries(map).map(([name, value]) => ({ name, value, fill: colors[name] || CHART_COLORS.muted }));
  }, [questions]);

  // Reports by type — distinct color per type
  const reportsByType = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach((r) => {
      const key = r.type.replace(/_/g, " ") || "Otro";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value], i) => ({
      name,
      valor: value,
      fill: ORDER_TYPE_PALETTE[i % ORDER_TYPE_PALETTE.length],
    }));
  }, [reports]);

  // Blog: published vs draft
  const blogByStatus = useMemo(() => {
    const published = blogPosts.filter((p) => p.status === "published").length;
    const draft = blogPosts.filter((p) => p.status === "draft").length;
    return [
      { name: "Publicados", value: published, fill: CHART_COLORS.success },
      { name: "Borrador", value: draft, fill: CHART_COLORS.draft },
    ].filter((d) => d.value > 0);
  }, [blogPosts]);

  const totalOrders = orders.length;
  const totalBlog = blogPosts.length;
  const totalQuestions = questions.length;
  const totalReports = reports.length;
  const hasExtraData = totalOrders > 0 || totalBlog > 0 || totalQuestions > 0 || totalReports > 0;
  const usage = stats?.astrologyApiUsage;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {statsError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {statsError}
        </div>
      )}

      {/* KPI cards - Users & Subscriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats === null && !statsError ? (
          <div className="col-span-full flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          kpiCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-6 premium-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-sans text-3xl text-foreground tabular-nums">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* KPI cards - Orders, Blog, Questions, Reports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-2xl p-6 premium-shadow">
          <ShoppingCart className="w-5 h-5 text-primary mb-3" />
          <p className="font-sans text-3xl text-foreground tabular-nums">{totalOrders}</p>
          <p className="text-sm text-muted-foreground">Total pedidos</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-card rounded-2xl p-6 premium-shadow">
          <FileText className="w-5 h-5 text-primary mb-3" />
          <p className="font-sans text-3xl text-foreground tabular-nums">{totalBlog}</p>
          <p className="text-sm text-muted-foreground">Artículos blog</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 premium-shadow">
          <HelpCircle className="w-5 h-5 text-primary mb-3" />
          <p className="font-sans text-3xl text-foreground tabular-nums">{totalQuestions}</p>
          <p className="text-sm text-muted-foreground">Preguntas</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="glass-card rounded-2xl p-6 premium-shadow">
          <BookOpen className="w-5 h-5 text-primary mb-3" />
          <p className="font-sans text-3xl text-foreground tabular-nums">{totalReports}</p>
          <p className="text-sm text-muted-foreground">Reportes</p>
        </motion.div>
      </div>

      {!hasData && !hasExtraData && stats !== null && !statsError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8 premium-shadow">
          <EmptyState icon={LayoutDashboard} message="No hay datos en el panel." />
        </motion.div>
      )}

      {(hasData || hasExtraData) && (
        <>
          {hasData && (
          <>
          {/* Row: Pie (donut) + Bar chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 premium-shadow"
            >
              <h3 className="font-serif text-lg text-foreground mb-4">Distribución de suscripciones</h3>
              {subscriptionPieData.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                  Sin datos de suscripciones
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={subscriptionPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {subscriptionPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={(props) => <DashboardTooltip active={props.active} payload={props.payload as TooltipPayloadItem[]} label={props.label} formatter={(v) => [String(v), ""]} />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2 flex-wrap">
                    {subscriptionPieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-muted-foreground">
                          {d.name}: {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card rounded-2xl p-6 premium-shadow"
            >
              <h3 className="font-serif text-lg text-foreground mb-4">Comparativa general</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 18%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(225, 15%, 45%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(225, 15%, 45%)" />
                  <Tooltip content={(props) => <DashboardTooltip active={props.active} payload={props.payload as TooltipPayloadItem[]} label={props.label} />} cursor={{ fill: "hsl(225, 25%, 15%)" }} />
                  <Bar dataKey="valor" name="Cantidad" radius={[6, 6, 0, 0]}>
                    {barChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {barChartData.length > 0 && (
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                  {barChartData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                      <span className="text-muted-foreground">{d.name}: {d.valor}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Row: Radial bars + Composition bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6 premium-shadow"
            >
              <h3 className="font-serif text-lg text-foreground mb-4">Suscripciones por estado</h3>
              {radialData.length === 0 ? (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                  Sin datos
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <RadialBarChart
                    innerRadius="20%"
                    outerRadius="90%"
                    data={radialData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar background dataKey="value" cornerRadius={8} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                    <Tooltip content={(props) => <DashboardTooltip active={props.active} payload={props.payload as TooltipPayloadItem[]} label={props.label} formatter={(v) => [String(v), ""]} />} />
                  </RadialBarChart>
                </ResponsiveContainer>
              )}
              {radialData.length > 0 && (
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                  {radialData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                      <span className="text-muted-foreground">{d.name}: {d.value}%</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card rounded-2xl p-6 premium-shadow"
            >
              <h3 className="font-serif text-lg text-foreground mb-4">Composición de suscripciones (%)</h3>
              {compositionData.length === 0 ? (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                  Sin datos
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={compositionData}
                    layout="vertical"
                    margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 18%)" />
                    <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} stroke="hsl(225, 15%, 45%)" />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} stroke="hsl(225, 15%, 45%)" />
                    <Tooltip
                      content={(props) => (
                        <DashboardTooltip
                          active={props.active}
                          payload={props.payload as TooltipPayloadItem[]}
                          label={props.label}
                          formatter={(_value, _name, item) => {
                            const p = item.payload as { cantidad?: number; porcentaje?: number };
                            return [p?.porcentaje != null && p?.cantidad != null ? `${p.porcentaje}% (${p.cantidad})` : String(item.value ?? ""), ""];
                          }}
                        />
                      )}
                    />
                    <Bar dataKey="porcentaje" name="Porcentaje" radius={[0, 6, 6, 0]}>
                    {compositionData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              {compositionData.length > 0 && (
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                  {compositionData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                      <span className="text-muted-foreground">{d.name}: {d.porcentaje}% ({d.cantidad})</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
          </>
          )}

          {/* Row: Orders by type + Questions by status */}
          {hasExtraData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6 premium-shadow">
                <h3 className="font-serif text-lg text-foreground mb-4">Pedidos por tipo</h3>
                {ordersByType.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Sin pedidos</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={ordersByType} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 18%)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(225, 15%, 45%)" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(225, 15%, 45%)" />
                        <Tooltip content={(props) => <DashboardTooltip active={props.active} payload={props.payload as TooltipPayloadItem[]} label={props.label} />} cursor={{ fill: "hsl(225, 25%, 15%)" }} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          name="Cantidad"
                          stroke={CHART_COLORS.muted}
                          strokeWidth={2}
                          dot={({ cx, cy, payload, index }) =>
                            cx != null && cy != null ? (
                              <circle key={index} cx={cx} cy={cy} r={4} fill={(payload as { fill?: string })?.fill ?? CHART_COLORS.secondary} />
                            ) : null
                          }
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2 flex-wrap">
                      {ordersByType.map((d) => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                          <span className="text-muted-foreground">{d.name}: {d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card rounded-2xl p-6 premium-shadow">
                <h3 className="font-serif text-lg text-foreground mb-4">Preguntas por estado</h3>
                {questionsByStatus.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Sin preguntas</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={questionsByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                          {questionsByStatus.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={(props) => <DashboardTooltip active={props.active} payload={props.payload as TooltipPayloadItem[]} label={props.label} formatter={(v) => [String(v), ""]} />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2 flex-wrap">
                      {questionsByStatus.map((d) => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                          <span className="text-muted-foreground">{d.name}: {d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}

          {/* Row: Reports by type (bar) + Blog status (pie) */}
          {hasExtraData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-6 premium-shadow">
                <h3 className="font-serif text-lg text-foreground mb-4">Reportes por tipo</h3>
                {reportsByType.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Sin reportes</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={reportsByType} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 18%)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(225, 15%, 45%)" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(225, 15%, 45%)" />
                        <Tooltip content={(props) => <DashboardTooltip active={props.active} payload={props.payload as TooltipPayloadItem[]} label={props.label} />} cursor={{ fill: "hsl(225, 25%, 15%)" }} />
                        <Bar dataKey="valor" name="Cantidad" radius={[6, 6, 0, 0]}>
                          {reportsByType.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2 flex-wrap">
                      {reportsByType.map((d) => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                          <span className="text-muted-foreground">{d.name}: {d.valor}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card rounded-2xl p-6 premium-shadow">
                <h3 className="font-serif text-lg text-foreground mb-4">Blog: publicado vs borrador</h3>
                {blogByStatus.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Sin artículos</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={blogByStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                          {blogByStatus.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={(props) => <DashboardTooltip active={props.active} payload={props.payload as TooltipPayloadItem[]} label={props.label} formatter={(v) => [String(v), ""]} />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2 flex-wrap">
                      {blogByStatus.map((d) => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                          <span className="text-muted-foreground">{d.name}: {d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </>
      )}

      {stats !== null && usage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-lg text-foreground">Uso API astrológica (estimado)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border/40 bg-background/30 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Previews total</p>
              <p className="text-2xl text-foreground tabular-nums">{usage.previewsTotal}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-background/30 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Previews este mes</p>
              <p className="text-2xl text-foreground tabular-nums">{usage.previewsThisMonth}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-background/30 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Llamadas total</p>
              <p className="text-2xl text-foreground tabular-nums">{usage.providerCallsEstimatedTotal}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-background/30 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Llamadas este mes</p>
              <p className="text-2xl text-foreground tabular-nums">{usage.providerCallsEstimatedThisMonth}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Estimación interna: 1 preview = 2 llamadas al proveedor (`natal_wheel_chart` + `planets/tropical`).
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
