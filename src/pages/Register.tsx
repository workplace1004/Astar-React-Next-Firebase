import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, MapPin, Clock, Calendar as CalendarIcon, CalendarDays, ArrowLeft } from "lucide-react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import Starfield from "@/components/landing/Starfield";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TimePicker from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isAdmin, authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", birthDate: "", birthPlace: "", birthTime: "" });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { resolvedTheme } = useTheme();

  if (!authLoading && isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/portal"} replace />;
  }

  const logoSrc = resolvedTheme === "light" ? "/3SIN%20FONDO/logosolofinal.png" : "/3SIN%20FONDO/logoblanco.png";
  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const REGISTER_TIMEOUT_MS = 20_000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const timeoutPromise = new Promise<{ ok: false; error: string }>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), REGISTER_TIMEOUT_MS)
      );
      const result = await Promise.race([register(form), timeoutPromise]);
      if ("error" in result) {
        setError(result.error);
      } else {
        navigate("/portal");
      }
    } catch (err) {
      const message = err instanceof Error && err.message === "timeout"
        ? "La solicitud tardó demasiado. Comprueba tu conexión e inténtalo de nuevo."
        : "No se pudo crear la cuenta. Comprueba tu conexión e inténtalo de nuevo.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-dark overflow-hidden py-10">
      <div className="fixed inset-0 bg-noise pointer-events-none z-0" />
      <Starfield />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md mx-6"
      >
        <div className="glass-card rounded-2xl p-10 premium-shadow-lg border border-border/50">
          <div className="text-center mb-10">
            <Link to="/" className="inline-block mb-3 hover:opacity-90 transition-opacity rounded">
              <img src={logoSrc} alt="Astar" className="h-12 w-auto mx-auto" />
            </Link>
            <h1 className="font-serif text-3xl tracking-[0.2em] text-gradient-gold font-semibold mb-2 sr-only">ASTAR</h1>
            <p className="text-sm text-muted-foreground">Crea tu cuenta</p>

          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-sm text-destructive text-center">
                {error}
              </div>
            )}
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Tu nombre" required className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="tu@email.com" required className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" required minLength={6} className="w-full pl-11 pr-12 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Fecha de nacimiento</label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "relative w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-sm text-left flex items-center justify-between transition-colors focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
                        form.birthDate ? "text-foreground" : "text-muted-foreground/70"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                        {form.birthDate
                          ? format(parse(form.birthDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy", { locale: es })
                          : "dd/mm/aaaa"}
                      </span>
                      <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-border/50 bg-card/95 backdrop-blur-xl rounded-xl" align="start">
                    <Calendar
                      mode="single"
                      selected={form.birthDate ? parse(form.birthDate, "yyyy-MM-dd", new Date()) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          update("birthDate", format(date, "yyyy-MM-dd"));
                          setDatePickerOpen(false);
                        }
                      }}
                      defaultMonth={form.birthDate ? parse(form.birthDate, "yyyy-MM-dd", new Date()) : new Date(1990, 0, 1)}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Hora de nacimiento</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 z-10 pointer-events-none" />
                  <TimePicker
                    value={form.birthTime || "00:00"}
                    onChange={(v) => update("birthTime", v)}
                    className="w-full pl-11 text-foreground"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Lugar de nacimiento</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input type="text" value={form.birthPlace} onChange={(e) => update("birthPlace", e.target.value)} placeholder="Ciudad, País" required className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm" />
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }} className="w-full py-3.5 rounded-xl shimmer-gold text-primary-foreground font-medium tracking-wide text-sm hover:opacity-90 transition-opacity glow-gold disabled:opacity-70 disabled:cursor-not-allowed mt-2">
              {loading ? "Creando cuenta…" : "Crear Cuenta"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">Inicia sesión</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
