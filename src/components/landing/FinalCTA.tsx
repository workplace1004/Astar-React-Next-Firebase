import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Starfield from "./Starfield";

const FinalCTA = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (!videoOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVideoOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [videoOpen]);

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <Starfield />
      <div className="absolute inset-0 bg-gradient-radial-gold pointer-events-none opacity-40" />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-6">Comienza tu camino</p>
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light leading-[1.1] mb-8">
            Tu proceso&nbsp;
            <span className="text-gradient-gold italic">no se detiene</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed">
            Las decisiones que tomas, los momentos que atraviesas y los ciclos que se repiten forman parte de una historia que está en constante movimiento.
            Este espacio existe para ayudarte a observar y comprender ese proceso.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#subscription"
              className="px-10 py-4 rounded-full shimmer-gold text-primary-foreground font-medium tracking-wide hover:opacity-90 transition-opacity glow-gold text-lg"
            >
              Acceder a mi espacio personal
            </a>
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="px-10 py-4 rounded-full border border-border text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all tracking-wide"
            >
              Ver cómo funciona. VIDEO.
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="mt-20 h-px w-48 mx-auto line-gold"
        />
      </div>

      {videoOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl rounded-2xl border border-border/50 glass-card premium-shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setVideoOpen(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/70 text-foreground hover:bg-background transition-colors"
              aria-label="Cerrar video"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video bg-background/70 flex items-center justify-center">
              <video
                src="/video.mp4"
                className="w-full h-full"
                controls
                autoPlay
                playsInline
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FinalCTA;
