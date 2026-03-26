import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import LandingSubscribeSectionLink from "@/components/landing/LandingSubscribeSectionLink";
import { ArrowLeft, Calendar, User } from "lucide-react";

const mockArticles: Record<string, { title: string; date: string; author: string; content: string[] }> = {
  "los-ciclos-de-saturno": {
    title: "Los Ciclos de Saturno y Tu Maduración Personal",
    date: "2026-03-01",
    author: "Astar",
    content: [
      "Saturno, el gran maestro del zodíaco, completa su órbita alrededor del Sol cada 29.5 años aproximadamente. Este ciclo marca uno de los tránsitos más significativos en la vida de cualquier persona.",
      "El primer retorno de Saturno, entre los 27 y 30 años, suele traer una crisis existencial que en realidad es una invitación a madurar. Es cuando la vida nos pide que dejemos de ser quienes creíamos que debíamos ser y empecemos a construir quienes realmente somos.",
      "Durante este tránsito, es común experimentar cambios de carrera, rupturas sentimentales, mudanzas o una profunda reevaluación de nuestras metas. No es castigo: es recalibración.",
      "El segundo retorno de Saturno, alrededor de los 58-60 años, trae una segunda oleada de reestructuración. Aquí la pregunta ya no es '¿quién soy?' sino '¿qué legado dejo?'.",
      "Comprender tu Saturno natal — su signo, casa y aspectos — te permite anticipar las áreas de tu vida donde este maestro exigirá disciplina, responsabilidad y autenticidad.",
    ],
  },
};

const defaultArticle = {
  title: "Artículo del blog",
  date: "2026-03-01",
  author: "Astar",
  content: [
    "Este es un artículo de ejemplo. El contenido completo estará disponible próximamente.",
    "Mientras tanto, explora nuestros otros artículos y descubre el poder del simbolismo astrológico.",
  ],
};

const BlogArticle = () => {
  const { slug } = useParams();
  const article = (slug && mockArticles[slug]) || defaultArticle;

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Volver al blog
        </Link>

        <motion.article initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-6">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-12">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{article.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(article.date).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
            {article.content.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </motion.article>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-20 glass-card rounded-2xl p-10 text-center premium-shadow">
          <h3 className="font-serif text-2xl text-foreground mb-3">¿Quieres profundizar?</h3>
          <p className="text-muted-foreground mb-6">Suscríbete a Astar y recibe tu lectura personalizada cada mes.</p>
          <LandingSubscribeSectionLink className="inline-block px-8 py-3 rounded-xl shimmer-gold text-primary-foreground font-medium text-sm tracking-wide">
            Suscribirme
          </LandingSubscribeSectionLink>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogArticle;
