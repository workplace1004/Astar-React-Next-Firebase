import { motion } from "framer-motion";
import ExtraServicesLandingSection from "@/components/landing/ExtraServicesLandingSection";

const ServiciosExtras = () => {
  return (
    <div className="pt-16 md:pt-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="text-center mb-14 md:mb-16"
        >
          <h1 className="font-serif text-4xl md:text-6xl text-gradient-gold font-semibold mb-6">Servicios extras</h1>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-foreground mb-6 leading-tight">
            Consultas y sesiones <span className="text-gradient-gold italic">con Carlos</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Además del portal, podés sumar lecturas en vivo, informes escritos y audios personalizados. Los precios en
            USD son orientativos; con suscripción activa aplican valores reducidos en el portal.
          </p>
        </motion.div>
      </div>

      <ExtraServicesLandingSection omitHeader />
    </div>
  );
};

export default ServiciosExtras;
