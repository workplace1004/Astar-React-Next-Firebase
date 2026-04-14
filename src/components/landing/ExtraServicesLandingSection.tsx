import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { EXTRA_SERVICES, extraServiceImageSrcByCatalogIndex } from "@/lib/extraServicesCatalog";
import { SerifWithSansNumerals } from "@/components/SerifWithSansNumerals";
import { cn } from "@/lib/utils";

const PLACEHOLDER_IMG = "/placeholder.svg";

function LandingExtraServiceImage({ catalogIndex, title }: { catalogIndex: number; title: string }) {
  const intended = extraServiceImageSrcByCatalogIndex(catalogIndex);
  const [src, setSrc] = useState(intended);

  return (
    <div className="relative aspect-[5/3] w-full shrink-0 overflow-hidden bg-muted/25 border-b border-border/50">
      <img
        src={src}
        alt={title}
        className="h-full w-full object-cover object-center"
        loading="lazy"
        decoding="async"
        onError={() => setSrc(PLACEHOLDER_IMG)}
      />
    </div>
  );
}

type ExtraServicesLandingSectionProps = {
  className?: string;
  /** When true, only the catalog grid and CTAs (for the public `/servicios-extras` page hero). */
  omitHeader?: boolean;
};

/**
 * Vista resumida del catálogo de servicios extras (misma fuente que /portal/extra-services).
 */
const ExtraServicesLandingSection = ({ className, omitHeader = false }: ExtraServicesLandingSectionProps) => {
  return (
    <section
      id={omitHeader ? undefined : "servicios-extras"}
      className={cn(
        "relative py-24 md:py-28 px-6 border-y border-border/30 scroll-mt-24",
        omitHeader && "border-0 py-0 px-0 scroll-mt-0",
        className
      )}
    >
      <div className="absolute inset-0 section-glow pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        {!omitHeader ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mb-12 md:mb-14"
          >
            <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 opacity-90" aria-hidden />
              Servicios extras
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-light mb-5 leading-tight">
              Consultas y sesiones{" "}
              <span className="text-gradient-gold italic">con Carlos</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Además del portal, podés sumar lecturas en vivo, informes escritos y audios personalizados. Los precios
              en USD son orientativos; con suscripción activa aplican valores reducidos en el portal.
            </p>
          </motion.div>
        ) : null}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {EXTRA_SERVICES.map((s, index) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.35) }}
              className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.04)]"
            >
              <LandingExtraServiceImage catalogIndex={index} title={s.title} />
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <SerifWithSansNumerals
                  as="h3"
                  className="text-lg md:text-xl font-light text-foreground leading-snug mb-2"
                  text={s.title}
                />
                {s.meta ? (
                  <p className="text-xs text-primary/85 border-l-2 border-primary/35 pl-2.5 mb-3 line-clamp-2">
                    {s.meta}
                  </p>
                ) : null}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-4">
                  {s.paragraphs[0]}
                </p>
                <p className="text-sm font-semibold text-foreground font-numeric-sans tabular-nums">
                  Desde USD {s.priceGuestUsd.toLocaleString("es-AR")}
                  <span className="text-muted-foreground font-normal text-xs ml-1">(visitante)</span>
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-12"
        >
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full shimmer-gold text-primary-foreground font-medium tracking-wide text-sm hover:opacity-90 transition-opacity text-center"
          >
            Crear cuenta y contratar
          </Link>
          <Link
            to="/portal/extra-services"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium tracking-wide text-center"
          >
            Ver catálogo en el portal
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ExtraServicesLandingSection;
