import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, ArrowUpCircle, Loader2, CalendarDays, MapPin } from "lucide-react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import TimePicker from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import { apiBirthChartPreview, type BirthChartPreviewResult } from "@/lib/api";

interface CitySuggestion {
  id: string;
  label: string;
  lat: number;
  lon: number;
  timezone?: string;
}

const BirthChartPreview = () => {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [email, setEmail] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [cityOpen, setCityOpen] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);
  const [result, setResult] = useState<BirthChartPreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = cityInput.trim();
    if (q.length < 2) {
      setCitySuggestions([]);
      setCityLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setCityLoading(true);
        const params = new URLSearchParams({
          name: q,
          count: "8",
          language: "es",
          format: "json",
        });
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray((data as { results?: unknown[] }).results)
          ? ((data as { results: Array<{ name?: string; admin1?: string; country?: string; latitude?: number; longitude?: number; timezone?: string }> }).results)
          : [];
        const mapped = list
          .filter((item) => typeof item.name === "string" && typeof item.country === "string" && typeof item.latitude === "number" && typeof item.longitude === "number")
          .map((item, index) => {
            const label = `${item.name}${item.admin1 ? `, ${item.admin1}` : ""}, ${item.country}`;
            const id = `${label}-${item.latitude ?? "na"}-${item.longitude ?? "na"}-${index}`;
            return {
              id,
              label,
              lat: item.latitude as number,
              lon: item.longitude as number,
              timezone: item.timezone,
            };
          });
        setCitySuggestions(mapped);
      } catch {
        setCitySuggestions([]);
      } finally {
        setCityLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [cityInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!birthDate.trim()) {
      setError("Indica tu fecha de nacimiento.");
      return;
    }
    if (!birthPlace.trim() || !selectedCity) {
      setError("Selecciona tu ciudad desde la lista de sugerencias.");
      return;
    }
    if (!email.trim()) {
      setError("Ingresa tu email.");
      return;
    }
    const birthTimeValue = birthTime.trim() || "12:00";
    if (!selectedCity.timezone) {
      setError("No se pudo obtener zona horaria de la ciudad. Elige otra ciudad sugerida.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiBirthChartPreview({
        birthDate: birthDate.trim(),
        birthTime: birthTimeValue,
        birthPlace: birthPlace.trim(),
        email: email.trim().toLowerCase(),
        lat: selectedCity.lat,
        lon: selectedCity.lon,
        timezone: selectedCity.timezone,
      });
      if (!data.chartUrl) {
        throw new Error("No se pudo generar el dibujo de la carta astral.");
      }
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
          className="max-w-3xl mx-auto mb-12"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-4">
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
                      birthDate ? "text-foreground" : "text-gray-400"
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
              <div className="relative">
                <input
                  id="birthPlace"
                  type="text"
                  placeholder="Buscar ciudad..."
                  value={cityInput}
                  onFocus={() => setCityOpen(true)}
                  onBlur={() => window.setTimeout(() => setCityOpen(false), 120)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCityInput(value);
                    setBirthPlace(value);
                    setSelectedCity(null);
                    setCityOpen(true);
                  }}
                  className="w-full px-4 py-3  rounded-xl placeholder:text-gray-400 bg-background/80 border border-border text-base text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                />
                <MapPin className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {cityOpen && (cityInput.trim().length >= 2 || citySuggestions.length > 0) && (
                  <div className="absolute z-40 mt-1 w-full rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-lg overflow-hidden">
                    {cityLoading ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Buscando ciudades...
                      </div>
                    ) : citySuggestions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">No hay ciudades para mostrar.</div>
                    ) : (
                      <ul className="max-h-56 overflow-y-auto py-1">
                        {citySuggestions.map((city) => (
                          <li key={city.id}>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setCityInput(city.label);
                                setBirthPlace(city.label);
                                setSelectedCity(city);
                                setCityOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors",
                                selectedCity?.id === city.id ? "bg-primary/15 text-foreground" : "text-muted-foreground"
                              )}
                            >
                              {city.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="previewEmail" className="block text-sm font-medium text-muted-foreground mb-1.5">
                Email
              </label>
              <input
                id="previewEmail"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl placeholder:text-gray-400 bg-background/80 border border-border text-base text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                autoComplete="email"
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

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="p-4 rounded-2xl glass-card border border-border/80 premium-shadow">
              <p className="text-sm uppercase tracking-widest text-primary mb-3">Generando tu carta astral...</p>
              <Skeleton className="w-full max-w-3xl h-[320px] md:h-[420px] mx-auto rounded-xl border border-border/40" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[0, 1, 2].map((index) => (
                <div
                  key={`skeleton-${index}`}
                  className="p-6 rounded-2xl glass-card border border-border/80 premium-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                  <Skeleton className="h-8 w-10 mb-3" />
                  <Skeleton className="h-5 w-24 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-[92%] mb-2" />
                  <Skeleton className="h-4 w-[84%]" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {!loading && result && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="p-4 rounded-2xl glass-card border border-border/80 premium-shadow"
            >
              <p className="text-sm uppercase tracking-widest text-primary mb-3">Dibujo de tu carta astral</p>
              <img
                src={result.chartUrl}
                alt="Dibujo de carta astral"
                className="w-full max-w-3xl mx-auto rounded-xl border border-border/40 bg-card"
                loading="lazy"
              />
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
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
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BirthChartPreview;
