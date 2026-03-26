import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Map } from "lucide-react";
import CarlosBioSection from "@/components/landing/CarlosBioSection";

const About = () => {
  return (
    <div className="py-16 md:py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-4xl md:text-6xl text-gradient-gold font-semibold mb-6">Acerca de Astar</h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Manifiesto, enfoque y la persona detrás del entrenamiento de tu portal.
          </p>
        </motion.div>

        <motion.section
          id="manifiesto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.05 }}
          className="mb-20 scroll-mt-28"
        >
          <blockquote className="font-serif text-xl md:text-2xl italic text-foreground/95 leading-relaxed border-l-2 border-primary/50 pl-6 mb-10">
            «Las estrellas no obligan. Sugieren. Y comprender esa sugerencia es el primer paso hacia la libertad».
          </blockquote>
          <div className="space-y-5 text-muted-foreground leading-relaxed text-base md:text-lg">
            <p>
              Astar no es una aplicación de horóscopos. Es un espacio para la intimidad y la reflexión.
            </p>
            <p>
              Aquí, tu carta astral se interpreta con ojos humanos, con reflexión y esmero. Porque creemos que te
              merecés algo más que algoritmos: te merecés presencia.
            </p>
          </div>
        </motion.section>
      </div>

      <CarlosBioSection variant="about" className="border-t-0 border-b-0 py-16 md:py-20" />

      <div className="max-w-3xl mx-auto px-6">
        <motion.section
          id="enfoque"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
          className="py-16 md:py-20 scroll-mt-28"
        >
          <div className="flex items-center gap-3 mb-6 text-primary">
            <Sparkles className="w-6 h-6" />
            <p className="text-sm tracking-[0.25em] uppercase">Una forma diferente</p>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">
            De abordar la <span className="text-gradient-gold italic">astrología</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed">
            Astar nació de una sencilla convicción: tu carta astral no está ahí para predecir tu futuro, sino para
            ayudarte a comprender tu presente.
          </p>
          <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
            La astrología, cuando se interpreta en profundidad, puede ayudarte a ver lo que realmente está sucediendo
            bajo la superficie. Te ayudamos a ver:
          </p>
          <ul className="space-y-3 text-muted-foreground text-base md:text-lg mb-10 list-disc pl-6">
            <li>Qué está activo en tu vida</li>
            <li>Qué patrones se repiten</li>
            <li>En qué tipo de momento te encontrás</li>
          </ul>
          <p className="text-foreground text-base md:text-lg font-medium">
            Para que puedas decidir cómo afrontarlo.
          </p>
        </motion.section>

        <motion.section
          id="mapa"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
          className="py-16 md:py-20 border-t border-border/40"
        >
          <div className="flex items-center gap-3 mb-6 text-primary">
            <Map className="w-6 h-6" />
            <p className="text-sm tracking-[0.25em] uppercase">Interpretación real</p>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">
            Combiná tus datos con una interpretación <span className="text-gradient-gold italic">real</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
            Tu carta natal es un mapa personal de tus patrones, tus ciclos y los retos a los que te enfrentás.
          </p>
          <p className="text-foreground text-base md:text-lg leading-relaxed font-medium">
            Pero un mapa por sí solo no basta. Lo que importa es cómo se interpreta.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65 }}
          className="py-16 md:py-24 text-center border-t border-border/40"
        >
          <h2 className="font-serif text-3xl md:text-5xl font-light mb-8 leading-tight">
            Dejá de leer tu carta.{" "}
            <span className="text-gradient-gold italic">Empezá a entenderla.</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Una plataforma de astrología personal que conecta tu carta con tu vida real para que puedas ver qué está
            pasando, por qué está pasando y qué hacer a continuación.
          </p>
          <Link
            to="/register"
            className="inline-flex px-10 py-4 rounded-full shimmer-gold text-primary-foreground font-medium tracking-wide hover:opacity-90 transition-opacity"
          >
            Crea tu portal gratuito
          </Link>
        </motion.section>
      </div>
    </div>
  );
};

export default About;
