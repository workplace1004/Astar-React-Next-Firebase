import { motion } from "framer-motion";
import { Loader2, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePortalExtrasCart } from "@/contexts/PortalExtrasCartContext";
import {
  paymentConfirmMercadoPagoPayment,
  paymentConfirmPayPalOrder,
  paymentProcessMercadoPagoCard,
  portalGetMyOrders,
  type PortalOrder,
} from "@/lib/api";
import { getExtraServiceById, priceUsdForService } from "@/lib/extraServicesCatalog";
import EmptyState from "@/components/EmptyState";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { PayPalExtrasCartButton, PayPalScriptHost } from "@/components/payments/PayPalEmbedded";

const MercadoPagoCardBrick = lazy(() => import("@/components/payments/MercadoPagoCardBrick"));

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatPaymentMethod(method: string) {
  const normalized = (method || "").toLowerCase();
  if (!normalized) return "—";
  if (normalized.includes("paypal")) return "PayPal";
  if (normalized.includes("stripe")) return "Stripe";
  if (normalized.includes("mercadopago")) return "Mercado Pago";
  if (normalized.includes("card") || normalized.includes("tarjeta")) return "Tarjeta";
  const head = method.split(":")[0]?.trim();
  return head ? head.charAt(0).toUpperCase() + head.slice(1) : method;
}

const listCardClass =
  "rounded-2xl border border-border/50 bg-card/40 overflow-hidden divide-y divide-border/30";

