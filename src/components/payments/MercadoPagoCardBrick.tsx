import { useEffect, useRef, useState } from "react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { Loader2 } from "lucide-react";

export interface MercadoPagoBrickFormData {
  token: string;
  issuer_id: string;
  payment_method_id: string;
  installments: number;
  transaction_amount: number;
  payer: {
    email?: string;
    identification?: { type: string; number: string };
  };
}

type MercadoPagoCardBrickProps = {
  publicKey: string;
  amount: number;
  payerEmailDefault: string;
  idSuffix: string;
  onProcessPayment: (data: MercadoPagoBrickFormData) => Promise<void>;
  onSuccess: () => void | Promise<void>;
  onError: (message: string) => void;
};

export default function MercadoPagoCardBrick({
  publicKey,
  amount,
  payerEmailDefault,
  idSuffix,
  onProcessPayment,
  onSuccess,
  onError,
}: MercadoPagoCardBrickProps) {
  const [sdkReady, setSdkReady] = useState(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!publicKey) return;
    try {
      initMercadoPago(publicKey, { locale: "es-AR" });
      setSdkReady(true);
    } catch {
      onErrorRef.current("No se pudo inicializar Mercado Pago.");
    }
  }, [publicKey]);

  if (!publicKey) {
    return (
      <p className="text-sm text-destructive px-1">
        Falta la clave pública de Mercado Pago (variable{" "}
        <span className="font-mono text-xs">VITE_MERCADOPAGO_PUBLIC_KEY</span>).
      </p>
    );
  }

  if (!sdkReady) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-[280px] mp-card-brick text-foreground">
      <CardPayment
        id={`cardPaymentBrick_${idSuffix}`}
        key={`${idSuffix}-${amount}-${payerEmailDefault}`}
        initialization={{
          amount,
          payer: payerEmailDefault ? { email: payerEmailDefault } : undefined,
        }}
        locale="es-AR"
        customization={{
          visual: {
            style: {
              theme: "dark",
            },
          },
        }}
        onSubmit={async (formData) => {
          onError("");
          try {
            await onProcessPayment(formData as MercadoPagoBrickFormData);
            onSuccess();
          } catch (e) {
            const msg = e instanceof Error ? e.message : "No se pudo procesar el pago.";
            onError(msg);
            throw e;
          }
        }}
        onError={(err) => {
          const text = [err.message, err.cause].filter(Boolean).join(" ") || "Error en el formulario de pago.";
          onError(text);
        }}
      />
    </div>
  );
}
