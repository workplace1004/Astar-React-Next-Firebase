import { motion } from "framer-motion";
import LandingSubscribeSectionLink from "@/components/landing/LandingSubscribeSectionLink";
import { UserPlus, CreditCard, LayoutDashboard, MessageCircle, HelpCircle } from "lucide-react";

const steps = [
  { icon: CreditCard, step: 1, title: "Suscríbete", desc: "Elige tu plan y completa el pago de forma segura con PayPal o Mercado Pago." },
  { icon: UserPlus, step: 2, title: "Crea tu cuenta", desc: "Registra tus datos personales y tu información de nacimiento (fecha, hora y lugar)." },
  { icon: LayoutDashboard, step: 3, title: "Accede a tu portal", desc: "Ingresa a tu espacio personal donde encontrarás tu carta natal, revolución solar y numerología." },
  { icon: MessageCircle, step: 4, title: "Recibe tu mensaje mensual", desc: "Cada mes recibes una lectura personalizada basada en los tránsitos que afectan tu carta natal." },
  { icon: HelpCircle, step: 5, title: "Haz una pregunta al mes", desc: "Tu suscripción incluye una pregunta mensual con respuesta personalizada basada en la lectura simbólica." },
];

const HowItWorksPage = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-5xl md:text-6xl text-gradient-gold font-semibold mb-4 text-center">Cómo Funciona</h1>
          <p className="text-center text-muted-foreground mb-16">Tu camino hacia el autoconocimiento en 5 pasos simples.</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border/50 hidden md:block" />
          <div className="space-y-10">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-6 md:gap-8 items-start"
              >
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 glass-card rounded-2xl p-6 premium-shadow">
                  <p className="text-xs text-primary font-medium tracking-widest uppercase mb-2">Paso {s.step}</p>
                  <h3 className="font-serif text-xl text-foreground mb-2">{s.title}</h3>
                  <p className="text-muted-foreground">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center mt-16">
          <LandingSubscribeSectionLink className="inline-block px-10 py-4 rounded-xl shimmer-gold text-primary-foreground font-medium tracking-wide glow-gold">
            Comenzar ahora
          </LandingSubscribeSectionLink>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksPage;