const MyOrders = () => {
  const { hasActiveSubscription, user } = useAuth();
  const { cartServiceIds, toggleInCart, reloadSelections, selectionsReady } = usePortalExtrasCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<PortalOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [payNote, setPayNote] = useState<string | null>(null);
  const [mpDialogOpen, setMpDialogOpen] = useState(false);
  const [mpDialogError, setMpDialogError] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    return portalGetMyOrders().then((data) => setOrders(data.orders));
  }, []);

  useEffect(() => {
    loadOrders().finally(() => setOrdersLoading(false));
  }, [loadOrders]);

  const cartLines = useMemo(() => {
    const lines: { id: string; title: string; usd: number }[] = [];
    for (const id of cartServiceIds) {
      const usd = priceUsdForService(id, hasActiveSubscription);
      const svc = getExtraServiceById(id);
      if (usd == null || !svc) continue;
      lines.push({ id, title: svc.title, usd });
    }
    return lines;
  }, [cartServiceIds, hasActiveSubscription]);

  const totalUsd = useMemo(() => cartLines.reduce((s, l) => s + l.usd, 0), [cartLines]);
  const totalArs = useMemo(() => cartLines.reduce((s, l) => s + Math.round(l.usd * 1450), 0), [cartLines]);
  const mercadoPagoPublicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY ?? "";

  const paymentStatus = searchParams.get("status");
  const paymentProvider = searchParams.get("provider");
  const mercadoPagoPaymentId = useMemo(
    () => searchParams.get("payment_id") ?? searchParams.get("collection_id"),
    [searchParams],
  );
  const paypalToken = searchParams.get("token");

  useEffect(() => {
    if (paymentStatus !== "success") return;
    const canMercado = paymentProvider === "mercadopago" && Boolean(mercadoPagoPaymentId);
    const canPaypal = paymentProvider === "paypal" && Boolean(paypalToken);
    if (!canMercado && !canPaypal) return;

    const clean = () => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("provider");
          next.delete("status");
          next.delete("session_id");
          next.delete("payment_id");
          next.delete("collection_id");
          next.delete("token");
          next.delete("PayerID");
          return next;
        },
        { replace: true },
      );
    };

    let cancelled = false;
    const run = async () => {
      try {
        if (canMercado && mercadoPagoPaymentId) {
          await paymentConfirmMercadoPagoPayment(mercadoPagoPaymentId);
        } else if (canPaypal && paypalToken) {
          await paymentConfirmPayPalOrder(paypalToken);
        }
        if (cancelled) return;
        await reloadSelections();
        await loadOrders();
        setPayNote("Pago confirmado. Gracias por tu compra.");
        toast.success("Pago confirmado", { position: "top-right" });
      } catch (err) {
        if (!cancelled) {
          toast.error("No se pudo confirmar el pago", {
            description: err instanceof Error ? err.message : undefined,
            position: "top-right",
          });
        }
      } finally {
        if (!cancelled) clean();
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [
    loadOrders,
    mercadoPagoPaymentId,
    paymentProvider,
    paymentStatus,
    paypalToken,
    reloadSelections,
    setSearchParams,
  ]);

  const loading = ordersLoading || !selectionsReady;
  const hasCart = cartLines.length > 0;
  const hasPayments = orders.length > 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasCart && !hasPayments) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState icon={ShoppingBag} message="Todavía no tenés servicios en el carrito ni pagos registrados." />
        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link to="/portal/extra-services" className="text-primary hover:underline">
            Ver servicios extras
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Servicios que agregaste desde <span className="text-foreground/90">Servicios extras</span> y el historial de
        pagos de tu cuenta.
      </p>
      {payNote && (
        <p className="text-sm text-emerald-400" role="status">
          {payNote}
        </p>
      )}

      {hasCart && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-primary">
            <ShoppingCart className="w-5 h-5 shrink-0" />
            <h2 className="font-serif text-lg font-semibold text-foreground">Servicios en tu carrito</h2>
          </div>
          <div className={listCardClass}>
            {cartLines.map((line) => (
              <div
                key={line.id}
                className="px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="min-w-0 space-y-1 flex-1">
                  <p className="text-sm font-medium text-foreground leading-snug">{line.title}</p>
                  <p className="text-xs text-muted-foreground">Seleccionado desde el catálogo de extras</p>
                </div>
                <div className="flex items-center gap-4 shrink-0 sm:justify-end">
                  <span className="text-sm font-numeric-sans font-semibold text-foreground tabular-nums">
                    USD {line.usd.toLocaleString("es-AR")}.00
                  </span>
                  <button
                    type="button"
                    aria-label={`Quitar del carrito: ${line.title}`}
                    className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => toggleInCart(line.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="px-4 py-4 sm:px-6 sm:py-5 space-y-4 bg-black/20">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="text-lg font-numeric-sans font-bold text-primary tabular-nums">
                  USD {totalUsd.toLocaleString("es-AR")}.00
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Mercado Pago cobra en ARS (cotización aproximada como en el catálogo). PayPal cobra en USD.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-primary/40 bg-primary/15 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/25 transition-colors self-center sm:self-stretch h-[46px]"
                  onClick={() => {
                    setMpDialogError(null);
                    setMpDialogOpen(true);
                  }}
                >
                  Pagar con Mercado Pago
                </button>
                <div className="flex-1 min-w-0 flex flex-col gap-1 justify-center">
                  <PayPalScriptHost>
                    <PayPalExtrasCartButton
                      onSuccess={async () => {
                        await reloadSelections();
                        await loadOrders();
                        setPayNote("Pago confirmado. Gracias por tu compra.");
                        toast.success("Pago confirmado", { position: "top-right" });
                      }}
                      onError={(msg) => {
                        if (msg) {
                          toast.error("PayPal", { description: msg, position: "top-right" });
                        }
                      }}
                    />
                  </PayPalScriptHost>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {hasPayments && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasCart ? 0.06 : 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShoppingBag className="w-5 h-5 shrink-0" />
            <h2 className="font-serif text-lg font-semibold text-foreground">Pagos registrados</h2>
          </div>
          <div className={listCardClass}>
            {orders.map((o) => (
              <div
                key={o.id}
                className="px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-foreground capitalize">{o.type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{formatDate(o.createdAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 sm:justify-end shrink-0">
                  <span className="text-sm font-numeric-sans font-semibold text-foreground tabular-nums">
                    {o.amount}
                  </span>
                  <span className="text-xs text-muted-foreground rounded-full border border-border/50 px-2.5 py-1">
                    {formatPaymentMethod(o.method)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {!hasPayments && hasCart && (
        <p className="text-sm text-muted-foreground">
          Los pagos completados aparecerán en <span className="text-foreground/90">Pagos registrados</span>.
        </p>
      )}

      <Dialog
        open={mpDialogOpen}
        onOpenChange={(open) => {
          setMpDialogOpen(open);
          if (!open) setMpDialogError(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 overflow-x-hidden border-border/50 bg-card/95 backdrop-blur-xl">
          <div className="p-5 border-b border-border/40">
            <DialogHeader>
              <DialogTitle>Pago con tarjeta — Mercado Pago</DialogTitle>
              <DialogDescription>
                Total en ARS (mismo criterio que el backend). Completá el formulario sin salir del portal.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-5 space-y-3">
            {mpDialogError && <p className="text-sm text-destructive">{mpDialogError}</p>}
            <p className="text-sm text-muted-foreground">
              Total:{" "}
              <span className="font-semibold text-foreground tabular-nums">{totalArs.toLocaleString("es-AR")} ARS</span>
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
                amount={totalArs}
                payerEmailDefault={user?.email ?? ""}
                idSuffix="extras_cart"
                onProcessPayment={async (fd) => {
                  await paymentProcessMercadoPagoCard({
                    flow: "extras_cart",
                    token: fd.token,
                    issuerId: fd.issuer_id,
                    paymentMethodId: fd.payment_method_id,
                    installments: fd.installments,
                    transactionAmount: fd.transaction_amount,
                    payerEmail: fd.payer?.email?.trim() || user?.email?.trim() || "",
                    payerIdentification: fd.payer?.identification,
                  });
                }}
                onSuccess={async () => {
                  setMpDialogOpen(false);
                  setMpDialogError(null);
                  await reloadSelections();
                  await loadOrders();
                  setPayNote("Pago confirmado. Gracias por tu compra.");
                  toast.success("Pago confirmado", { position: "top-right" });
                }}
                onError={(message) => {
                  if (message) setMpDialogError(message);
                  else setMpDialogError(null);
                }}
              />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyOrders;
