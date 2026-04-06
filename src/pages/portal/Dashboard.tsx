import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, FileText, MessageCircle, HelpCircle, ChevronRight, Sun, Moon, Hash, CreditCard, Calendar, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { portalGetReports, portalGetMessages, portalGetMyOrders, portalGetProfile, type PortalOrder } from "@/lib/api";
import EmptyState from "@/components/EmptyState";

function formatOrderAmount(amount: string) {
  if (!amount) return null;
  const match = amount.trim().match(/^([0-9]+(?:\.[0-9]+)?)\s+([A-Za-z]{3})$/);
  if (!match) return amount;
  const value = Number(match[1]);
  const currency = match[2].toUpperCase();
  if (Number.isNaN(value)) return amount;
  return `${currency === "USD" ? "$" : ""}${value.toFixed(2)} ${currency}`;
}

function subscriptionTextFromOrder(order: PortalOrder | null) {
  if (!order) return { planName: null as string | null, billing: null as string | null };
  const parts = (order.type ?? "").split(":");
  if (parts[0] !== "subscription") return { planName: null as string | null, billing: null as string | null };
  const plan = (parts[1] ?? "").toLowerCase();
  const billing = (parts[2] ?? "").toLowerCase();
  const planMap: Record<string, string> = {
    essentials: "Essentials",
    portal: "Portal",
    depth: "Depth",
  };
  const billingMap: Record<string, string> = {
    monthly: "Mensual",
    annual: "Anual",
  };
  return {
    planName: planMap[plan] ?? null,
    billing: billingMap[billing] ?? null,
  };
}

const PortalDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<{ id: string; type: string; title: string; createdAt?: string }[]>([]);
  const [messages, setMessages] = useState<{ id: string; content: string; createdAt: string }[]>([]);
  const [profile, setProfile] = useState<{ subscriptionStatus: string } | null>(null);
  const [orders, setOrders] = useState<PortalOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([portalGetReports(), portalGetMessages(), portalGetProfile(), portalGetMyOrders()])
      .then(([r, m, p, o]) => {
        setReports(r);
        setMessages(m);
        setProfile(p ?? null);
        setOrders(o.orders);
      })
      .finally(() => setLoading(false));
  }, []);

  const subscriptionActive = (profile?.subscriptionStatus ?? user?.subscriptionStatus) === "active";
  const latestSubscriptionOrder = orders.find((o) => (o.type ?? "").startsWith("subscription:")) ?? null;
  const subscriptionAmount = formatOrderAmount(latestSubscriptionOrder?.amount ?? "");
  const subscriptionInfo = subscriptionTextFromOrder(latestSubscriptionOrder);
  const subscriptionLine = subscriptionInfo.planName
    ? `${subscriptionInfo.planName}${subscriptionInfo.billing ? ` (${subscriptionInfo.billing})` : ""}${subscriptionAmount ? ` — ${subscriptionAmount}` : ""}`
    : subscriptionAmount
      ? `Suscripción — ${subscriptionAmount}`
      : "Sin pagos de suscripción registrados";
  const latestMessage = messages[0];
  const reportTypes = [
    { to: "/portal/reports/birth-chart", icon: Sun, label: "Carta Natal", desc: "Tu estructura simbólica natal" },
    { to: "/portal/reports/solar-return", icon: Moon, label: "Revolución Solar", desc: "Tu ciclo anual actual" },
    { to: "/portal/reports/numerology", icon: Hash, label: "Numerología", desc: "Tus números personales" },
  ];
  const quickActions = [
    { to: "/portal/questions", icon: HelpCircle, label: "Hacer Pregunta", desc: `${reports.length} reportes disponibles` },
    { to: "/portal/messages", icon: MessageCircle, label: "Ver Mensajes", desc: `${messages.length} mensajes en tu historial` },
    { to: "/portal/reports", icon: FileText, label: "Ver Reportes", desc: "Carta natal, solar y numerología" },
  ];

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return iso;
    }
  };

  const activityItems = [
    ...(latestMessage ? [{ date: formatDate(latestMessage.createdAt), text: "Último mensaje recibido", link: "/portal/messages" as const }] : []),
    ...(reports.length > 0 ? [{ date: formatDate(reports[0].createdAt ?? ""), text: "Reporte más reciente", link: "/portal/reports" as const }] : []),
  ].slice(0, 5);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 premium-shadow border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs tracking-widest uppercase text-primary">
                {subscriptionActive ? "Suscripción Activa" : "Suscripción Inactiva"}
              </p>
              {subscriptionActive && <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />}
            </div>
            <p className="text-foreground font-medium">{subscriptionLine}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="w-3.5 h-3.5" />
              {subscriptionActive ? "Gestiona tu suscripción para ver renovación" : "Activa o actualiza tu plan desde Suscripción"}
            </div>
          </div>
          <Link to="/portal/subscription" className="text-sm text-primary hover:text-primary/80 transition-colors shrink-0">
            Gestionar →
          </Link>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-6 premium-shadow">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-xs tracking-widest uppercase text-muted-foreground">Mensaje Mensual</p>
          {latestMessage && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary ml-auto">
              {formatDate(latestMessage.createdAt)}
            </span>
          )}
        </div>
        {latestMessage ? (
          <>
            <p className="text-lg text-foreground mb-3 line-clamp-2">
              &quot;{latestMessage.content.slice(0, 120)}
              {latestMessage.content.length > 120 ? "…" : ""}&quot;
            </p>
            <Link to="/portal/messages" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Leer mensaje completo →
            </Link>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Aún no tienes mensajes. Los recibirás según tu suscripción.</p>
        )}
      </motion.div>

      <div>
        <h2 className="font-serif text-xl text-foreground mb-4">Tus Reportes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportTypes.map((r, i) => (
            <motion.div key={r.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <Link to={r.to} className="block glass-card rounded-2xl p-6 premium-shadow hover-lift group h-full">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <r.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{r.label}</h3>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-foreground mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((a, i) => (
            <motion.div key={a.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.05 }}>
              <Link to={a.to} className="flex items-center gap-4 glass-card rounded-2xl p-5 premium-shadow hover-lift group">
                <a.icon className="w-6 h-6 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{a.label}</h3>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-2xl p-6 premium-shadow">
        <h3 className="font-serif text-xl text-foreground mb-4">Actividad Reciente</h3>
        {activityItems.length === 0 ? (
          <EmptyState icon={LayoutDashboard} message="No hay actividad en el panel." />
        ) : (
          <div className="space-y-3">
            {activityItems.map((item) => (
              <Link key={item.date + item.text} to={item.link} className="flex items-center gap-4 text-sm group py-2 border-b border-border/20 last:border-0">
                <span className="text-muted-foreground w-28 shrink-0">{item.date}</span>
                <span className="text-foreground group-hover:text-primary transition-colors">{item.text}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PortalDashboard;
