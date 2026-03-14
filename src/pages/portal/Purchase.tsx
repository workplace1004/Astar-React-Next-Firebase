import { useEffect, useMemo, useState } from "react";
import { BadgeDollarSign, Loader2, ShoppingCart } from "lucide-react";
import {
  paymentConfirmMercadoPagoPayment,
  paymentConfirmStripeSession,
  paymentCreateExtraCheckout,
} from "@/lib/api";
import { useSearchParams } from "react-router-dom";

const extras = [
  {
    id: "extra_question" as const,
    title: "Pregunta Extra",
    description: "Añade una pregunta adicional con respuesta personalizada.",
    usd: "$12",
    ars: "ARS 12.000",
  },
  {
    id: "private_session" as const,
    title: "Sesión Privada",
    description: "Sesión individual para profundizar en tu proceso actual.",
    usd: "$45",
    ars: "ARS 45.000",
  },
];

const Purchase = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

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
        setMessage("Pago confirmado. Tu compra extra ya está registrada.");
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
  }, [mercadoPagoPaymentId, paymentProvider, paymentStatus, searchParams, sessionId, setSearchParams]);

  const startCheckout = async (extraType: "extra_question" | "private_session", provider: "stripe" | "mercadopago") => {
    setProcessing(`${extraType}-${provider}`);
    setError(null);
    setMessage(null);
    try {
      const { checkoutUrl } = await paymentCreateExtraCheckout({
        extraType,
        provider,
        quantity: 1,
      });
      window.location.assign(checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago.");
      setProcessing(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-5">
        {extras.map((extra) => (
          <div key={extra.id} className="glass-card rounded-2xl p-6 premium-shadow border border-border/40">
            <div className="flex items-center gap-2 mb-2">
              <BadgeDollarSign className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-xl text-foreground">{extra.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{extra.description}</p>
            <p className="text-sm text-muted-foreground mb-1">Stripe: <span className="text-foreground">{extra.usd} USD</span></p>
            <p className="text-sm text-muted-foreground mb-5">Mercado Pago: <span className="text-foreground">{extra.ars}</span></p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => void startCheckout(extra.id, "stripe")}
                disabled={processing != null}
                className="w-full py-3 rounded-xl shimmer-gold text-primary-foreground text-sm font-medium disabled:opacity-70"
              >
                {processing === `${extra.id}-stripe` ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Redirigiendo...</span>
                ) : "Pagar con Stripe (USD)"}
              </button>
              <button
                onClick={() => void startCheckout(extra.id, "mercadopago")}
                disabled={processing != null}
                className="w-full py-3 rounded-xl border border-border/60 bg-accent text-foreground text-sm font-medium hover:bg-accent/80 disabled:opacity-70"
              >
                {processing === `${extra.id}-mercadopago` ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Redirigiendo...</span>
                ) : "Pagar con Mercado Pago (ARS)"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {message && (
        <p className="text-sm text-emerald-400 mt-5">{message}</p>
      )}
      {error && (
        <p className="text-sm text-destructive mt-5">{error}</p>
      )}
      {!message && !error && (
        <div className="mt-6 text-xs text-muted-foreground inline-flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Las compras extra se registran en tu historial de pagos.
        </div>
      )}
    </div>
  );
};

export default Purchase;
