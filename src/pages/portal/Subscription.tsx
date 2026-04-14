import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Calendar, Receipt, Loader2, Shield, Star } from "lucide-react";
import { DoubleCheckIcon } from "@/components/icons/DoubleCheckIcon";
import { lazy, Suspense, useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  paymentConfirmMercadoPagoPayment,
  paymentConfirmPayPalOrder,
  paymentProcessMercadoPagoCard,
  portalGetMyOrders,
  portalGetProfile,
  fetchUsdArsRate,
  type PortalOrder,
  type PortalProfile,
} from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { PayPalScriptHost, PayPalSubscriptionButton } from "@/components/payments/PayPalEmbedded";

const MercadoPagoCardBrick = lazy(() => import("@/components/payments/MercadoPagoCardBrick"));

/** USD del plan Portal: mismos valores que `PORTAL_SUBSCRIPTION_USD` en el backend. ARS vía `fetchUsdArsRate`. */
const PORTAL_USD_MONTHLY = 29;
const PORTAL_PRICE_USD = {
  monthly: PORTAL_USD_MONTHLY,
  annual: Math.round(PORTAL_USD_MONTHLY * 12 * 0.8),
} as const;
/** Equivalente mensual en pago anual (−20 %), sin decimales. */
const PORTAL_DISPLAY_ANNUAL_PER_MONTH = String(Math.round(PORTAL_USD_MONTHLY * 0.8));

const ESSENTIALS_FEATURES = [
  "Carta astral de nacimiento",
  "Informe personal de numerología",
  "Acceso para empezar a crear tu portal",
  "Lecturas y documentos simbólicos",
] as const;

