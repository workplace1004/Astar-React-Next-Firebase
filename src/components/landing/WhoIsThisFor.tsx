import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const WhoIsThisFor = () => {
  return (
    <section id="para-ti" className="relative py-24 md:py-32 px-6 scroll-mt-24">
      <div className="absolute inset-0 section-glow pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">¿Es esto para ti?</p>
          <h2 className="font-serif text-3xl md:text-5xl font-light mb-8 leading-tight">
            Si sentís que algo se repite y{" "}
            <span className="text-gradient-gold italic">no sabés por qué</span>
          </h2>
          <div className="space-y-5 text-muted-foreground text-base md:text-lg leading-relaxed mb-10 text-left sm:text-center">
            <p>
              Quizás algo en tu vida está cambiando, pero no acabás de entender por qué.
            </p>
            <p>
              De alguna manera, los mismos patrones se repiten en tus relaciones o decisiones, y solo necesitás ayuda
              para ver el panorama general.
            </p>
            <p className="text-foreground font-medium">
              No busques predicciones, sino claridad y sentido.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex px-8 py-3.5 rounded-full shimmer-gold text-primary-foreground font-medium tracking-wide text-sm hover:opacity-90 transition-opacity"
          >
            Elegí tu acceso
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default WhoIsThisFor;
