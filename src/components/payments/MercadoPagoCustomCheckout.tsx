import { useState } from "react";
import { Loader2 } from "lucide-react";

interface MercadoPagoCustomCheckoutProps {
  defaultName?: string;
  defaultEmail?: string;
  submitLabel?: string;
  onError: (message: string) => void;
  onSubmit: (payload: { name: string; email: string; phone: string }) => Promise<string>;
}

export default function MercadoPagoCustomCheckout({
  defaultName = "",
  defaultEmail = "",
  submitLabel = "Continuar con Mercado Pago",
  onError,
  onSubmit,
}: MercadoPagoCustomCheckoutProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onError("Ingresa tu nombre.");
      return;
    }
    if (!email.trim()) {
      onError("Ingresa un email válido.");
      return;
    }

    setSubmitting(true);
    onError("");
    try {
      const checkoutUrl = await onSubmit({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      });
      window.location.assign(checkoutUrl);
    } catch (err) {
      onError(err instanceof Error ? err.message : "No se pudo iniciar Mercado Pago.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs text-muted-foreground uppercase tracking-widest">Nombre completo</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            placeholder="Tu nombre"
            autoComplete="name"
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
            placeholder="+54 11 1234 5678"
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/40 p-3 text-xs text-muted-foreground">
        Serás redirigido a Mercado Pago para completar el pago de forma segura.
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg shimmer-gold text-primary-foreground text-sm font-medium disabled:opacity-70 inline-flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirigiendo...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
