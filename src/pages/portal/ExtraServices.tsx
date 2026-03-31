import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Sparkles } from "lucide-react";
import { SansNumeralsInherit, SerifWithSansNumerals } from "@/components/SerifWithSansNumerals";
import { fetchUsdArsRate } from "@/lib/api";

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

type ServiceItem = {
  id: string;
  title: string;
  meta?: string;
  paragraphs: string[];
  priceGuestUsd: number;
  priceSubUsd: number;
};

const SERVICES: ServiceItem[] = [
  {
    id: "momento-actual",
    title: "Lectura de tu momento actual + preguntas",
    meta: "Aproximadamente 60 minutos en vivo. Chat escrito con Carlos desde tu portal.",
    paragraphs: [
      "Comprendé qué está pasando en tu vida ahora y por qué. Además, vas a poder hacer preguntas en vivo por chat conmigo, para profundizar y llevar claridad a lo que realmente te está moviendo.",
    ],
    priceGuestUsd: 210,
    priceSubUsd: 105,
  },
  {
    id: "energia-interna",
    title: "Tu energía interna vs la que estás mostrando",
    paragraphs: [
      "Descubrí la diferencia entre quién sos por dentro y lo que estás expresando hacia afuera. Ideal para entender bloqueos, incoherencias y empezar a alinearte.",
    ],
    priceGuestUsd: 110,
    priceSubUsd: 55,
  },
  {
    id: "tomar-decision",
    title: "Tomar una decisión",
    meta: "Se envía un informe escrito y se puede volver a preguntar alguna duda vía chat.",
    paragraphs: [
      "Si estás frente a una decisión importante, te ayudo a ver qué la está condicionando y desde dónde estás eligiendo. Más claridad para decidir con conciencia.",
    ],
    priceGuestUsd: 110,
    priceSubUsd: 55,
  },
  {
    id: "movimientos-6m",
    title: "Tus próximos movimientos — 6 meses",
    meta: "Se envía un informe escrito y se puede volver a preguntar alguna duda vía chat.",
    paragraphs: [
      "Interpretación de las energías que se están activando en tu vida en el corto plazo, para que entiendas hacia dónde te estás moviendo y cómo acompañarlo.",
    ],
    priceGuestUsd: 180,
    priceSubUsd: 90,
  },
  {
    id: "movimientos-12m",
    title: "Tus próximos movimientos — 12 meses",
    meta: "Se envía un informe escrito y se puede volver a preguntar alguna duda vía chat.",
    paragraphs: [
      "Una mirada más amplia de tu proceso. Entender el ciclo activo y cómo puede influir en tus decisiones.",
    ],
    priceGuestUsd: 230,
    priceSubUsd: 115,
  },
  {
    id: "audio-personalizado",
    title: "Audio personalizado de lo que necesites",
    meta: "Audio explicativo para escuchar o descargar desde tu portal.",
    paragraphs: [
      "Una respuesta en audio, clara y profunda, sobre cualquier duda que tengas: puede ser sobre tu carta astral, revolución solar, numerología o una pregunta puntual de tu vida. Recibís una interpretación personalizada para entender qué está pasando y cómo abordarlo.",
    ],
    priceGuestUsd: 50,
    priceSubUsd: 25,
  },
  {
    id: "carta-vivo",
    title: "Lectura en vivo de tu carta astral",
    meta: "Lectura por videollamada.",
    paragraphs: [
      "En esta sesión conocerás en profundidad los aspectos más importantes de tu carta astral y cómo se reflejan en tu vida. Te conocerás más a nivel personal, entendiendo tus rasgos, tu forma de pensar y de actuar. Comprenderás cómo se manifiestan tus vínculos, tus decisiones y tus experiencias a lo largo del tiempo. Podrás ver qué áreas de tu vida tienen mayor potencial y cuáles requieren más atención. Identificarás patrones que se repiten y el sentido detrás de ellos. Y mucho más… Una interpretación clara y personalizada para que puedas entenderte mejor y ver tu vida con otra perspectiva.",
    ],
    priceGuestUsd: 540,
    priceSubUsd: 270,
  },
  {
    id: "solar-vivo",
    title: "Lectura en vivo de tu revolución solar",
    meta: "Lectura por videollamada.",
    paragraphs: [
      "En esta sesión conocerás en profundidad el ciclo que estás atravesando en este año y cómo se refleja en tu vida. Comprenderás qué energías se activan durante este período y cómo pueden influir en tus decisiones. Verás qué áreas de tu vida toman protagonismo y cuáles requieren mayor atención. Podrás anticipar momentos clave del año para aprovecharlos con mayor conciencia. Identificarás el sentido de los cambios y procesos que estás viviendo. Y mucho más… Una interpretación clara y personalizada para que puedas transitar tu año con mayor claridad, enfoque y comprensión.",
    ],
    priceGuestUsd: 540,
    priceSubUsd: 270,
  },
  {
    id: "tres-preguntas",
    title: "3 preguntas (respondo integrando todas mis herramientas)",
    meta: "Se envía un informe escrito y se puede volver a preguntar alguna duda vía chat.",
    paragraphs: [
      "Respuestas profundas a tus preguntas, integrando astrología, tarot, numerología y lectura de patrones inconscientes.",
    ],
    priceGuestUsd: 70,
    priceSubUsd: 35,
  },
];

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
      className={`mt-6 rounded-xl border border-border/50 bg-black/45 p-5 shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.06)] transition-colors ${
        isSubscriber
          ? "border-[3px] border-primary bg-primary/[0.08] ring-2 ring-inset ring-primary/30 shadow-[inset_0_0_24px_-12px_hsl(var(--primary)/0.2)]"
          : "border-border/50 bg-card/20"
      }`}
    >
      {isSubscriber ? (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-3">Suscripto</p>
          <UsdPriceHeading amountUsd={subUsd} />
          <p className="mt-2 text-[11px] leading-snug">
            <span className="text-muted-foreground">Precio estándar: </span>
            <span className="font-numeric-sans text-primary line-through decoration-primary/55">
              USD {guestUsd.toLocaleString("es-AR")}.00
            </span>
          </p>
          <p className="text-sm text-muted-foreground mt-2 font-numeric-sans tabular-nums leading-snug">
            ≈ ARS {formatApproxArs(subUsd, arsPerUsd)} <span className="text-xs opacity-80">(aprox.)</span>
          </p>
        </>
      ) : (
        <>
          <UsdPriceHeading amountUsd={guestUsd} />
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            <span>Con suscripción: </span>
            <span className="font-semibold text-primary font-numeric-sans">
              USD {subUsd.toLocaleString("es-AR")}.00
            </span>
          </p>
          <p className="text-sm text-muted-foreground mt-2 font-numeric-sans tabular-nums leading-snug">
            ≈ ARS {formatApproxArs(guestUsd, arsPerUsd)} <span className="text-xs opacity-80">(aprox.)</span>
          </p>
        </>
      )}
    </div>
  );
}

