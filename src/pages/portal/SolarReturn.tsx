import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { portalGetReportByType } from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { buildPortalInterpretation } from "@/lib/interpretations";

const SolarReturn = () => {
  const [report, setReport] = useState<{ id: string; type: string; title: string; content: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalGetReportByType("solar_return").then((r) => {
      setReport(r ?? null);
      setLoading(false);
    });
  }, []);

  const interpretation = useMemo(
    () =>
      buildPortalInterpretation(report, {
        reportType: "solar_return",
        defaultSectionTitle: "Interpretación",
      }),
    [report],
  );
  const sections = interpretation.sections;
  const theme = {
    title: interpretation.theme?.title || report?.title || "",
    subtitle: interpretation.theme?.subtitle || "",
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-6xl mx-auto">
        <Link to="/portal/reports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver a reportes
        </Link>
        <EmptyState icon={Sparkles} message="No hay revolución solar." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/portal/reports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Volver a reportes
      </Link>


      {/* Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-10 premium-shadow mb-8 flex items-center justify-center">
        <div className="w-64 h-64 rounded-full border-2 border-primary/30 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border border-border/50 flex items-center justify-center">
            <span className="font-serif text-2xl text-primary">RS ♋</span>
          </div>
        </div>
      </motion.div>

      {(theme.title || theme.subtitle) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-2xl p-8 premium-shadow border border-primary/20 mb-8 text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-xs tracking-widest uppercase text-primary mb-2">Tema del Año</p>
          <h2 className="font-serif text-2xl text-foreground">{theme.title || "Revolución Solar"}</h2>
          {theme.subtitle && <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm">{theme.subtitle}</p>}
        </motion.div>
      )}

      {sections.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6 premium-shadow">
          <h3 className="font-serif text-xl text-foreground mb-4">Interpretación por Áreas</h3>
          {interpretation.usedVendorFallback && (
            <p className="text-xs text-muted-foreground mb-4">
              Se muestra la versión base del proveedor porque no se pudo componer texto Astar para este reporte.
            </p>
          )}
          <div className="space-y-4">
            {sections.map((s) => (
              <div key={s.id} className="border-b border-border/30 last:border-0 pb-4 last:pb-0">
                <p className="font-serif text-foreground mb-2">{s.title}</p>
                <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">{s.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SolarReturn;
