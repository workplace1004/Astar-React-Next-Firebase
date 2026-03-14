import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Shield, Star, Crown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  paymentConfirmMercadoPagoPayment,
  paymentConfirmStripeSession,
  paymentCreateSubscriptionCheckout,
} from "@/lib/api";

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

const Subscribe = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, refreshUser } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const paymentStatus = searchParams.get("status");
  const paymentProvider = searchParams.get("provider");
  const sessionId = searchParams.get("session_id");
  const mercadoPagoPaymentId = useMemo(
    () => searchParams.get("payment_id") ?? searchParams.get("collection_id"),
    [searchParams],
  );

  useEffect(() => {
    const confirm = async () => {
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
        setMessage("Pago confirmado. Tu suscripción está activa.");
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo confirmar el pago.");
      } finally {
        const clean = new URLSearchParams(searchParams);
        clean.delete("provider");
        clean.delete("status");
        clean.delete("session_id");
        clean.delete("payment_id");
        clean.delete("collection_id");
        setSearchParams(clean, { replace: true });
      }
    };
    void confirm();
  }, [mercadoPagoPaymentId, paymentProvider, paymentStatus, refreshUser, searchParams, sessionId, setSearchParams]);

  const startCheckout = async (planId: "essentials" | "portal" | "depth", provider: "stripe" | "mercadopago") => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setProcessingId(`${planId}-${provider}`);
    setError(null);
    setMessage(null);
    try {
      const { checkoutUrl } = await paymentCreateSubscriptionCheckout({
        plan: planId,
        provider,
        billing,
      });
      window.location.assign(checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago.");
      setProcessingId(null);
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-serif text-5xl md:text-6xl text-gradient-gold font-semibold mb-4">Suscripción</h1>
          <p className="text-muted-foreground">Tu acompañamiento astrológico personalizado, cada mes.</p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-1 mb-16"
        >
          <button
            onClick={() => setBilling("monthly")}
            className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
              billing === "monthly"
                ? "bg-primary/20 border border-primary/50 text-primary"
                : "border border-border/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            Pago Mensual
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
              billing === "annual"
                ? "bg-primary/20 border border-primary/50 text-primary"
                : "border border-border/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            Pago Anual
          </button>
        </motion.div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`relative overflow-hidden rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                plan.highlighted
                  ? "border-2 border-primary/70 glass-card premium-shadow-lg ring-2 ring-primary/70 ring-offset-2 ring-offset-background shadow-[0_0_0_2px_hsl(var(--primary)/0.7),0_0_32px_hsl(var(--primary)/0.24),inset_0_0_0_1px_hsl(var(--primary)/0.7)] before:content-[''] before:absolute before:inset-[6px] before:rounded-[0.85rem] before:border before:border-primary/70 before:pointer-events-none"
                  : "border border-border/70 glass-card hover:border-primary/30 premium-shadow"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-2xl font-medium">{plan.name}</h3>
                <plan.icon className={`w-5 h-5 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`} />
              </div>

              {/* Price */}
              <div className="mb-2">
                <motion.span
                  key={`${plan.name}-${billing}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-sans text-5xl font-light text-gradient-gold inline-block tabular-nums"
                >
                  ${plan.price[billing]}
                </motion.span>
                <span className="text-muted-foreground text-sm ml-2">USD / mes</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8">{plan.tagline}</p>

              {/* CTA Buttons */}
              <div className="space-y-3 mb-8">
                <button
                  onClick={() => void startCheckout(plan.id, "stripe")}
                  disabled={processingId != null}
                  className={`w-full py-3.5 rounded-xl font-medium tracking-wide text-sm transition-all duration-300 ${
                    plan.highlighted
                      ? "shimmer-gold text-primary-foreground hover:opacity-90 glow-gold"
                      : "shimmer-gold text-primary-foreground hover:opacity-90"
                  } disabled:opacity-70`}
                >
                  {processingId === `${plan.id}-stripe` ? "Redirigiendo..." : "Pagar con Stripe (USD)"}
                </button>
                <button
                  onClick={() => void startCheckout(plan.id, "mercadopago")}
                  disabled={processingId != null}
                  className="w-full py-3.5 rounded-xl bg-accent border border-border/50 text-foreground font-medium tracking-wide hover:bg-accent/80 transition-colors text-sm disabled:opacity-70"
                >
                  {processingId === `${plan.id}-mercadopago` ? "Redirigiendo..." : "Pagar con Mercado Pago (ARS)"}
                </button>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-border/50 mb-8" />

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {message && (
          <p className="text-center text-sm text-emerald-400 mb-4">{message}</p>
        )}
        {error && (
          <p className="text-center text-sm text-destructive mb-4">{error}</p>
        )}

        <p className="text-center text-xs text-muted-foreground mb-8">
          Cancela cuando quieras. Sin compromisos.
        </p>

        <p className="text-center text-sm text-muted-foreground">
          ¿Aún no estás seguro?{" "}
          <Link to="/portal-preview" className="text-primary hover:text-primary/80 transition-colors">
            Mira la vista previa del portal
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Subscribe;
