import { motion } from "framer-motion";
import { CreditCard, Calendar, Receipt, Loader2, Shield, Star, Crown } from "lucide-react";
import { DoubleCheckIcon } from "@/components/icons/DoubleCheckIcon";
import { lazy, Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  paymentConfirmMercadoPagoPayment,
  paymentConfirmPayPalOrder,
  paymentProcessMercadoPagoCard,
  portalGetMyOrders,
  portalGetProfile,
  type PortalOrder,
  type PortalProfile,
} from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { PayPalScriptHost, PayPalSubscriptionButton } from "@/components/payments/PayPalEmbedded";

const MercadoPagoCardBrick = lazy(() => import("@/components/payments/MercadoPagoCardBrick"));

const plans = [
  {
    id: "essentials" as const,
    name: "Essentials",
    icon: Shield,
    price: { monthly: 19, annual: 15 },
    ars: { monthly: 19000, annual: 13000 },
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
    ars: { monthly: 39000, annual: 29000 },
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
    ars: { monthly: 79000, annual: 59000 },
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<"essentials" | "portal" | "depth" | null>(null);
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
  const mercadoPagoPaymentId = useMemo(
    () => searchParams.get("payment_id") ?? searchParams.get("collection_id"),
    [searchParams],
  );
  const paypalToken = searchParams.get("token");

  useEffect(() => {
    if (loading) return;

    const cleanParams = () => {
      setSearchParams(
        (prev) => {
          const clean = new URLSearchParams(prev);
          clean.delete("provider");
          clean.delete("status");
          clean.delete("reason");
          clean.delete("payment_id");
          clean.delete("collection_id");
          clean.delete("token");
          clean.delete("PayerID");
          return clean;
        },
        { replace: true },
      );
    };

    if (paymentStatus === "error") {
      const reasonMessage: Record<string, string> = {
        missing_mercadopago_token: "Mercado Pago no está configurado en backend. Configura MERCADOPAGO_ACCESS_TOKEN.",
      };
      setActionError(reasonMessage[paymentReason ?? ""] ?? "No se pudo iniciar el checkout.");
      cleanParams();
      return;
    }

    if (paymentStatus !== "success") return;
    const canMp = paymentProvider === "mercadopago" && Boolean(mercadoPagoPaymentId);
    const canPaypal = paymentProvider === "paypal" && Boolean(paypalToken);
    if (!canMp && !canPaypal) return;

    let cancelled = false;
    const confirm = async () => {
      try {
        if (canMp && mercadoPagoPaymentId) {
          await paymentConfirmMercadoPagoPayment(mercadoPagoPaymentId);
        } else if (canPaypal && paypalToken) {
          await paymentConfirmPayPalOrder(paypalToken);
        }
        if (cancelled) return;
        await refreshUser();
        const [p, o] = await Promise.all([portalGetProfile(), portalGetMyOrders()]);
        setProfile(p ?? null);
        setOrders(o.orders);
        setActionMessage("Pago confirmado. Tu suscripción está activa.");
        setActionError(null);
      } catch (err) {
        if (!cancelled) {
          setActionError(err instanceof Error ? err.message : "No se pudo confirmar el pago.");
        }
      } finally {
        if (!cancelled) cleanParams();
      }
    };
    void confirm();
    return () => {
      cancelled = true;
    };
  }, [
    loading,
    mercadoPagoPaymentId,
    paymentProvider,
    paymentReason,
    paymentStatus,
    paypalToken,
    refreshUser,
    setSearchParams,
  ]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const mercadoPagoPublicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY ?? "";
  const checkoutPlan = checkoutPlanId ? plans.find((p) => p.id === checkoutPlanId) : null;

  const status = profile?.subscriptionStatus ?? "inactive";
  const lastOrder = orders[0] ?? null;
  const planLabel = lastOrder ? planLabelFromType(lastOrder.type) : "Plan";
  const planAmount = lastOrder ? formatAmount(lastOrder.amount) : null;
  const nextRenewal = lastOrder && status === "active" ? nextRenewalFromLastOrder(lastOrder.createdAt, lastOrder.type) : null;

  const openMercadoPagoModal = (planId: "essentials" | "portal" | "depth") => {
    setActionMessage(null);
    setActionError(null);
    setCheckoutPlanId(planId);
    setCheckoutModalOpen(true);
  };

  const handlePayPalSubscriptionSuccess = async () => {
    setActionError(null);
    await refreshUser();
    const [p, o] = await Promise.all([portalGetProfile(), portalGetMyOrders()]);
    setProfile(p ?? null);
    setOrders(o.orders);
    setActionMessage("Pago confirmado. Tu suscripción está activa.");
  };

  return (
    <div className="max-w-6xl mx-auto">
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-6 premium-shadow border border-border/40 mb-8">
        {actionMessage && <p className="text-sm text-emerald-400 mb-4">{actionMessage}</p>}
        {actionError && <p className="text-sm text-destructive mb-4">{actionError}</p>}
        <div className="flex flex-col gap-4 mb-6">
          <h3 className="font-serif text-xl text-foreground">Elegir plan</h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
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
              type="button"
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

        <PayPalScriptHost>
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
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">PayPal (USD)</p>
                  <PayPalSubscriptionButton
                    plan={plan.id}
                    billing={billing}
                    onSuccess={handlePayPalSubscriptionSuccess}
                    onError={(msg) => setActionError(msg || null)}
                  />
                  <button
                    type="button"
                    onClick={() => openMercadoPagoModal(plan.id)}
                    className="w-full py-2.5 rounded-xl bg-accent border border-border/50 text-foreground font-medium text-xs hover:bg-accent/80 transition-colors"
                  >
                    Pagar con Mercado Pago (ARS)
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
        </PayPalScriptHost>
      </motion.div>

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
          if (!open) setCheckoutPlanId(null);
        }}
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-border/50 bg-card/95 backdrop-blur-xl">
          <div className="p-5 border-b border-border/40">
            <DialogHeader>
              <DialogTitle>Pago con tarjeta — Mercado Pago</DialogTitle>
              <DialogDescription>
                Pagás en ARS sin salir del portal. Los datos de la tarjeta se procesan de forma segura con Mercado Pago.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5">
            {checkoutPlanId && checkoutPlan ? (
              <div className="rounded-xl border border-border/40 bg-background p-3 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Total a pagar:{" "}
                  <span className="font-semibold text-foreground tabular-nums">
                    {checkoutPlan.ars[billing].toLocaleString("es-AR")} ARS
                  </span>
                </p>
                <Suspense
                  fallback={
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  }
                >
                  <MercadoPagoCardBrick
                    publicKey={mercadoPagoPublicKey}
                    amount={checkoutPlan.ars[billing]}
                    payerEmailDefault={profile?.email ?? ""}
                    idSuffix={`sub_${checkoutPlanId}_${billing}`}
                    onProcessPayment={async (fd) => {
                      await paymentProcessMercadoPagoCard({
                        flow: "subscription",
                        plan: checkoutPlanId,
                        billing,
                        token: fd.token,
                        issuerId: fd.issuer_id,
                        paymentMethodId: fd.payment_method_id,
                        installments: fd.installments,
                        transactionAmount: fd.transaction_amount,
                        payerEmail: fd.payer?.email?.trim() || profile?.email?.trim() || "",
                        payerIdentification: fd.payer?.identification,
                      });
                    }}
                    onSuccess={async () => {
                      setCheckoutModalOpen(false);
                      setCheckoutPlanId(null);
                      setActionError(null);
                      await refreshUser();
                      const [p, o] = await Promise.all([portalGetProfile(), portalGetMyOrders()]);
                      setProfile(p ?? null);
                      setOrders(o.orders);
                      setActionMessage("Pago confirmado. Tu suscripción está activa.");
                    }}
                    onError={(message) => setActionError(message || null)}
                  />
                </Suspense>
              </div>
            ) : (
              <div className="h-[120px] flex items-center justify-center text-sm text-muted-foreground">Seleccioná un plan.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscription;
