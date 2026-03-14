import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import Starfield from "@/components/landing/Starfield";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, isAdmin, authLoading } = useAuth();
  const { resolvedTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authLoading && isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/portal"} replace />;
  }

  const logoSrc = resolvedTheme === "light" ? "/3SIN%20FONDO/logosolofinal.png" : "/3SIN%20FONDO/logoblanco.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        if (result.role === "admin") {
          await logout();
          setError("Para acceder al panel de administración, usa la página de inicio de sesión de administrador.");
          return;
        }
        navigate("/portal");
      } else {
        const errMsg = "errorMessage" in result ? result.errorMessage : undefined;
        const msg =
          "errorCode" in result && result.errorCode === "auth/backend-removed"
            ? "El inicio de sesión no está disponible (backend desactivado)."
            : errMsg && (errMsg.toLowerCase().includes("inactive") || errMsg.toLowerCase().includes("inactiva"))
              ? "Tu cuenta está inactiva. No puedes iniciar sesión. Contacta al administrador."
              : "Credenciales inválidas. Verifica tu email y contraseña.";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-dark overflow-hidden">
      <div className="fixed inset-0 bg-noise pointer-events-none z-0" />
      <Starfield />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-6"
      >
        <div className="glass-card rounded-2xl p-10 premium-shadow-lg border border-border/50">
          <div className="text-center mb-10">
            <Link to="/" className="inline-block mb-3 hover:opacity-90 transition-opacity rounded">
              <img src={logoSrc} alt="Astar" className="h-12 w-auto mx-auto" />
            </Link>
            <h1 className="font-serif text-3xl tracking-[0.2em] text-gradient-gold font-semibold mb-2 sr-only">ASTAR</h1>
            <p className="text-sm text-muted-foreground">Bienvenido de vuelta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-sm text-destructive text-center">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }} className="w-full py-3.5 rounded-xl shimmer-gold text-primary-foreground font-medium tracking-wide text-sm hover:opacity-90 transition-opacity glow-gold disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? "Iniciando sesión…" : "Iniciar Sesión"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-primary hover:text-primary/80 transition-colors font-medium">Regístrate</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
