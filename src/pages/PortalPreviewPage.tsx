import { motion } from "framer-motion";
import LandingSubscribeSectionLink from "@/components/landing/LandingSubscribeSectionLink";
import { Sun, Moon, Hash, MessageCircle, HelpCircle } from "lucide-react";

const previews = [
  { icon: Sun, title: "Carta Natal", desc: "Visualización completa de tu carta con interpretaciones detalladas de planetas, casas y aspectos.", mock: "Sol en Escorpio ♏ Casa VIII — Transformación profunda, poder interior y regeneración emocional." },
  { icon: Moon, title: "Revolución Solar", desc: "Tu mapa energético para el año. Temas, desafíos y oportunidades que se activan en tu cumpleaños solar.", mock: "Ascendente RS en Cáncer — Año de introspección, hogar y raíces emocionales." },
  { icon: Hash, title: "Numerología", desc: "Tu número de camino de vida, año personal y vibraciones numéricas que guían tu experiencia.", mock: "Camino de vida: 7 — Búsqueda espiritual, análisis profundo, sabiduría interior." },
  { icon: MessageCircle, title: "Mensaje Mensual", desc: "Cada mes recibes un mensaje personalizado basado en los tránsitos que activan tu carta natal.", mock: "Marzo 2026: Marte transita tu Casa X. Momento de acción profesional y visibilidad." },
  { icon: HelpCircle, title: "Sistema de Preguntas", desc: "Una pregunta al mes incluida en tu suscripción. Respuesta personalizada con base simbólica.", mock: "Pregunta: '¿Es buen momento para cambiar de trabajo?' — Respuesta basada en tránsitos actuales." },
];

const PortalPreviewPage = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="font-serif text-5xl md:text-6xl text-gradient-gold font-semibold mb-4 text-center">Vista Previa del Portal</h1>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Así es como se ve tu portal personal. Estos son ejemplos de lo que recibirás como suscriptor.
          </p>
        </motion.div>

        <div className="space-y-8">
          {previews.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              className="glass-card rounded-2xl p-8 md:p-10 premium-shadow"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <p.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-2xl text-foreground mb-2">{p.title}</h3>
                  <p className="text-muted-foreground mb-4">{p.desc}</p>
                  <div className="bg-background/50 border border-border/50 rounded-xl p-4">
                    <p className="text-sm text-primary/80 italic font-serif">"{p.mock}"</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center mt-16">
          <LandingSubscribeSectionLink className="inline-block px-10 py-4 rounded-xl shimmer-gold text-primary-foreground font-medium tracking-wide glow-gold">
            Suscribirme ahora
          </LandingSubscribeSectionLink>
        </motion.div>
      </div>
    </section>
  );
};

export default PortalPreviewPage;
