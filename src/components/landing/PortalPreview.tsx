import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Repeat, Compass, BookOpen } from "lucide-react";
import { LANDING_SUBSCRIBE_SECTION_ID, scrollToLandingSubscribeSection } from "@/lib/landingAnchors";

const benefits = [
  {
    icon: Sparkles,
    title: "Mayor claridad",
    desc: "Comprende lo que está sucediendo en tu vida y cómo se relaciona tu carta astral.",
  },
  {
    icon: Repeat,
    title: "Conciencia de los patrones",
    desc: "Observa los ciclos repetitivos y el razonamiento que hay detrás de ellos.",
  },
  {
    icon: Compass,
    title: "Mejores decisiones",
    desc: "Actúa y vive con una mayor comprensión de tu mundo interior.",
  },
  {
    icon: BookOpen,
    title: "Un registro de tu crecimiento",
    desc: "Observa cómo se conectan los puntos a lo largo del tiempo y aplica tu portal a decisiones reales.",
  },
];

const PortalPreview = () => {
  return (
    <section id="portal" className="relative py-24 md:py-32 px-6 scroll-mt-24">
      <div className="absolute inset-0 section-glow pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14 md:mb-16"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">Explora y crece</p>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light mb-6">
            Echa un vistazo a tu{" "}
            <span className="text-gradient-gold italic">portal</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Además de tu carta astral completa y todos tus informes e interpretaciones, también podrás recibir un
            análisis personalizado con Carlos Bersano cada mes para interpretar cualquier aspecto de tu vida,
            dependiendo del plan de acceso que elijas.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65 }}
          className="mb-14"
        >
          <p className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-4">
            Descubre lo que hay dentro
          </p>
          <div
            className="relative w-full max-w-4xl mx-auto aspect-video rounded-2xl border-2 border-dashed border-primary/35 bg-background/50 flex items-center justify-center px-6 premium-shadow"
            aria-label="Espacio para vídeo del portal"
          >
            <p className="text-sm text-muted-foreground text-center">
              Insertar vídeo aquí
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <p className="font-serif text-xl md:text-2xl text-center mb-10">Lo que obtendrás</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="p-6 rounded-2xl glass-card border border-border/70 premium-shadow"
              >
                <item.icon className="w-6 h-6 text-primary mb-4" />
                <h3 className="font-serif text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-muted-foreground text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Todos los mensajes, preguntas y respuestas se registran en tu portal y se convierten en un historial vivo
          que evoluciona contigo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/register"
            className="px-8 py-3.5 rounded-full shimmer-gold text-primary-foreground font-medium tracking-wide text-sm hover:opacity-90 transition-opacity"
          >
            Crea tu portal gratuito
          </Link>
          <a
            href={`#${LANDING_SUBSCRIBE_SECTION_ID}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToLandingSubscribeSection();
            }}
            className="px-8 py-3.5 rounded-full border border-border text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all text-sm tracking-wide cursor-pointer inline-flex items-center justify-center"
          >
            Reserva una consulta
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default PortalPreview;
