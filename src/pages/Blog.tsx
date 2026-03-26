import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

const mockPosts = [
  { slug: "los-ciclos-de-saturno", title: "Los Ciclos de Saturno y Tu Maduración Personal", excerpt: "Saturno regresa a su posición natal cada 29 años. Descubre qué significa este tránsito crucial y cómo prepararte.", date: "2026-03-01", author: "Astar" },
  { slug: "venus-retrogrado-2026", title: "Venus Retrógrado 2026: Revisando el Amor y los Valores", excerpt: "Cuando Venus retrograda, nos invita a reconsiderar nuestras relaciones, placeres y prioridades financieras.", date: "2026-02-15", author: "Astar" },
  { slug: "numerologia-ano-personal", title: "Tu Año Personal en Numerología: Guía Completa", excerpt: "Cada año trae una vibración numérica específica. Aprende a calcular tu año personal y aprovéchalo al máximo.", date: "2026-02-01", author: "Astar" },
  { slug: "luna-nueva-rituales", title: "Luna Nueva: Rituales de Intención y Siembra", excerpt: "La Luna Nueva es el momento ideal para plantar semillas de intención. Te compartimos prácticas simples pero poderosas.", date: "2026-01-20", author: "Astar" },
  { slug: "casas-astrologicas", title: "Las 12 Casas Astrológicas: Tu Mapa de Vida", excerpt: "Cada casa representa un área de tu experiencia. Desde la identidad hasta la espiritualidad, explóralas todas.", date: "2026-01-05", author: "Astar" },
];

const Blog = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="font-serif text-5xl md:text-6xl h-[65px] text-gradient-gold font-semibold mb-4 text-center">Perspectivas</h1>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Noticias, blogs y anuncios: reflexiones, guías y lectura simbólica.
          </p>
        </motion.div>

        <div className="space-y-6">
          {mockPosts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/blog/${post.slug}`} className="block glass-card rounded-2xl p-8 premium-shadow hover-lift">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.date).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
                  <span className="mx-2">·</span>
                  {post.author}
                </div>
                <h2 className="font-sans text-2xl text-foreground mb-3 hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
