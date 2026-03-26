import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Starfield from "./Starfield";

const FinalCTA = () => {
  return (
    <section className="relative py-24 md:py-32 px-6 overflow-hidden">
      <Starfield />
      <div className="absolute inset-0 bg-gradient-radial-gold pointer-events-none opacity-40" />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light leading-[1.15] mb-8">
            Dejá de repetir.{" "}
            <span className="text-gradient-gold italic">Empezá a entender</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Una plataforma personalizada que conecta tu carta astral y todos tus documentos con tu vida real para que
            puedas ver qué está pasando, por qué ocurre y qué hacer a continuación.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Link
              to="/register"
              className="inline-flex px-10 py-4 rounded-full shimmer-gold text-primary-foreground font-medium tracking-wide hover:opacity-90 transition-opacity glow-gold text-base"
            >
              Crea tu portal gratuito
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.4 }}
          className="mt-16 h-px w-48 mx-auto line-gold"
        />
      </div>
    </section>
  );
};

export default FinalCTA;
