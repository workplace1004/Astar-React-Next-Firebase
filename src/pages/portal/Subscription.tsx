import { motion } from "framer-motion";
import { CreditCard, Calendar, Receipt, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  paymentCancelSubscription,
  paymentCreateSubscriptionCheckout,
  portalGetMyOrders,
  portalGetProfile,
  type PortalOrder,
  type PortalProfile,
} from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";

function formatOrderDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function formatAmount(amount: string) {
  if (!amount) return "—";
  const n = amount.replace(/[^0-9.,]/g, "").replace(",", ".");
  const num = parseFloat(n);
  if (Number.isNaN(num)) return amount;
  return `$${num.toFixed(2)} USD`;
}

function planLabelFromType(type: string) {
  const labels: Record<string, string> = {
    monthly: "Plan Mensual",
    month: "Plan Mensual",
    mensual: "Plan Mensual",
    annual: "Plan Anual",
    year: "Plan Anual",
    anual: "Plan Anual",
  };
  return labels[type?.toLowerCase()] ?? type ?? "Plan";
}

function nextRenewalFromLastOrder(createdAt: string, type: string) {
  try {
    const d = new Date(createdAt);
    if (type?.toLowerCase().includes("month") || type?.toLowerCase() === "monthly" || type?.toLowerCase() === "mensual") {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setFullYear(d.getFullYear() + 1);
    }
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return null;
  }
}

function providerFromOrderMethod(method?: string): "stripe" | "mercadopago" {
  const normalized = method?.toLowerCase() ?? "";
  if (normalized.includes("mercadopago")) return "mercadopago";
  return "stripe";
}

const Subscription = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [orders, setOrders] = useState<PortalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([portalGetProfile(), portalGetMyOrders()]).then(([p, o]) => {
      setProfile(p ?? null);
      setOrders(Array.isArray(o) ? o : []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const status = profile?.subscriptionStatus ?? "inactive";
  const lastOrder = orders[0] ?? null;
  const planLabel = lastOrder ? planLabelFromType(lastOrder.type) : "Plan";
  const planAmount = lastOrder ? formatAmount(lastOrder.amount) : null;
  const nextRenewal = lastOrder && status === "active" ? nextRenewalFromLastOrder(lastOrder.createdAt, lastOrder.type) : null;
  const preferredProvider = providerFromOrderMethod(lastOrder?.method);

  return (
    <div className="max-w-6xl mx-auto">

      {/* Current plan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-8 premium-shadow border border-primary/20 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <CreditCard className="w-8 h-8 text-primary" />
          <div>
            <p className="text-xs tracking-widest uppercase text-primary">
              {status === "active" ? "Plan Activo" : status === "cancelled" ? "Suscripción cancelada" : "Suscripción inactiva"}
            </p>
            <p className="text-2xl text-foreground">
              {planLabel}
              {planAmount != null && (
                <span className="tabular-nums font-semibold ml-1">— {planAmount}</span>
              )}
            </p>
          </div>
        </div>
        {nextRenewal && status === "active" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Calendar className="w-4 h-4" />
            Próxima renovación: {nextRenewal}
          </div>
        )}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={async () => {
              setActionError(null);
              setActionLoading(true);
              try {
                let checkout = await paymentCreateSubscriptionCheckout({
                  provider: preferredProvider,
                  plan: "portal",
                  billing: "monthly",
                });

                // Fallback to Mercado Pago when Stripe is not configured on backend.
                if (
                  preferredProvider === "stripe" &&
                  !checkout.checkoutUrl
                ) {
                  checkout = await paymentCreateSubscriptionCheckout({
                    provider: "mercadopago",
                    plan: "portal",
                    billing: "monthly",
                  });
                }
                window.location.assign(checkout.checkoutUrl);
              } catch (err) {
                const message = err instanceof Error ? err.message : "No se pudo iniciar el checkout.";
                if (preferredProvider === "stripe" && message.includes("STRIPE_SECRET_KEY")) {
                  try {
                    const fallback = await paymentCreateSubscriptionCheckout({
                      provider: "mercadopago",
                      plan: "portal",
                      billing: "monthly",
                    });
                    window.location.assign(fallback.checkoutUrl);
                    return;
                  } catch (fallbackErr) {
                    setActionError(fallbackErr instanceof Error ? fallbackErr.message : "No se pudo iniciar el checkout.");
                    setActionLoading(false);
                    return;
                  }
                }
                setActionError(message);
                setActionLoading(false);
              }
            }}
            disabled={actionLoading}
            className="px-6 py-2.5 rounded-xl border border-border/50 text-foreground text-sm hover:bg-accent/50 transition-colors disabled:opacity-70"
          >
            {actionLoading ? "Procesando..." : "Renovar / Actualizar pago"}
          </button>
          <button
            onClick={async () => {
              setActionError(null);
              setActionLoading(true);
              try {
                await paymentCancelSubscription();
                await refreshUser();
                const p = await portalGetProfile();
                setProfile(p ?? null);
              } catch (err) {
                setActionError(err instanceof Error ? err.message : "No se pudo cancelar.");
              } finally {
                setActionLoading(false);
              }
            }}
            disabled={actionLoading}
            className="px-6 py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm hover:bg-destructive/10 transition-colors disabled:opacity-70"
          >
            Cancelar Suscripción
          </button>
        </div>
        {actionError && <p className="text-sm text-destructive mt-3">{actionError}</p>}
      </motion.div>

      {/* Payment history */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6 premium-shadow">
        <h3 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" /> Historial de Pagos
        </h3>
        {orders.length === 0 ? (
          <EmptyState icon={Receipt} message="No hay pagos registrados." className="py-8" />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm py-3 border-b border-border/30 last:border-0">
                <span className="text-muted-foreground">{formatOrderDate(o.createdAt)}</span>
                <span className="text-foreground tabular-nums">{formatAmount(o.amount)}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Pagado</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Subscription;
