import { motion } from "framer-motion";
import { CreditCard, Calendar, Receipt, Loader2, Shield, Star, Crown } from "lucide-react";
import { DoubleCheckIcon } from "@/components/icons/DoubleCheckIcon";
import { useState, useEffect, useMemo } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useSearchParams } from "react-router-dom";
import {
  paymentConfirmMercadoPagoPayment,
  paymentConfirmStripeIntent,
  paymentConfirmStripeSession,
  paymentCreateSubscriptionCheckout,
  portalGetMyOrders,
  portalGetProfile,
  type PortalOrder,
  type PortalProfile,
} from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import StripeCustomCheckout from "@/components/payments/StripeCustomCheckout";
import MercadoPagoCustomCheckout from "@/components/payments/MercadoPagoCustomCheckout";

const plans = [
  {
    id: "essentials" as const,
    name: "Essentials",
    icon: Shield,
    price: { monthly: 19, annual: 15 },
    tagline: "Ideal para explorar tu mapa simbólico",
    highlighted: false,
    features: [
      "Carta natal completa (acceso permanente)",
      "Reporte de numerología personal",
      "Reportes simbólicos base",
      "Acceso al portal con historial completo",
      "Soporte comunitario",
    ],
  },
  {
    id: "portal" as const,
    name: "Portal",
    icon: Star,
    price: { monthly: 39, annual: 29 },
    tagline: "Guía completa con acompañamiento humano",
    highlighted: true,
    features: [
      "Todo de Essentials, más:",
      "Revolución solar del año en curso",
      "Mensaje mensual personalizado",
      "1 pregunta mensual con respuesta humana",
      "Soporte prioritario por email",
      "Acceso anticipado a nuevas funciones",
    ],
  },
  {
    id: "depth" as const,
    name: "Depth",
    icon: Crown,
    price: { monthly: 79, annual: 59 },
    tagline: "Máxima profundidad con soporte dedicado",
    highlighted: false,
    features: [
      "Todo de Portal, más:",
      "3 preguntas mensuales con respuesta humana",
      "1 sesión privada por mes",
      "Reportes simbólicos extendidos",
      "Guía dedicada",
      "Agendamiento de sesiones personalizado",
    ],
  },
];

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

