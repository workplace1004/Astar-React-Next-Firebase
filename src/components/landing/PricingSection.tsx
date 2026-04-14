import { motion, AnimatePresence } from "framer-motion";
import { Shield, Star } from "lucide-react";
import { DoubleCheckIcon } from "@/components/icons/DoubleCheckIcon";
import { Link } from "react-router-dom";
import { useState } from "react";
import { LANDING_SUBSCRIBE_SECTION_ID } from "@/lib/landingAnchors";
import { useAuth } from "@/contexts/AuthContext";

/** Alineado con el plan Portal en backend (29 USD/mes; anual −20 %, equivalente mensual sin decimales). */
const PORTAL_PRICE_MONTHLY = "29";
const PORTAL_PRICE_ANNUAL_PER_MONTH = String(Math.round(29 * 0.8));

const PricingSection = () => {
  const { isAuthenticated } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <section id={LANDING_SUBSCRIBE_SECTION_ID} className="relative py-24 md:py-32 px-6 scroll-mt-24">
      <div className="absolute inset-0 section-glow pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-12"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">Acceso mensual o anual</p>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light mb-6">
            Liberá tu potencial de{" "}
            <span className="text-gradient-gold italic">crecimiento</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg">
            Elegí tu plan de acceso mensual para empezar a dar sentido a tu vida.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="flex items-center justify-center gap-2 mb-12 overflow-visible pt-1"
        >
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
              billing === "monthly"
                ? "bg-primary/20 border border-primary/50 text-primary"
                : "border border-border/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            Pago mensual
          </button>
          <span className="relative inline-flex shrink-0">
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
                billing === "annual"
                  ? "bg-primary/20 border border-primary/50 text-primary"
                  : "border border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              Pago anual
            </button>
            <AnimatePresence>
              {billing === "annual" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5, y: 8, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotate: 360 }}
                  exit={{ opacity: 0, scale: 0.85, y: -4, rotate: 0 }}
                  transition={{
                    rotate: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.25 },
                    scale: { type: "spring", stiffness: 520, damping: 24 },
                    y: { type: "spring", stiffness: 520, damping: 24 },
                  }}
                  className="pointer-events-none absolute -right-1 -top-2 z-10 inline-block origin-center rounded-full bg-amber-400 px-2 py-0.5 text-[13px] font-bold uppercase leading-none tracking-wide text-black shadow-sm font-sans"
                  aria-hidden
                >
                  20% OFF
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="rounded-2xl p-8 flex flex-col border border-border/70 glass-card premium-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-medium">Essentials</h3>
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-5xl font-light text-gradient-gold mb-1">Gratis</p>
            <p className="text-sm text-muted-foreground mb-8">Para dar los primeros pasos y explorar tu carta astral</p>
            <Link
              to="/register"
              className="w-full py-3.5 rounded-full text-center border border-border text-foreground hover:border-primary/50 hover:bg-primary/5 font-medium tracking-wide text-sm transition-all duration-300 mb-8"
            >
              Acceder
            </Link>
            <div className="h-px w-full bg-border/50 mb-8" />
            <ul className="space-y-3 flex-1">
              {[
                "Carta astral de nacimiento",
                "Informe personal de numerología",
                "Acceso para empezar a crear tu portal",
                "Lecturas y documentos simbólicos",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <DoubleCheckIcon className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.08 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl p-8 flex flex-col border-2 border-primary/70 glass-card premium-shadow-lg shadow-[0_0_0_2px_hsl(var(--primary)/0.5),0_0_28px_hsl(var(--primary)/0.2)]"
            style={{border: "2px solid hsl(var(--primary)/0.7)"}}
          >
            <p className="absolute top-4 right-4 text-[10px] uppercase tracking-widest text-primary font-medium">
              El más popular
            </p>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-medium pr-16">Portal completo</h3>
              <Star className="w-5 h-5 text-primary shrink-0" />
            </div>
            <div className="mb-2">
              <span className="font-sans text-4xl md:text-5xl font-light text-gradient-gold tabular-nums">
                ${billing === "monthly" ? PORTAL_PRICE_MONTHLY : PORTAL_PRICE_ANNUAL_PER_MONTH}
              </span>
              <span className="text-muted-foreground text-sm ml-2">/ mes</span>
            </div>
            {/* <p className="text-xs text-muted-foreground mb-2">
              {billing === "annual"
                ? "Equivalente mensual facturado en pago anual."
                : "Importe orientativo — actualízalo al publicar."}
            </p> */}
            <p className="text-sm text-muted-foreground mb-8">
              Para obtener profundidad, claridad y orientación humana
            </p>
            <Link
              to={isAuthenticated ? "/portal/subscription" : "/register"}
              className="w-full py-3.5 rounded-full text-center shimmer-gold text-primary-foreground font-medium tracking-wide text-sm hover:opacity-90 transition-opacity mb-8 block"
            >
              Desbloquea el portal completo
            </Link>
            <div className="h-px w-full bg-border/50 mb-8" />
            <ul className="space-y-3 flex-1">
              {[
                "Todo lo incluido en Essentials",
                "Interpretaciones completas de todos los informes",
                "Explicación clara de tu situación actual (por chat)",
                "Perspectivas continuas dentro de tu portal",
                "1 respuesta detallada y personalizada de Carlos por vídeo, audio o por escrito (no IA)",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <DoubleCheckIcon className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 text-center text-xs text-muted-foreground"
        >
          Pagos seguros con PayPal y Mercado Pago.
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
