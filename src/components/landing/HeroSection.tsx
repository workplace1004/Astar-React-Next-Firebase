import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import Starfield from "./Starfield";
import { LANDING_SUBSCRIBE_SECTION_ID, scrollToLandingSubscribeSection } from "@/lib/landingAnchors";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden scroll-mt-24">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Cielo celeste con constelaciones doradas"
          className="w-full h-full object-cover opacity-40 dark:opacity-40 opacity-20"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
      </div>

      {/* Starfield canvas */}
      <Starfield />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-gradient-radial-gold pointer-events-none" />

      {/* Orbiting ring decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] dark:opacity-[0.07]">
        <div className="w-[600px] h-[600px] rounded-full border border-primary animate-gentle-rotate" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.04]">
        <div className="w-[800px] h-[800px] rounded-full border border-primary animate-gentle-rotate" style={{ animationDirection: "reverse", animationDuration: "90s" }} />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-24 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-8 text-xs sm:text-sm tracking-[0.2em] uppercase text-primary"
        >
          <span>Tu portal de lectura que evoluciona con vos</span>
          {/* <span className="hidden sm:inline text-border">·</span>
          <a
            href={`#${LANDING_SUBSCRIBE_SECTION_ID}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToLandingSubscribeSection();
            }}
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            Consulta con un asesor
          </a> */}
        </motion.div>

        {/* <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-sm tracking-[0.25em] uppercase text-muted-foreground mb-6"
        >
          Tu portal de lectura que evoluciona contigo
        </motion.p> */}

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.65 }}
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.2] mb-8 max-w-3xl mx-auto"
        >
          Tu propio espacio para encontrarle {" "}<br />
          <span className="text-gradient-gold font-medium italic">sentido a lo que vivís.</span>{" "}
        <div className="mt-6 mb-2 flex flex-col items-center justify-center">
          <p className="text-base md:text-lg text-muted-foreground mb-1">
            Porque entender lo que te pasa<br className="hidden md:block" />
            cambia todo lo que decidís después.
          </p>
          <p className="text-sm md:text-base text-muted-foreground/70 mt-5">
            Con astrología, numerología, tarot y una persona real <br/>
            del otro lado.
          </p>
        </div>
   
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <Link
            to="/register"
            className="px-8 py-4 rounded-full shimmer-gold text-primary-foreground font-medium tracking-wide hover:opacity-90 transition-opacity glow-gold"
          >
            Crea tu portal gratuito
          </Link>
          <a
            href="#portal"
            className="px-8 py-4 rounded-full border border-border text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all tracking-wide"
          >
            Descubre qué hay dentro
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.15 }}
          className="text-sm text-muted-foreground tracking-wide"
        >
          Empieza gratis. Desbloquea más profundidad según lo necesites.
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="mt-20 flex flex-col items-center gap-2"
        >
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Desplazar</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