const Subscription = () => {
  const { refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [orders, setOrders] = useState<PortalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutProvider, setCheckoutProvider] = useState<"stripe" | "mercadopago" | null>(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState<"essentials" | "portal" | "depth" | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([portalGetProfile(), portalGetMyOrders()]).then(([p, o]) => {
      setProfile(p ?? null);
      setOrders(o.orders);
      setLoading(false);
    });
  }, []);

  const paymentStatus = searchParams.get("status");
  const paymentProvider = searchParams.get("provider");
  const paymentReason = searchParams.get("reason");
  const sessionId = searchParams.get("session_id");
  const mercadoPagoPaymentId = useMemo(
    () => searchParams.get("payment_id") ?? searchParams.get("collection_id"),
    [searchParams],
  );

  useEffect(() => {
    if (loading) return;

    const cleanReturnParams = () => {
      const clean = new URLSearchParams(searchParams);
      clean.delete("provider");
      clean.delete("status");
      clean.delete("reason");
      clean.delete("session_id");
      clean.delete("payment_id");
      clean.delete("collection_id");
      setSearchParams(clean, { replace: true });
    };

    const confirm = async () => {
      if (paymentStatus === "error") {
        const reasonMessage: Record<string, string> = {
          missing_stripe_key: "Stripe no está configurado en backend. Configura STRIPE_SECRET_KEY.",
          missing_mercadopago_token: "Mercado Pago no está configurado en backend. Configura MERCADOPAGO_ACCESS_TOKEN.",
        };
        setActionError(reasonMessage[paymentReason ?? ""] ?? "No se pudo iniciar el checkout.");
        cleanReturnParams();
        return;
      }
      if (paymentStatus !== "success") return;
      try {
        if (paymentProvider === "stripe" && sessionId) {
          await paymentConfirmStripeSession(sessionId);
        } else if (paymentProvider === "mercadopago" && mercadoPagoPaymentId) {
          await paymentConfirmMercadoPagoPayment(mercadoPagoPaymentId);
        } else {
          return;
        }
        await refreshUser();
        const [p, o] = await Promise.all([portalGetProfile(), portalGetMyOrders()]);
        setProfile(p ?? null);
        setOrders(o.orders);
        setActionMessage("Pago confirmado. Tu suscripción está activa.");
        setActionError(null);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "No se pudo confirmar el pago.");
      } finally {
        cleanReturnParams();
      }
    };
    void confirm();
  }, [
    loading,
    mercadoPagoPaymentId,
    paymentProvider,
    paymentReason,
    paymentStatus,
    refreshUser,
    searchParams,
    sessionId,
    setSearchParams,
  ]);

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

  const startCheckout = async (planId: "essentials" | "portal" | "depth", provider: "stripe" | "mercadopago") => {
    setActionMessage(null);
    setActionError(null);
    setProcessingId(`${planId}-${provider}`);
    setCheckoutModalOpen(true);
    setCheckoutProvider(provider);
    setCheckoutPlanId(planId);
    setStripePromise(null);
    setStripeClientSecret(null);
    setStripePaymentIntentId(null);
    setCheckoutLoading(provider === "stripe");
    if (provider === "mercadopago") {
      setProcessingId(null);
      return;
    }
    try {
      const checkout = await paymentCreateSubscriptionCheckout({
        provider,
        plan: planId,
        billing,
      });
      if (provider === "stripe") {
        if (checkout.mode === "custom" && checkout.stripeClientSecret && checkout.stripePublishableKey) {
          setStripeClientSecret(checkout.stripeClientSecret);
          setStripePromise(loadStripe(checkout.stripePublishableKey));
          setStripePaymentIntentId(checkout.stripePaymentIntentId ?? null);
        } else {
          setActionError("Checkout directo de Stripe no está configurado. Revisa STRIPE_PUBLISHABLE_KEY y el endpoint de checkout.");
          setCheckoutModalOpen(false);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo iniciar el checkout.";
      if (message.includes("STRIPE_SECRET_KEY")) {
        setActionError("Stripe no está configurado en backend. Configura STRIPE_SECRET_KEY para abrir el checkout de Stripe.");
      } else if (message.includes("STRIPE_PUBLISHABLE_KEY")) {
        setActionError("Falta STRIPE_PUBLISHABLE_KEY en backend para mostrar checkout directo en modal.");
      } else if (message.includes("MERCADOPAGO_ACCESS_TOKEN")) {
        setActionError("Mercado Pago no está configurado en backend. Configura MERCADOPAGO_ACCESS_TOKEN.");
      } else {
        setActionError(message);
      }
      setCheckoutModalOpen(false);
    } finally {
      setCheckoutLoading(false);
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* Current plan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-8 premium-shadow border border-primary/20 mb-8">
        <div className="flex items-center gap-4">
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
      </motion.div>

      {/* Plans */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-6 premium-shadow border border-border/40 mb-8">
        {actionMessage && <p className="text-sm text-emerald-400 mb-4">{actionMessage}</p>}
        {actionError && <p className="text-sm text-destructive mb-4">{actionError}</p>}
        <div className="flex flex-col gap-4 mb-6">
          <h3 className="font-serif text-xl text-foreground">Elegir plan</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                billing === "monthly"
                  ? "bg-primary/20 border border-primary/50 text-primary"
                  : "border border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              Pago Mensual
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                billing === "annual"
                  ? "bg-primary/20 border border-primary/50 text-primary"
                  : "border border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              Pago Anual
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative overflow-hidden rounded-2xl p-6 flex flex-col ${
                plan.highlighted
                  ? "border-2 border-primary/70 bg-card/90 shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_0_20px_hsl(var(--primary)/0.22)]"
                  : "border border-border/70 bg-card/80"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-serif text-xl text-foreground">{plan.name}</h4>
                <plan.icon className={`w-5 h-5 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`} />
              </div>

              <div className="mb-2">
                <span className="font-sans text-4xl font-light text-gradient-gold tabular-nums">${plan.price[billing]}</span>
                <span className="text-muted-foreground text-xs ml-2">USD / mes</span>
              </div>
              <p className="text-xs text-muted-foreground mb-5">{plan.tagline}</p>

              <div className="space-y-2 mb-5">
                <button
                  onClick={() => void startCheckout(plan.id, "stripe")}
                  disabled={processingId != null}
                  className="w-full py-2.5 rounded-xl shimmer-gold text-primary-foreground font-medium text-xs hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {processingId === `${plan.id}-stripe` ? "Redirigiendo..." : "Pagar con Stripe (USD)"}
                </button>
                <button
                  onClick={() => void startCheckout(plan.id, "mercadopago")}
                  disabled={processingId != null}
                  className="w-full py-2.5 rounded-xl bg-accent border border-border/50 text-foreground font-medium text-xs hover:bg-accent/80 transition-colors disabled:opacity-70"
                >
                  {processingId === `${plan.id}-mercadopago` ? "Procesando..." : "Pagar con Mercado Pago (ARS)"}
                </button>
              </div>

              <div className="h-px w-full bg-border/50 mb-4" />

              <ul className="space-y-2 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs">
                    <DoubleCheckIcon className="w-3.5 h-3.5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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

      <Dialog
        open={checkoutModalOpen}
        onOpenChange={(open) => {
          setCheckoutModalOpen(open);
          if (!open) {
            setCheckoutProvider(null);
            setCheckoutPlanId(null);
            setCheckoutLoading(false);
            setStripePromise(null);
            setStripeClientSecret(null);
            setStripePaymentIntentId(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-border/50 bg-card/95 backdrop-blur-xl">
          <div className="p-5 border-b border-border/40">
            <DialogHeader>
              <DialogTitle>
                Checkout {checkoutProvider === "mercadopago" ? "Mercado Pago" : "Stripe"}
              </DialogTitle>
              <DialogDescription>
                Completa tu pago en esta ventana.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5">
            {checkoutLoading ? (
              <div className="h-[520px] flex items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Preparando checkout...
              </div>
            ) : checkoutProvider === "stripe" && stripePromise && stripeClientSecret ? (
              <div className="rounded-xl border border-border/40 bg-background p-2">
                <StripeCustomCheckout
                  stripePromise={stripePromise}
                  clientSecret={stripeClientSecret}
                  paymentIntentId={stripePaymentIntentId}
                  defaultName={profile?.name ?? ""}
                  defaultEmail={profile?.email ?? ""}
                  onError={(message) => setActionError(message)}
                  onSuccess={async (intentId) => {
                    await paymentConfirmStripeIntent(intentId);
                    await refreshUser();
                    const [p, o] = await Promise.all([portalGetProfile(), portalGetMyOrders()]);
                    setProfile(p ?? null);
                    setOrders(o.orders);
                    setActionError(null);
                    setActionMessage("Pago confirmado. Tu suscripción está activa.");
                    setCheckoutModalOpen(false);
                  }}
                />
              </div>
            ) : checkoutProvider === "mercadopago" && checkoutPlanId ? (
              <div className="rounded-xl border border-border/40 bg-background p-2">
                <MercadoPagoCustomCheckout
                  defaultName={profile?.name ?? ""}
                  defaultEmail={profile?.email ?? ""}
                  onError={(message) => setActionError(message || null)}
                  onSubmit={async () => {
                    const checkout = await paymentCreateSubscriptionCheckout({
                      provider: "mercadopago",
                      plan: checkoutPlanId,
                      billing,
                    });
                    return checkout.checkoutUrl;
                  }}
                />
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-destructive">
                No se pudo cargar el checkout.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscription;
