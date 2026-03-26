import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "¿La pregunta mensual es respondida por una persona real?",
    a: "Sí. En el plan Portal completo, la respuesta detallada y personalizada de Carlos es humana (vídeo, audio o escrito), no generada por IA.",
  },
  {
    q: "¿El resto de interpretaciones usan inteligencia artificial?",
    a: "Las interpretaciones de documentos y el acompañamiento dentro del portal se apoyan en un sistema entrenado con el método de Carlos Bersano, para ofrecer guía clara sobre los ciclos y procesos que estás viviendo.",
  },
  {
    q: "¿Qué tipo de preguntas puedo hacer?",
    a: "Podés preguntar por situaciones personales: trabajo, relaciones, decisiones importantes o procesos que estés atravesando. La idea es ayudarte a ver tu momento con más claridad.",
  },
  {
    q: "¿Qué datos de nacimiento debo aportar?",
    a: "Para calcular tu mapa necesitamos fecha de nacimiento, hora (si la conocés) y ciudad de nacimiento. Si no tenés la hora exacta, algunas funciones del portal igual podrán utilizarse.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Sí. Podés gestionar o cancelar tu suscripción según las opciones disponibles en tu cuenta y las condiciones indicadas al contratar.",
  },
  {
    q: "¿Mis consultas son privadas?",
    a: "Sí. Tus documentos y análisis permanecen en tu espacio personal para que los consultes cuando lo necesites.",
  },
  {
    q: "¿El portal se actualiza con el tiempo?",
    a: "Sí. A medida que avanzás, se van sumando análisis, mensajes y funciones dentro de tu espacio personal.",
  },
  {
    q: "¿Puedo hacer más de una pregunta al mes?",
    a: "Tu plan incluye una consulta incluida; podés contratar consultas adicionales cuando lo necesites.",
  },
  {
    q: "¿Qué ocurre cuando me suscribo?",
    a: "Se crea tu espacio personal en la plataforma, con acceso a documentos, análisis y consultas organizados como parte de tu proceso.",
  },
  {
    q: "¿Necesito saber astrología para usar Astar?",
    a: "No. El portal está pensado para quien quiera comprender mejor su proceso, sin conocimientos previos.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="relative py-24 md:py-32 px-6 scroll-mt-24">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">Preguntas frecuentes</p>
          <h2 className="font-serif text-3xl md:text-5xl font-light">
            Respuestas a <span className="text-gradient-gold italic">tus preguntas</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                value={`faq-${i}`}
                className="rounded-xl glass-card px-6 data-[state=open]:border-primary/20 transition-colors premium-shadow"
              >
                <AccordionTrigger className="text-left font-serif text-lg font-medium py-5 hover:no-underline hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