const PORTAL_FEATURES = [
  "Todo lo incluido en Essentials",
  "Interpretaciones completas de todos los informes",
  "Explicación clara de tu situación actual (por chat)",
  "Perspectivas continuas dentro de tu portal",
  "1 respuesta detallada y personalizada de Carlos por vídeo, audio o por escrito (no IA)",
] as const;

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
    "subscription:essentials:monthly": "Essentials",
    "subscription:essentials:annual": "Essentials",
    "subscription:portal:monthly": "Portal completo",
    "subscription:portal:annual": "Portal completo",
    "subscription:depth:monthly": "Portal completo (plan anterior)",
    "subscription:depth:annual": "Portal completo (plan anterior)",
  };
  const lower = type?.toLowerCase() ?? "";
  if (labels[lower]) return labels[lower];
  if (lower.includes("depth")) return "Portal completo (plan anterior)";
  if (lower.includes("portal")) return "Portal completo";
  if (lower.includes("essentials")) return "Essentials";
  return labels[lower] ?? type ?? "Plan";
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
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [arsPerUsd, setArsPerUsd] = useState<number | null>(null);
  const [arsRateError, setArsRateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchUsdArsRate()
      .then((r) => {
        if (!cancelled) {
          setArsPerUsd(r.arsPerUsd);
          setArsRateError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArsPerUsd(null);
          setArsRateError("No se pudo obtener la cotización USD→ARS. Reintentá en unos segundos.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const status = profile?.subscriptionStatus ?? "inactive";
  const lastOrder = orders[0] ?? null;
  const planLabel = lastOrder ? planLabelFromType(lastOrder.type) : "Plan";
  const planAmount = lastOrder ? formatAmount(lastOrder.amount) : null;
  const nextRenewal = lastOrder && status === "active" ? nextRenewalFromLastOrder(lastOrder.createdAt, lastOrder.type) : null;

  const openMercadoPagoModal = () => {
    setActionMessage(null);
    setActionError(null);
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

  const portalArsAmount = useMemo(() => {
    if (arsPerUsd == null || !Number.isFinite(arsPerUsd)) return 0;
    const usd = billing === "monthly" ? PORTAL_PRICE_USD.monthly : PORTAL_PRICE_USD.annual;
    return Math.round(usd * arsPerUsd);
  }, [arsPerUsd, billing]);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-8 mb-8 border border-primary/30 bg-card/50 shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.04)] backdrop-blur-sm"
      >
        <div className="flex items-center gap-4">
          <CreditCard className="w-8 h-8 text-primary shrink-0" />
          <div>
            <p className="text-xs tracking-widest uppercase text-primary">
              {status === "active" ? "Plan activo" : status === "cancelled" ? "Suscripción cancelada" : "Suscripción inactiva"}
            </p>
            <p className="text-2xl text-foreground font-serif font-light">
              {planLabel}
              {planAmount != null && (
                <span className="tabular-nums font-semibold font-sans ml-2 text-lg">— {planAmount}</span>
              )}
            </p>
          </div>
        </div>
        {nextRenewal && status === "active" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
            <Calendar className="w-4 h-4 shrink-0" />
            Próxima renovación: {nextRenewal}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mb-6 text-center"
      >
        <p className="text-sm tracking-[0.3em] uppercase text-primary mb-3">Acceso mensual o anual</p>
        <h2 className="font-serif text-2xl md:text-4xl font-light text-foreground mb-2">
          Elegí tu plan en el <span className="text-gradient-gold italic">portal</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
          Misma oferta que en la web: Essentials incluido y Portal completo para profundizar con acompañamiento humano.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="flex items-center justify-center gap-2 mb-10 overflow-visible pt-1"
      >
        <button
          type="button"
          onClick={() => setBilling("monthly")}
          className={`px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
            billing === "monthly"
              ? "bg-primary/20 border border-primary/50 text-primary"
              : "border border-border/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          Pago mensual
        </button>
        <span className="relative inline-flex shrink-0">
          <button
            type="button"
            onClick={() => setBilling("annual")}
            className={`px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
              billing === "annual"
                ? "bg-primary/20 border border-primary/50 text-primary"
                : "border border-border/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            Pago anual
          </button>
          <AnimatePresence>
            {billing === "annual" && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5, y: 8, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 720 }}
                exit={{ opacity: 0, scale: 0.85, y: -4, rotate: 0 }}
                transition={{
                  rotate: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.25 },
                  scale: { type: "spring", stiffness: 520, damping: 24 },
                  y: { type: "spring", stiffness: 520, damping: 24 },
                }}
                className="pointer-events-none absolute -right-1 -top-2 z-10 inline-block origin-center rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-black shadow-sm font-sans"
                aria-hidden
              >
                20% OFF
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-6 md:p-8 border border-border/60 bg-card/40 shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.04)] mb-8"
      >
        {actionMessage && <p className="text-sm text-emerald-400 mb-4 text-center">{actionMessage}</p>}
        {actionError && <p className="text-sm text-destructive mb-4 text-center">{actionError}</p>}

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Essentials — gratuito, sin checkout */}
          <div className="rounded-2xl p-8 flex flex-col border border-border/70 glass-card premium-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-medium">Essentials</h3>
              <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
            </div>
            <p className="text-3xl md:text-4xl font-light text-gradient-gold mb-1">Gratis</p>
            <p className="text-sm text-muted-foreground mb-8">Para dar los primeros pasos y explorar tu carta astral</p>
            <Link
              to="/portal"
              className="w-full py-3.5 rounded-full text-center border border-border text-foreground hover:border-primary/50 hover:bg-primary/5 font-medium tracking-wide text-sm transition-all duration-300 mb-8"
            >
              Ir al panel
            </Link>
            <div className="h-px w-full bg-border/50 mb-8" />
            <ul className="space-y-3 flex-1">
              {ESSENTIALS_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <DoubleCheckIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal completo — pago */}
          <div className="relative overflow-hidden rounded-2xl p-8 flex flex-col border-[3px] border-primary bg-primary/[0.06] ring-2 ring-inset ring-primary/25 shadow-[0_8px_36px_-6px_hsl(var(--primary)/0.35)]">
            <p className="absolute top-4 right-4 text-[10px] uppercase tracking-widest text-primary font-medium">
              El más popular
            </p>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-medium pr-16">Portal completo</h3>
              <Star className="w-5 h-5 text-primary shrink-0" />
            </div>
            <div className="mb-2">
              <span className="font-sans text-4xl md:text-5xl font-light text-gradient-gold tabular-nums">
                $
                {billing === "monthly"
                  ? PORTAL_PRICE_USD.monthly
                  : PORTAL_DISPLAY_ANNUAL_PER_MONTH}
              </span>
              <span className="text-muted-foreground text-sm ml-2">/ mes</span>
            </div>
            {billing === "annual" && (
              <p className="text-xs text-muted-foreground mb-2">
                Facturación anual: USD{" "}
                {PORTAL_PRICE_USD.annual.toLocaleString("es-AR", { maximumFractionDigits: 0 })} (equiv.{" "}
                {PORTAL_DISPLAY_ANNUAL_PER_MONTH} USD/mes).
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              Para obtener profundidad, claridad y orientación humana
            </p>

            <PayPalScriptHost>
              <div className="space-y-2 mb-6">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">PayPal (USD)</p>
                <PayPalSubscriptionButton
                  plan="portal"
                  billing={billing}
                  onSuccess={handlePayPalSubscriptionSuccess}
                  onError={(msg) => setActionError(msg || null)}
                />
                <button
                  type="button"
                  onClick={openMercadoPagoModal}
                  disabled={Boolean(arsRateError) || arsPerUsd == null}
                  className="w-full py-3 rounded-full bg-accent border border-border/50 text-foreground font-medium text-sm hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  Pagar con Mercado Pago (ARS)
                </button>
                {arsRateError ? <p className="text-[10px] text-destructive mt-1">{arsRateError}</p> : null}
              </div>
            </PayPalScriptHost>

            <div className="h-px w-full bg-border/50 mb-8" />
            <ul className="space-y-3 flex-1">
              {PORTAL_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <DoubleCheckIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">Pagos seguros con PayPal y Mercado Pago.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-6 border border-border/60 bg-card/40"
      >
        <h3 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary shrink-0" /> Historial de pagos
        </h3>
        {orders.length === 0 ? (
          <EmptyState icon={Receipt} message="No hay pagos registrados." className="py-8" />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm py-3 border-b border-border/30 last:border-0 gap-4 flex-wrap">
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
        }}
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-border/50 bg-card/95 backdrop-blur-xl">
          <div className="p-5 border-b border-border/40">
            <DialogHeader>
              <DialogTitle>Portal completo — Mercado Pago</DialogTitle>
              <DialogDescription>
                Pagás en ARS sin salir del portal. Los datos de la tarjeta se procesan de forma segura con Mercado Pago.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5">
            <div className="rounded-xl border border-border/40 bg-background p-3 space-y-3">
              <p className="text-sm text-muted-foreground">
                Total a pagar:{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {portalArsAmount > 0
                    ? `${portalArsAmount.toLocaleString("es-AR")} ARS`
                    : arsRateError
                      ? "—"
                      : "Cargando cotización…"}
                </span>
                {billing === "annual" && (
                  <span className="block text-xs mt-1">Pago anual (plan Portal completo).</span>
                )}
              </p>
              <Suspense
                fallback={
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                }
              >
                {portalArsAmount > 0 ? (
                <MercadoPagoCardBrick
                  publicKey={mercadoPagoPublicKey}
                  amount={portalArsAmount}
                  payerEmailDefault={profile?.email ?? ""}
                  idSuffix={`sub_portal_${billing}`}
                  onProcessPayment={async (fd) => {
                    await paymentProcessMercadoPagoCard({
                      flow: "subscription",
                      plan: "portal",
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
                    setActionError(null);
                    await refreshUser();
                    const [p, o] = await Promise.all([portalGetProfile(), portalGetMyOrders()]);
                    setProfile(p ?? null);
                    setOrders(o.orders);
                    setActionMessage("Pago confirmado. Tu suscripción está activa.");
                  }}
                  onError={(message) => setActionError(message || null)}
                />
                ) : arsRateError ? (
                  <p className="text-sm text-destructive py-4 text-center">{arsRateError}</p>
                ) : (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </Suspense>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscription;
