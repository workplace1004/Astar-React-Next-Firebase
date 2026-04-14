import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Astar me dio una forma completamente nueva de entender mis ciclos. Los mensajes mensuales parecen escritos por alguien que realmente me conoce.",
    name: "Camila R.",
    role: "Suscriptora desde hace 8 meses",
  },
  {
    quote:
      "He probado decenas de apps de astrología. Ninguna se acerca a la profundidad y atención personal que ofrece Astar. No es una app — es una experiencia.",
    name: "Martín L.",
    role: "Suscriptor desde hace 1 año",
  },
  {
    quote:
      "La función de preguntas es increíble. Pregunté sobre una decisión laboral y recibí la respuesta más reflexiva y fundamentada que podría imaginar.",
    name: "Sofía T.",
    role: "Suscriptora desde hace 5 meses",
  },
];

const ReviewCard = ({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) => (
  <div className="relative p-8 rounded-2xl glass-card transition-all duration-300 flex flex-col flex-shrink-0 w-[340px] md:w-[380px] hover:border-primary/20 premium-shadow">
    <Quote className="w-8 h-8 text-primary/20 mb-5 shrink-0" />
    <p className="text-foreground leading-relaxed text-sm flex-1 mb-8 italic">
      "{quote}"
    </p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
        <span className="font-serif text-sm text-primary font-medium">
          {name.charAt(0)}
        </span>
      </div>
      <div>
        <p className="font-serif text-base font-medium">{name}</p>
        <p className="text-xs text-muted-foreground tracking-wide">{role}</p>
      </div>
    </div>
  </div>
);

const CARD_WIDTH = 340;
const GAP = 24;
const SLIDE_DISTANCE = (CARD_WIDTH + GAP) * testimonials.length;

const Testimonials = () => {
  const row1Items = [...testimonials, ...testimonials];
  const row2Items = [...testimonials, ...testimonials];

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 section-glow pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial-gold pointer-events-none opacity-20" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">Comentarios de nuestra comunidad</p>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light mb-6">
            Los que ya<br />
            <span className="text-gradient-gold italic">quienes ya usan Astar</span>
          </h2>
        </motion.div>

        {/* Row 1: flows right to left (content scrolls left) */}
        <div className="overflow-hidden mb-6" aria-hidden="true">
          <motion.div
            className="flex gap-6 w-max"
            animate={{ x: [0, -SLIDE_DISTANCE] }}
            transition={{
              x: { repeat: Infinity, repeatType: "loop", duration: 28, ease: "linear" },
            }}
            style={{ width: "max-content" }}
          >
            {row1Items.map((t, i) => (
              <ReviewCard key={`row1-${i}-${t.name}`} quote={t.quote} name={t.name} role={t.role} />
            ))}
          </motion.div>
        </div>

        {/* Row 2: flows left to right (content scrolls right) */}
        <div className="overflow-hidden" aria-hidden="true">
          <motion.div
            className="flex gap-6 w-max"
            animate={{ x: [-SLIDE_DISTANCE, 0] }}
            transition={{
              x: { repeat: Infinity, repeatType: "loop", duration: 28, ease: "linear" },
            }}
            style={{ width: "max-content" }}
          >
            {row2Items.map((t, i) => (
              <ReviewCard key={`row2-${i}-${t.name}`} quote={t.quote} name={t.name} role={t.role} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
