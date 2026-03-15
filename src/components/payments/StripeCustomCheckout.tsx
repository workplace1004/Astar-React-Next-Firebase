import { useState } from "react";
import { CardCvcElement, CardExpiryElement, CardNumberElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";

interface StripeCustomCheckoutProps {
  stripePromise: Promise<Stripe | null>;
  clientSecret: string;
  paymentIntentId: string | null;
  defaultName?: string;
  defaultEmail?: string;
  submitLabel?: string;
  onError: (message: string) => void;
  onSuccess: (paymentIntentId: string) => Promise<void> | void;
}

export default function StripeCustomCheckout({
  stripePromise,
  clientSecret,
  paymentIntentId,
  defaultName = "",
  defaultEmail = "",
  submitLabel = "Pagar ahora",
  onError,
  onSuccess,
}: StripeCustomCheckoutProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night" } }}>
      <StripeCustomCheckoutForm
        clientSecret={clientSecret}
        paymentIntentId={paymentIntentId}
        defaultName={defaultName}
        defaultEmail={defaultEmail}
        submitLabel={submitLabel}
        onError={onError}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}

function StripeCustomCheckoutForm({
  clientSecret,
  paymentIntentId,
  defaultName,
  defaultEmail,
  submitLabel,
  onError,
  onSuccess,
}: Omit<StripeCustomCheckoutProps, "stripePromise">) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      onError("No se pudo inicializar el formulario de tarjeta.");
      return;
    }

    setSubmitting(true);
    onError("");
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: name.trim() || undefined,
            email: email.trim().toLowerCase() || undefined,
            phone: phone.trim() || undefined,
          },
        },
      });

      if (result.error) {
        onError(result.error.message ?? "No se pudo procesar el pago.");
        setSubmitting(false);
        return;
      }

      const intentId = result.paymentIntent?.id ?? paymentIntentId;
      if (!intentId) {
        onError("No se pudo obtener el id del pago.");
        setSubmitting(false);
        return;
      }

      await onSuccess(intentId);
    } catch (err) {
      onError(err instanceof Error ? err.message : "No se pudo confirmar el pago.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs text-muted-foreground uppercase tracking-widest">Nombre del titular</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            placeholder="Nombre como figura en la tarjeta"
            autoComplete="cc-name"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-widest">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            placeholder="tu@email.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-widest">Teléfono</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            placeholder="+1 555 123 4567"
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/40 p-3 space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-widest">Número de tarjeta</label>
          <div className="rounded-lg border border-border/50 bg-background px-3 py-2">
            <CardNumberElement options={{ style: { base: { color: "#E5E7EB", fontSize: "14px" } } }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-widest">Expiración</label>
            <div className="rounded-lg border border-border/50 bg-background px-3 py-2">
              <CardExpiryElement options={{ style: { base: { color: "#E5E7EB", fontSize: "14px" } } }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-widest">CVC</label>
            <div className="rounded-lg border border-border/50 bg-background px-3 py-2">
              <CardCvcElement options={{ style: { base: { color: "#E5E7EB", fontSize: "14px" } } }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!stripe || !elements || submitting}
          className="px-5 py-2.5 rounded-lg shimmer-gold text-primary-foreground text-sm font-medium disabled:opacity-70"
        >
          {submitting ? "Procesando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
