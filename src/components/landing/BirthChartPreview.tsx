import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, ArrowUpCircle, Loader2, CalendarDays } from "lucide-react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TimePicker from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import { apiBirthChartPreview, type BirthChartPreviewResult } from "@/lib/api";

const BirthChartPreview = () => {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [result, setResult] = useState<BirthChartPreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!birthDate.trim()) {
      setError("Indica tu fecha de nacimiento.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiBirthChartPreview({
        birthDate: birthDate.trim(),
        birthTime: birthTime.trim() || "12:00",
        birthPlace: birthPlace.trim() || "No indicado",
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo calcular tu carta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="preview-carta" className="relative py-24 px-6">
      <div className="absolute inset-0 section-glow pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">Preview de tu carta</p>
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Un vistazo a tu <span className="text-gradient-gold italic">Sol, Luna y Ascendente</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Ingresa tus datos de nacimiento y recibe una breve descripción de estos tres pilares de tu carta natal.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto mb-12"
        >
          <div className="grid sm:grid-cols-3 gap-10 mb-4">
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-muted-foreground mb-1.5">
                Fecha de nacimiento
              </label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    id="birthDate"
                    type="button"
                    className={cn(
                      "min-w-[150px] px-4 py-3 rounded-xl bg-background/80 border border-border text-base text-left flex items-center justify-between transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none",
                      birthDate ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                      {birthDate
                        ? format(parse(birthDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy", { locale: es })
                        : "dd/mm/aaaa"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-border/50 bg-card/95 backdrop-blur-xl rounded-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate ? parse(birthDate, "yyyy-MM-dd", new Date()) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setBirthDate(format(date, "yyyy-MM-dd"));
                        setDatePickerOpen(false);
                      }
                    }}
                    defaultMonth={birthDate ? parse(birthDate, "yyyy-MM-dd", new Date()) : new Date(1990, 0, 1)}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label htmlFor="birthTime" className="block text-sm font-medium text-muted-foreground mb-1.5">
                Hora (opcional)
              </label>
              <TimePicker
                value={birthTime || "12:00"}
                onChange={(v) => setBirthTime(v)}
                className="w-full bg-background/80 border-border text-foreground text-base"
              />
            </div>
            <div>
              <label htmlFor="birthPlace" className="block text-sm font-medium text-muted-foreground mb-1.5">
                Lugar de nacimiento
              </label>
              <input
                id="birthPlace"
                type="text"
                placeholder="Ciudad, país"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background/80 border border-border text-base text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive mb-4 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto sm:min-w-[200px] mt-20 px-6 py-3 rounded-full shimmer-gold text-primary-foreground font-medium tracking-wide hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculando…
              </>
            ) : (
              "Ver mi preview"
            )}
          </button>
        </motion.form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { key: "sun" as const, icon: Sun, title: "Sol" },
              { key: "moon" as const, icon: Moon, title: "Luna" },
              { key: "ascendant" as const, icon: ArrowUpCircle, title: "Ascendente" },
            ].map(({ key, icon: Icon, title }) => {
              const item = result[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="p-6 rounded-2xl glass-card border border-border/80 premium-shadow hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                    <h3 className="font-serif text-xl font-medium">{title}</h3>
                  </div>
                  <p className="text-2xl text-primary mb-2" aria-hidden>{item.symbol}</p>
                  <p className="font-medium text-foreground mb-3">{item.sign}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BirthChartPreview;