const ExtraServices = () => {
  const { hasActiveSubscription } = useAuth();
  const [arsPerUsd, setArsPerUsd] = useState(FALLBACK_ARS_PER_USD);
  const [rateSource, setRateSource] = useState<"live" | "fallback" | null>(null);

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
    <div className="max-w-3xl mx-auto space-y-10 pb-8">
      <div>
        <div className="flex items-center gap-2 text-primary mb-3">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-medium tracking-[0.2em] uppercase">Catálogo</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Servicios extras</h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Los precios en dólares y en pesos argentinos son <strong className="text-foreground font-medium">orientativos</strong>{" "}
          para que tengas una idea. El equivalente en ARS usa{" "}
          {rateSource === "live" ? (
            <span>
              una cotización <strong className="text-foreground font-medium">actualizada</strong> (USD → ARS vía ExchangeRate-API;{" "}
              <SansNumeralsInherit
                text={`USD 1 ≈ ARS ${Math.round(arsPerUsd).toLocaleString("es-AR")}`}
                className="font-numeric-sans"
              />
              ).
            </span>
          ) : (
            <span>
              una cotización de <strong className="text-foreground font-medium">referencia</strong> hasta que el servidor obtenga la tasa en vivo (
              <SansNumeralsInherit
                text={`USD 1 ≈ ARS ${Math.round(arsPerUsd).toLocaleString("es-AR")}`}
                className="font-numeric-sans"
              />
              ).
            </span>
          )}{" "}
          El importe final se confirma al contratar.
        </p>
        {hasActiveSubscription && (
          <p className="mt-3 text-sm text-primary font-medium">
            Tenés suscripción activa: aplican los valores de la columna «Suscripto».
          </p>
        )}
      </div>

      <div className="space-y-8">
        {SERVICES.map((s) => (
          <article
            key={s.id}
            className="rounded-2xl border border-border/60 bg-card/50 p-6 md:p-8 shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.04)] backdrop-blur-sm"
          >
            <SerifWithSansNumerals
              as="h2"
              className="text-xl md:text-2xl font-light text-foreground mb-4 leading-snug"
              text={s.title}
            />
            {s.meta && (
              <p className="text-sm text-primary/90 mb-4 border-l-2 border-primary/40 pl-3">
                <SansNumeralsInherit text={s.meta} />
              </p>
            )}
            <div className="space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed">
              {s.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <PriceBlock
              guestUsd={s.priceGuestUsd}
              subUsd={s.priceSubUsd}
              isSubscriber={hasActiveSubscription}
              arsPerUsd={arsPerUsd}
            />
          </article>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-border/50 p-6 text-center">
        <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-4">
          Para solicitar un servicio extra o aclarar valores, escribinos desde{" "}
          <strong className="text-foreground">Preguntas</strong> o <strong className="text-foreground">Mensajes</strong>{" "}
          en tu portal.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/portal/questions"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full shimmer-gold text-primary-foreground text-sm font-medium"
          >
            Ir a Preguntas
          </Link>
          <Link
            to="/portal/messages"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-border text-sm text-foreground hover:border-primary/40 transition-colors"
          >
            Ir a Mensajes
          </Link>
          <Link
            to="/portal/purchase"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-border text-sm text-foreground hover:border-primary/40 transition-colors"
          >
            Comprar extras puntuales (pago online)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExtraServices;
