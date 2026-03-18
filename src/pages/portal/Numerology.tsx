import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Hash } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { portalGetReportByType } from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { buildPortalInterpretation } from "@/lib/interpretations";

const Numerology = () => {
  const [report, setReport] = useState<{ id: string; type: string; title: string; content: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalGetReportByType("numerology").then((r) => {
      setReport(r ?? null);
      setLoading(false);
    });
  }, []);

  const interpretation = useMemo(
    () =>
      buildPortalInterpretation(report, {
        reportType: "numerology",
        defaultSectionTitle: "Interpretación",
      }),
    [report],
  );
  const interpretations = interpretation.sections;

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
        <EmptyState icon={Hash} message="No hay numerología." />
      </div>
    );
  }

  let numbers: { number: string; label: string; desc: string }[] = [];
  if (report.content) {
    try {
      const parsed = JSON.parse(report.content);
      if (parsed.numbers) numbers = parsed.numbers;
    } catch {
      numbers = [];
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/portal/reports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Volver a reportes
      </Link>

      {numbers.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {numbers.map((n, i) => (
            <motion.div key={n.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="glass-card rounded-2xl p-6 premium-shadow text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                <span className="font-sans text-3xl text-primary">{n.number}</span>
              </div>
              <p className="text-xs tracking-widest uppercase text-primary mb-1">{n.label}</p>
              <p className="text-muted-foreground text-xs">{n.desc}</p>
            </motion.div>
          ))}
        </div>
      )}

      {interpretations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card rounded-2xl p-6 premium-shadow">
          <h3 className="font-serif text-xl text-foreground mb-4">Interpretación Completa</h3>
          {interpretation.usedVendorFallback && (
            <p className="text-xs text-muted-foreground mb-4">
              Se muestra la versión base del proveedor porque no se pudo componer texto Astar para este reporte.
            </p>
          )}
          <div className="space-y-4">
            {interpretations.map((s) => (
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

export default Numerology;
