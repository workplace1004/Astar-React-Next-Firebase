import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { portalGetReportByType } from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { buildPortalInterpretation } from "@/lib/interpretations";

const SIGNS_ES = [
  "Aries",
  "Tauro",
  "Géminis",
  "Cáncer",
  "Leo",
  "Virgo",
  "Libra",
  "Escorpio",
  "Sagitario",
  "Capricornio",
  "Acuario",
  "Piscis",
] as const;
const ZODIAC_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

function glyphForSpanishSign(sign: string): string {
  const i = SIGNS_ES.indexOf(sign as (typeof SIGNS_ES)[number]);
  return i >= 0 ? ZODIAC_GLYPHS[i] : "✶";
}

type SolarReturnSnapshot = {
  sun: { sign: string; degree: number | null } | null;
  moon: { sign: string; degree: number | null } | null;
  ascendant: { sign: string; degree: number | null } | null;
};

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

  const chartVisual = useMemo(() => {
    if (!report?.content) return { kind: "placeholder" as const };
    try {
      const parsed = JSON.parse(report.content) as {
        provider?: string;
        chartUrl?: string | null;
        solarReturnChart?: SolarReturnSnapshot | null;
      };
      if (parsed?.provider !== "astroapi") return { kind: "placeholder" as const };
      const url = typeof parsed.chartUrl === "string" ? parsed.chartUrl.trim() : "";
      if (url) return { kind: "url" as const, url };
      const snap = parsed.solarReturnChart;
      if (snap && (snap.sun || snap.moon || snap.ascendant)) {
        return { kind: "snapshot" as const, snap };
      }
      return { kind: "placeholder" as const };
    } catch {
      return { kind: "placeholder" as const };
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
        <EmptyState icon={Sparkles} message="No hay revolución solar." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/portal/reports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Volver a reportes
      </Link>


      {/* Chart / posiciones de revolución solar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6 md:p-10 premium-shadow mb-8 flex flex-col items-center justify-center gap-6"
      >
        {chartVisual.kind === "url" ? (
          <img src={chartVisual.url} alt="Revolución solar" className="max-w-full h-auto max-h-[min(85vh,720px)] object-contain" />
        ) : chartVisual.kind === "snapshot" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            {(
              [
                { label: "Sol (RS)", body: chartVisual.snap.sun },
                { label: "Luna (RS)", body: chartVisual.snap.moon },
                { label: "Ascendente (RS)", body: chartVisual.snap.ascendant },
              ] as const
            ).map((row) => (
              <div
                key={row.label}
                className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-5 text-center flex flex-col items-center gap-2"
              >
                <p className="text-xs tracking-widest uppercase text-primary">{row.label}</p>
                {row.body ? (
                  <>
                    <span className="font-serif text-3xl text-foreground" aria-hidden>
                      {glyphForSpanishSign(row.body.sign)}
                    </span>
                    <p className="font-serif text-lg text-foreground">{row.body.sign}</p>
                    {row.body.degree != null && (
                      <p className="text-xs text-muted-foreground">{row.body.degree.toFixed(1)}° en signo</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-64 h-64 rounded-full border-2 border-primary/30 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border border-border/50 flex items-center justify-center">
              <span className="font-serif text-2xl text-primary">RS ♋</span>
            </div>
          </div>
        )}
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
