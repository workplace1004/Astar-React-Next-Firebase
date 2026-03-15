import { useEffect, useMemo, useState } from "react";
import { BadgeDollarSign, Loader2, ShoppingCart } from "lucide-react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  paymentConfirmMercadoPagoPayment,
  paymentConfirmStripeIntent,
  paymentConfirmStripeSession,
  paymentCreateExtraCheckout,
} from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StripeCustomCheckout from "@/components/payments/StripeCustomCheckout";

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
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutProvider, setCheckoutProvider] = useState<"stripe" | "mercadopago" | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState<string | null>(null);

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
    setCheckoutProvider(provider);
    setCheckoutModalOpen(true);
    setCheckoutUrl(null);
    setStripePromise(null);
    setStripeClientSecret(null);
    setStripePaymentIntentId(null);
    setCheckoutLoading(true);
    try {
      const checkout = await paymentCreateExtraCheckout({
        extraType,
        provider,
        quantity: 1,
      });
      if (provider === "stripe") {
        if (checkout.mode === "custom" && checkout.stripeClientSecret && checkout.stripePublishableKey) {
          setStripeClientSecret(checkout.stripeClientSecret);
          setStripePromise(loadStripe(checkout.stripePublishableKey));
          setStripePaymentIntentId(checkout.stripePaymentIntentId ?? null);
        } else {
          setError("Stripe custom checkout no está disponible.");
          setCheckoutModalOpen(false);
        }
      } else {
        setCheckoutUrl(checkout.checkoutUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago.");
      setCheckoutModalOpen(false);
    } finally {
      setProcessing(null);
      setCheckoutLoading(false);
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

      <Dialog
        open={checkoutModalOpen}
        onOpenChange={(open) => {
          setCheckoutModalOpen(open);
          if (!open) {
            setCheckoutProvider(null);
            setCheckoutUrl(null);
            setCheckoutLoading(false);
            setStripePromise(null);
            setStripeClientSecret(null);
            setStripePaymentIntentId(null);
          }
        }}
      >
        <DialogContent className="max-w-xl p-0 overflow-hidden border-border/50 bg-card/95 backdrop-blur-xl">
          <div className="p-5 border-b border-border/40">
            <DialogHeader>
              <DialogTitle>Checkout {checkoutProvider === "mercadopago" ? "Mercado Pago" : "Stripe"}</DialogTitle>
              <DialogDescription>Completa tu pago en esta ventana.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-5">
            {checkoutLoading ? (
              <div className="h-[420px] flex items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Preparando checkout...
              </div>
            ) : checkoutProvider === "stripe" && stripePromise && stripeClientSecret ? (
              <div className="rounded-xl border border-border/40 bg-background p-2 min-h-[420px]">
                <StripeCustomCheckout
                  stripePromise={stripePromise}
                  clientSecret={stripeClientSecret}
                  paymentIntentId={stripePaymentIntentId}
                  onError={setError}
                  onSuccess={async (intentId) => {
                    await paymentConfirmStripeIntent(intentId);
                    setMessage("Pago confirmado. Tu compra extra ya está registrada.");
                    setError(null);
                    setCheckoutModalOpen(false);
                  }}
                />
              </div>
            ) : checkoutProvider === "mercadopago" && checkoutUrl ? (
              <iframe
                title="Checkout Mercado Pago"
                src={checkoutUrl}
                className="w-full h-[520px] rounded-xl border border-border/40 bg-background"
                referrerPolicy="no-referrer"
              />
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

export default Purchase;
