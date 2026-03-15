import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import Starfield from "./Starfield";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-20">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-sm tracking-[0.3em] uppercase text-primary mb-8"
        >
          Lectura Simbólica · Acompañamiento Humano
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-[1.1] mb-8"
        >
          Un portal para 
          <br />
          <span className="text-gradient-gold font-medium italic">entender tu proceso personal</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Un lugar donde tu historia, tus decisiones y tus procesos se integran para que puedas entender lo que realmente está pasando en tu vida
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#subscription"
            className="px-8 py-4 rounded-full shimmer-gold text-primary-foreground font-medium tracking-wide hover:opacity-90 transition-opacity glow-gold"
          >
            Explorar la Suscripción
          </a>
          <a
            href="#portal"
            className="px-8 py-4 rounded-full border border-border text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all tracking-wide"
          >
            Ver qué incluye
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-24 flex flex-col items-center gap-2"
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
