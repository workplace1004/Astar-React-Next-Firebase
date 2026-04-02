import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ABOUT_ENFOQUE_SECTION_ID,
  LANDING_SUBSCRIBE_SECTION_ID,
  scrollToAboutEnfoqueSection,
  scrollToLandingSubscribeSection,
} from "@/lib/landingAnchors";

const BIO_BODY_LANDING =
  "Diseñado por un reconocido astrólogo, numerólogo y profesional con experiencia en tarot y análisis de patrones, Carlos Bersano es el responsable del entrenamiento algorítmico de Astar. Él se asegura de que tu portal evolucione contigo, con interpretaciones profundas y holísticas para ayudarte a comprender tu mundo.";

const BIO_BODY_ABOUT =
  "Diseñado por un reconocido astrólogo, hipnotista, numerólogo profesional con experiencia en tarot y análisis de patrones, Carlos Bersano es el responsable del entrenamiento algorítmico de Astar. Él se asegura de que tu portal evolucione contigo, con interpretaciones profundas y holísticas para ayudarte a comprender tu mundo.";

const BIO_FOLLOW =
  "Dependiendo de tu suscripción, Carlos responderá personalmente a tus preguntas y te ofrecerá consultas virtuales.";

type Variant = "landing" | "about";

type CarlosBioSectionProps = {
  variant?: Variant;
  className?: string;
  id?: string;
};

const PROFESSIONAL_PHOTO_SRC = "/me.jpg";

const CarlosBioSection = ({ variant = "landing", className, id }: CarlosBioSectionProps) => {
  const isLanding = variant === "landing";
  const bioBody = isLanding ? BIO_BODY_LANDING : BIO_BODY_ABOUT;
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section
      id={id}
      className={cn("relative py-24 md:py-28 px-6 border-y border-border/30", className)}
    >
      <div className="absolute inset-0 section-glow pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        <div
          className={cn(
            "grid gap-12 md:gap-16 items-center",
            isLanding ? "lg:grid-cols-[1fr_minmax(240px,320px)]" : "lg:grid-cols-2"
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">
              {isLanding ? "Conecta tus patrones" : "La persona que está detrás de Astar"}
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-light mb-6 leading-tight">
              {isLanding ? (
                <>
                  Interpretaciones sólidas y{" "}
                  <span className="text-gradient-gold italic">orientación mensual personalizada</span>
                </>
              ) : (
                <>
                  Carlos Bersano y el{" "}
                  <span className="text-gradient-gold italic">criterio humano</span>
                </>
              )}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">{bioBody}</p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">{BIO_FOLLOW}</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {isLanding ? (
                <>
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium tracking-wide"
                  >
                    Más información
                  </Link>
                  <a
                    href={`#${LANDING_SUBSCRIBE_SECTION_ID}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToLandingSubscribeSection();
                    }}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full shimmer-gold text-primary-foreground font-medium tracking-wide text-sm hover:opacity-90 transition-opacity"
                  >
                    Reserva una consulta
                  </a>
                </>
              ) : (
                <a
                  href={`#${ABOUT_ENFOQUE_SECTION_ID}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToAboutEnfoqueSection();
                  }}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium tracking-wide w-fit cursor-pointer"
                >
                  Más información
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex justify-center lg:justify-end"
          >
            <div
              className={cn(
                "relative w-full max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden premium-shadow",
                photoFailed &&
                  "border-2 border-dashed border-primary/35 bg-background/40 flex flex-col items-center justify-center gap-3 text-center px-6 text-muted-foreground"
              )}
              aria-label="Foto profesional de Carlos Bersano"
            >
              {!photoFailed ? (
                <img
                  src={PROFESSIONAL_PHOTO_SRC}
                  alt="Carlos Bersano, astrólogo y numerólogo"
                  className="h-full w-full origin-top scale-[140%] object-cover object-top"
                  loading="lazy"
                  decoding="async"
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <>
                  <User className="w-14 h-14 text-primary/50" strokeWidth={1.25} />
                  <p className="text-sm leading-relaxed">
                    Añade aquí una foto profesional tuya
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CarlosBioSection;
