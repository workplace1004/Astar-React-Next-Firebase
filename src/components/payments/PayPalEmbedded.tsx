import type { ReactNode } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import {
  paymentConfirmPayPalOrder,
  paymentCreateExtrasCartCheckout,
  paymentCreateSubscriptionCheckout,
} from "@/lib/api";

const paypalOptions = () => ({
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "",
  currency: "USD",
  intent: "capture" as const,
  disableFunding: ["paylater", "card", "credit"],
});

/** Wraps PayPal Smart Buttons. Required ancestor for PayPalButtons. */
export function PayPalScriptHost({ children }: { children: ReactNode }) {
  const { clientId, ...rest } = paypalOptions();
  if (!clientId) return <>{children}</>;
  return <PayPalScriptProvider options={{ clientId, ...rest }}>{children}</PayPalScriptProvider>;
}

function missingKeyMessage() {
  return (
    <p className="text-[10px] text-muted-foreground leading-snug">
      PayPal requiere <span className="font-mono">VITE_PAYPAL_CLIENT_ID</span> (la misma app que{" "}
      <span className="font-mono">PAYPAL_CLIENT_ID</span> del backend).
    </p>
  );
}

export function PayPalSubscriptionButton({
  plan,
  billing,
  disabled,
  onSuccess,
  onError,
}: {
  plan: "portal";
  billing: "monthly" | "annual";
  disabled?: boolean;
  onSuccess: () => void | Promise<void>;
  onError: (message: string) => void;
}) {
  if (!paypalOptions().clientId) {
    return missingKeyMessage();
  }

  return (
    <div className="w-full min-h-[46px] overflow-hidden rounded-[10px] [&_.paypal-buttons]:w-full [&_.paypal-buttons]:bg-transparent [&_iframe]:block [&_iframe]:rounded-[10px]">
      <PayPalButtons
        disabled={Boolean(disabled)}
        style={{ layout: "vertical", shape: "rect", label: "pay", height: 42, borderRadius: 10 }}
        createOrder={async () => {
          try {
            const c = await paymentCreateSubscriptionCheckout({
              provider: "paypal",
              plan,
              billing,
            });
            if (!c.reference?.trim()) throw new Error("No se recibió el pedido de PayPal.");
            return c.reference;
          } catch (e) {
            const msg =
              e instanceof Error ? e.message : "No se pudo crear el pago en PayPal.";
            onError(msg);
            throw e;
          }
        }}
        onApprove={async (data) => {
          try {
            await paymentConfirmPayPalOrder(data.orderID);
            await onSuccess();
          } catch (e) {
            const msg = e instanceof Error ? e.message : "No se pudo confirmar el pago.";
            onError(msg);
            throw e;
          }
        }}
        onCancel={() => onError("")}
        onError={(err) => {
          const msg =
            err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
              ? (err as { message: string }).message
              : "Error de PayPal.";
          onError(msg);
        }}
      />
    </div>
  );
}

export function PayPalExtrasCartButton({
  disabled,
  onSuccess,
  onError,
}: {
  disabled?: boolean;
  onSuccess: () => void | Promise<void>;
  onError: (message: string) => void;
}) {
  if (!paypalOptions().clientId) {
    return missingKeyMessage();
  }

  return (
    <div className="w-full min-h-[46px] overflow-hidden rounded-[10px] [&_.paypal-buttons]:w-full [&_.paypal-buttons]:bg-transparent [&_iframe]:block [&_iframe]:rounded-[10px]">
      <PayPalButtons
        disabled={Boolean(disabled)}
        style={{ layout: "vertical", shape: "rect", label: "pay", height: 42, borderRadius: 10 }}
        createOrder={async () => {
          try {
            const c = await paymentCreateExtrasCartCheckout({ provider: "paypal" });
            if (!c.reference?.trim()) throw new Error("No se recibió el pedido de PayPal.");
            return c.reference;
          } catch (e) {
            const msg =
              e instanceof Error ? e.message : "No se pudo crear el pago en PayPal.";
            onError(msg);
            throw e;
          }
        }}
        onApprove={async (data) => {
          try {
            await paymentConfirmPayPalOrder(data.orderID);
            await onSuccess();
          } catch (e) {
            const msg = e instanceof Error ? e.message : "No se pudo confirmar el pago.";
            onError(msg);
            throw e;
          }
        }}
        onCancel={() => onError("")}
        onError={(err) => {
          const msg =
            err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
              ? (err as { message: string }).message
              : "Error de PayPal.";
          onError(msg);
        }}
      />
    </div>
  );
}
