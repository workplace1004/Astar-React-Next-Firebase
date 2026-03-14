import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useTheme } from "next-themes";
import Starfield from "@/components/landing/Starfield";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin, authLoading, profileLoaded } = useAuth();
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authLoading && isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  if (!authLoading && isAuthenticated && !isAdmin && profileLoaded) {
    return <Navigate to="/portal" replace />;
  }

  const logoSrc = resolvedTheme === "light" ? "/3SIN%20FONDO/logosolofinal.png" : "/3SIN%20FONDO/logoblanco.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        const errCode = "errorCode" in result ? result.errorCode : undefined;
        const errMsg = "errorMessage" in result ? result.errorMessage : undefined;
        if (import.meta.env.DEV && (errCode || errMsg)) {
          console.error("[Admin login]", errCode, errMsg);
        }
        const isBackendRemoved = errCode === "auth/backend-removed";
        const isNetworkError = errCode === "auth/network-request-failed";
        const isOffline = errCode === "firestore-offline";
        const isProfileError = errCode === "profile-load-failed";
        const isAccountInactive = errMsg && (errMsg.toLowerCase().includes("inactive") || errMsg.toLowerCase().includes("inactiva"));
        if (isBackendRemoved) {
          setError("El inicio de sesión no está disponible (backend desactivado).");
        } else if (isAccountInactive) {
          setError("Tu cuenta está inactiva. No puedes iniciar sesión. Contacta al administrador.");
        } else if (isNetworkError) {
          setError("No hay conexión (internet o DNS). Comprueba tu conexión o prueba otra red.");
        } else if (isOffline) {
          setError("Sin conexión con el servidor. Comprueba tu internet.");
        } else if (isProfileError) {
          setError("Error al cargar el perfil. Revisa la consola del navegador.");
        } else {
          const hint = errCode ? ` (${errCode})` : "";
          setError(`Credenciales incorrectas. Revisa el email y la contraseña.${hint}`);
        }
      } else if (result.role !== "admin") {
        setError("Acceso denegado. Solo administradores.");
      } else {
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-dark overflow-hidden">
      <div className="fixed inset-0 bg-noise pointer-events-none z-0" />
      <Starfield />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md mx-6">
        <div className="glass-card rounded-2xl p-10 premium-shadow-lg border border-border/50">
          <div className="text-center mb-10">
            <Link to="/" className="inline-block mb-3 hover:opacity-90 transition-opacity rounded">
              <img src={logoSrc} alt="Astar" className="h-12 w-auto mx-auto" />
            </Link>
            <h1 className="font-serif text-2xl text-foreground mb-1">Panel de administración</h1>
            <p className="text-sm text-muted-foreground">Acceso restringido</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-sm text-destructive text-center">{error}</div>}
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@email.com" className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm" required />
              </div>
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-destructive text-destructive-foreground font-medium tracking-wide text-sm hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? "Accediendo…" : "Acceder"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
