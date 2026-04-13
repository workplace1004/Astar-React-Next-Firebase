import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, MapPin, Loader2, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { portalGetReportByType, portalGetProfile } from "@/lib/api";
import { format, parse } from "date-fns";
import EmptyState from "@/components/EmptyState";
import { buildPortalInterpretation } from "@/lib/interpretations";

const BirthChart = () => {
  const [report, setReport] = useState<{ id: string; type: string; title: string; content: string | null } | null>(null);
  const [profile, setProfile] = useState<{ birthDate: string | null; birthPlace: string | null; birthTime: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([portalGetReportByType("birth_chart"), portalGetProfile()]).then(([r, p]) => {
      setReport(r ?? null);
      setProfile(p ?? null);
      setLoading(false);
    });
  }, []);

  const interpretation = useMemo(
    () =>
      buildPortalInterpretation(report, {
        reportType: "birth_chart",
        defaultSectionTitle: "Interpretación",
      }),
    [report],
  );
  const sections = interpretation.sections;

  const chartUrlFromReport = useMemo(() => {
    if (!report?.content) return null;
    try {
      const parsed = JSON.parse(report.content) as { provider?: string; chartUrl?: string };
      if (parsed?.provider !== "astroapi" || typeof parsed.chartUrl !== "string" || !parsed.chartUrl.trim()) {
        return null;
      }
      return parsed.chartUrl.trim();
    } catch {
      return null;
    }
  }, [report?.content]);

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
        <EmptyState icon={Sun} message="No hay carta natal." />
        
      </div>
    );
  }

  const birthDateFormatted = profile?.birthDate ? (() => { try { return format(parse(profile.birthDate, "yyyy-MM-dd", new Date()), "d 'de' MMMM, yyyy"); } catch { return profile.birthDate; } })() : "—";
  const birthTimeFormatted = profile?.birthTime ? `${profile.birthTime} hs` : "—";
  const birthPlaceFormatted = profile?.birthPlace || "—";

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/portal/reports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Volver a reportes
      </Link>


      {/* Chart visualization */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6 md:p-10 premium-shadow mb-8 flex items-center justify-center overflow-hidden">
        {chartUrlFromReport ? (
          <img
            src={chartUrlFromReport}
            alt="Carta natal"
            className="max-w-full h-auto max-h-[min(85vh,720px)] object-contain"
          />
        ) : (
          <div className="w-64 h-64 rounded-full border-2 border-primary/30 flex items-center justify-center relative">
            <div className="w-48 h-48 rounded-full border border-border/50 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-border/30 flex items-center justify-center">
                <span className="font-serif text-2xl text-primary">☉ ♏</span>
              </div>
            </div>
            {["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((s, i) => (
              <span key={i} className="absolute text-xs text-muted-foreground" style={{ transform: `rotate(${i * 30}deg) translateY(-140px) rotate(-${i * 30}deg)` }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Birth info cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Calendar, label: "Fecha de Nacimiento", value: birthDateFormatted },
          { icon: Clock, label: "Hora de Nacimiento", value: birthTimeFormatted },
          { icon: MapPin, label: "Lugar de Nacimiento", value: birthPlaceFormatted },
        ].map((info) => (
          <div key={info.label} className="glass-card rounded-xl p-4 premium-shadow flex items-center gap-3">
            <info.icon className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{info.label}</p>
              <p className="text-sm text-foreground font-medium">{info.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Interpretation */}
      {sections.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6 premium-shadow">
          <h3 className="font-serif text-xl text-foreground mb-4">Interpretación</h3>
          <div className="space-y-4 font-sans">
            {sections.map((s) => (
              <div key={s.id} className="border-b border-border/30 last:border-0 pb-4 last:pb-0">
                <p className="font-sans text-foreground mb-2 tabular-nums">{s.title}</p>
                <p className="font-sans text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap tabular-nums">{s.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BirthChart;
