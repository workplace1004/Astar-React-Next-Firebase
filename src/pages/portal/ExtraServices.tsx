import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePortalExtrasCart } from "@/contexts/PortalExtrasCartContext";
import { Heart, ShoppingCart, Sparkles } from "lucide-react";
import { SansNumeralsInherit, SerifWithSansNumerals } from "@/components/SerifWithSansNumerals";
import { fetchUsdArsRate, paymentConfirmMercadoPagoPayment } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { EXTRA_SERVICES as SERVICES, type ServiceItem } from "@/lib/extraServicesCatalog";

/** Si el backend no tiene clave o la API falla, hasta que cargue otra cosa. */
const FALLBACK_ARS_PER_USD = 1450;

function formatApproxArs(usd: number, arsPerUsd: number): string {
  return Math.round(usd * arsPerUsd).toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

/** Formato tipo catálogo: entero grande + centavos en superíndice + “USD” en primary (como referencia PLN). */
function UsdPriceHeading({ amountUsd }: { amountUsd: number }) {
  const rounded = Math.round(amountUsd * 100) / 100;
  const whole = Math.floor(rounded);

  return (
    <div className="inline-flex items-baseline flex-wrap gap-x-0.5">
      <span className="text-[1.85rem] sm:text-[2.125rem] font-bold tabular-nums leading-none tracking-tight text-foreground font-numeric-sans">
        {whole.toLocaleString("es-AR")}
      </span>
      {/* <sup className="ml-px font-semibold font-numeric-sans leading-none text-primary [font-size:55%]">
        {centsStr}
      </sup> */}
      <span className="text-sm font-semibold tracking-tight text-primary font-numeric-sans">USD</span>
    </div>
  );
}

function PriceBlock({
  guestUsd,
  subUsd,
  isSubscriber,
  arsPerUsd,
}: {
  guestUsd: number;
  subUsd: number;
  isSubscriber: boolean;
  arsPerUsd: number;
}) {
  return (
    <div
      className={`mt-6 rounded-xl border border-border/50 bg-black/45 p-5 shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.06)] transition-colors ${isSubscriber
        ? "border-[3px] border-primary bg-primary/[0.08] ring-2 ring-inset ring-primary/30 shadow-[inset_0_0_24px_-12px_hsl(var(--primary)/0.2)]"
        : "border-border/50 bg-card/20"
        }`}
    >
      {isSubscriber ? (
        <>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <UsdPriceHeading amountUsd={subUsd} />
            <span className="text-sm text-muted-foreground font-numeric-sans tabular-nums leading-snug shrink-0">
              ≈ ARS {formatApproxArs(subUsd, arsPerUsd)}{" "}
              <span className="text-xs opacity-80">(aprox.)</span>
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-snug">
            <span className="text-muted-foreground">Precio estándar: </span>
            <span className="font-numeric-sans text-primary line-through decoration-primary/55">
              USD {guestUsd.toLocaleString("es-AR")}.00
            </span>
          </p>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <UsdPriceHeading amountUsd={guestUsd} />
            <span className="text-sm text-muted-foreground font-numeric-sans tabular-nums leading-snug shrink-0">
              ≈ ARS {formatApproxArs(guestUsd, arsPerUsd)}{" "}
              <span className="text-xs opacity-80">(aprox.)</span>
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            <span>Con suscripción: </span>
            <span className="font-semibold text-primary font-numeric-sans">
              USD {subUsd.toLocaleString("es-AR")}.00
            </span>
          </p>
        </>
      )}
    </div>
  );
}

function useMediaMdUp() {
  const [mdUp, setMdUp] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setMdUp(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return mdUp;
}

function ExtraServiceCard({
  service: s,
  cardImage,
  hasActiveSubscription,
  arsPerUsd,
}: {
  service: ServiceItem;
  cardImage: string;
  hasActiveSubscription: boolean;
  arsPerUsd: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { toggleInCart, isInCart, isFavorite, toggleFavorite } = usePortalExtrasCart();
  const favorited = isFavorite(s.id);
  const inCart = isInCart(s.id);
  const [imgH, setImgH] = useState<number | null>(null);
  const [textOverflows, setTextOverflows] = useState(false);
  const imgShellRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const isMdUp = useMediaMdUp();

  const measureOverflow = useCallback(() => {
    const clip = clipRef.current;
    if (!clip) return;
    setTextOverflows(clip.scrollHeight > clip.clientHeight + 2);
  }, []);

  useLayoutEffect(() => {
    const el = imgShellRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setImgH(Math.round(el.getBoundingClientRect().height));
    });
    ro.observe(el);
    setImgH(Math.round(el.getBoundingClientRect().height));
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    measureOverflow();
    const raf = requestAnimationFrame(measureOverflow);
    const t = window.setTimeout(measureOverflow, 120);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [expanded, imgH, isMdUp, measureOverflow, s.id, s.paragraphs]);

  useEffect(() => {
    window.addEventListener("resize", measureOverflow);
    return () => window.removeEventListener("resize", measureOverflow);
  }, [measureOverflow]);

  const capLeftToImage = isMdUp && !expanded && imgH != null && imgH > 0;

  return (
    <article className="rounded-2xl border border-border/60 bg-card/50 p-6 md:p-8 shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.04)] backdrop-blur-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            isMdUp && "min-h-0",
            capLeftToImage && "overflow-hidden",
          )}
          style={capLeftToImage ? { maxHeight: imgH } : undefined}
        >
          <SerifWithSansNumerals
            as="h2"
            className="shrink-0 text-xl md:text-2xl font-light text-foreground mb-4 leading-snug"
            text={s.title}
          />
          {s.meta && (
            <p className="shrink-0 text-sm text-primary/90 mb-4 border-l-2 border-primary/40 pl-3">
              <SansNumeralsInherit text={s.meta} />
            </p>
          )}
          <div
            className={cn(
              "flex flex-col gap-2",
              isMdUp && !expanded && "min-h-0 flex-1 overflow-hidden",
            )}
          >
            <div
              ref={clipRef}
              className={cn(
                "space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed",
                !expanded && !isMdUp && "line-clamp-4",
                isMdUp && !expanded && "min-h-0 flex-1 overflow-hidden",
                isMdUp && expanded && "overflow-visible",
              )}
            >
              {s.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {(textOverflows || expanded) && (
              <button
                type="button"
                className="shrink-0 text-left text-sm font-medium text-primary hover:underline"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Ver menos" : "... Ver más"}
              </button>
            )}
          </div>
          <div className="shrink-0">
            <PriceBlock
              guestUsd={s.priceGuestUsd}
              subUsd={s.priceSubUsd}
              isSubscriber={hasActiveSubscription}
              arsPerUsd={arsPerUsd}
            />
          </div>
        </div>
        <div
          ref={imgShellRef}
          className="mx-auto w-full max-w-[500px] shrink-0 md:mx-0 md:w-[260px] lg:w-[500px] h-[400px]"
        >
          <div className="relative w-full overflow-hidden rounded-xl border border-border/50 bg-muted/10 shadow-sm">
            <img
              src={cardImage}
              alt=""
              className="h-[400px] w-[500px] object-cover object-center"
              loading="lazy"
              decoding="async"
              onLoad={measureOverflow}
            />
            <div className="absolute right-2 top-2 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-2 py-1.5 shadow-sm backdrop-blur-sm">
              <button
                type="button"
                aria-pressed={favorited}
                aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
                className={cn(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-[background-color,box-shadow,transform] duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black/40",
                  favorited
                    ? "bg-primary/35 shadow-[0_0_0_2px_hsl(var(--primary)/0.55),0_0_20px_-4px_hsl(var(--primary)/0.5)]"
                    : "bg-white/5 hover:bg-white/10 active:scale-95",
                )}
                onClick={() => {
                  const was = favorited;
                  toggleFavorite(s.id);
                  if (!was) {
                    toast.success("Agregado a favoritos", {
                      description: s.title,
                      position: "top-right",
                      duration: 3200,
                    });
                  } else {
                    toast("Quitado de favoritos", {
                      description: s.title,
                      position: "top-right",
                      duration: 2800,
                    });
                  }
                }}
              >
                <Heart
                  className={cn(
                    "relative z-[1] h-6 w-6 text-primary transition-[fill,transform] duration-200",
                    favorited && "fill-primary scale-105",
                  )}
                  strokeWidth={2}
                />
              </button>
              <button
                type="button"
                aria-pressed={inCart}
                aria-label={inCart ? `Quitar del carrito: ${s.title}` : `Agregar al carrito: ${s.title}`}
                className={cn(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-[background-color,box-shadow,transform] duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black/40",
                  inCart
                    ? "bg-primary/35 shadow-[0_0_0_2px_hsl(var(--primary)/0.55),0_0_20px_-4px_hsl(var(--primary)/0.5)]"
                    : "bg-white/5 hover:bg-white/10 active:scale-95",
                )}
                onClick={() => {
                  const wasInCart = inCart;
                  toggleInCart(s.id);
                  if (!wasInCart) {
                    toast.success("Agregado al carrito", {
                      description: s.title,
                      position: "top-right",
                      duration: 3200,
                    });
                  } else {
                    toast("Quitado del carrito", {
                      description: s.title,
                      position: "top-right",
                      duration: 2800,
                    });
                  }
                }}
              >
                <ShoppingCart
                  className={cn(
                    "relative z-[1] h-6 w-6 text-primary transition-transform duration-200",
                    inCart && "scale-105",
                  )}
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

const ExtraServices = () => {
  const { hasActiveSubscription } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [arsPerUsd, setArsPerUsd] = useState(FALLBACK_ARS_PER_USD);
  const [rateSource, setRateSource] = useState<"live" | "fallback" | null>(null);
  const [payBanner, setPayBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const paymentStatus = searchParams.get("status");
  const paymentProvider = searchParams.get("provider");
  const mercadoPagoPaymentId = useMemo(
    () => searchParams.get("payment_id") ?? searchParams.get("collection_id"),
    [searchParams],
  );

  useEffect(() => {
    const confirm = async () => {
      if (paymentStatus !== "success") return;
      try {
        if (paymentProvider === "mercadopago" && mercadoPagoPaymentId) {
          await paymentConfirmMercadoPagoPayment(mercadoPagoPaymentId);
          setPayBanner({ type: "ok", text: "Pago confirmado. Tu compra extra ya está registrada." });
        } else {
          return;
        }
      } catch (err) {
        setPayBanner({
          type: "err",
          text: err instanceof Error ? err.message : "No se pudo confirmar el pago.",
        });
      } finally {
        const clean = new URLSearchParams(searchParams);
        clean.delete("provider");
        clean.delete("status");
        clean.delete("payment_id");
        clean.delete("collection_id");
        setSearchParams(clean, { replace: true });
      }
    };
    void confirm();
  }, [mercadoPagoPaymentId, paymentProvider, paymentStatus, searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    void fetchUsdArsRate()
      .then((r) => {
        if (cancelled) return;
        if (typeof r.arsPerUsd === "number" && r.arsPerUsd > 0) {
          setArsPerUsd(r.arsPerUsd);
          setRateSource(r.source);
        }
      })
      .catch(() => {
        if (!cancelled) setRateSource("fallback");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-8">
      <div>
        <div className="flex items-center gap-2 text-primary mb-3">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-medium tracking-[0.2em] uppercase">Catálogo</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Servicios extras</h1>
        {payBanner && (
          <p
            className={`text-sm mb-4 ${payBanner.type === "ok" ? "text-emerald-400" : "text-destructive"}`}
            role="status"
          >
            {payBanner.text}
          </p>
        )}
      </div>

      <div className="space-y-8">
        {SERVICES.map((s, cardIndex) => (
          <ExtraServiceCard
            key={s.id}
            service={s}
            cardImage={`/extra/${cardIndex + 1}.jpg`}
            hasActiveSubscription={hasActiveSubscription}
            arsPerUsd={arsPerUsd}
          />
        ))}
      </div>
    </div>
  );
};

export default ExtraServices;
