import { Outlet, Navigate, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import { useAuth } from "@/contexts/AuthContext";
import { usePortalNotifications } from "@/contexts/PortalNotificationsContext";
import { PortalNotificationsProvider } from "@/contexts/PortalNotificationsContext";
import { PortalExtrasCartProvider, usePortalExtrasCart } from "@/contexts/PortalExtrasCartContext";
import {
  LayoutDashboard,
  FileText,
  MessageCircle,
  HelpCircle,
  Package,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  LogOut,
  Menu,
  Bell,
  User,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import ThemeToggle from "@/components/landing/ThemeToggle";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const navItems = [
  { to: "/portal", icon: LayoutDashboard, label: "Panel", end: true },
  { to: "/portal/reports", icon: FileText, label: "Reportes" },
  { to: "/portal/messages", icon: MessageCircle, label: "Mensajes" },
  { to: "/portal/questions", icon: HelpCircle, label: "Preguntas" },
  { to: "/portal/extra-services", icon: Package, label: "Servicios extras" },
];

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/portal": { title: "Mi Panel", subtitle: "Resumen de tu actividad y reportes" },
  "/portal/reports": { title: "Mis Reportes", subtitle: "Consulta tus reportes astrológicos" },
  "/portal/reports/birth-chart": { title: "Carta Natal", subtitle: "Tu mapa astral de nacimiento" },
  "/portal/reports/solar-return": { title: "Revolución Solar", subtitle: "Tu pronóstico anual" },
  "/portal/reports/numerology": { title: "Numerología", subtitle: "Tu análisis numerológico personal" },
  "/portal/messages": { title: "Mensajes", subtitle: "Mensajes de tu astróloga" },
  "/portal/questions": { title: "Mis Preguntas", subtitle: "Consultas realizadas y respuestas" },
  "/portal/extra-services": { title: "Servicios extras", subtitle: "Consultas y sesiones con precios orientativos (USD y ARS)" },
  "/portal/subscription": { title: "Mi Suscripción", subtitle: "Gestiona tu plan y facturación" },
  "/portal/account": { title: "Mi Cuenta", subtitle: "Configuración de tu perfil" },
  "/portal/notifications": { title: "Notificaciones", subtitle: "Todas tus notificaciones" },
  "/portal/orders": { title: "Mis pedidos", subtitle: "Historial de compras y pagos" },
};

function formatNotificationTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffM < 60) return diffM <= 1 ? "Hace un momento" : `Hace ${diffM} min`;
  if (diffH < 24) return diffH === 1 ? "Hace 1h" : `Hace ${diffH}h`;
  if (diffD < 7) return diffD === 1 ? "Hace 1d" : `Hace ${diffD}d`;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

const PortalLayoutContent = () => {
  const { user, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "light" ? "/3SIN%20FONDO/logosolofinal.png" : "/3SIN%20FONDO/logoblanco.png";
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { notifications } = usePortalNotifications();
  const { itemCount: extrasCartCount } = usePortalExtrasCart();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const currentPath = location.pathname;
  const meta = pageMeta[currentPath] || { title: "Portal", subtitle: "Tu espacio personal" };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const previewNotifications = notifications.slice(0, 5);

  const NotificationPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 min-w-[20px] min-h-[20px] h-2 px-1 flex items-center justify-center bg-destructive text-[10px] text-destructive-foreground font-medium rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0 bg-card/95 backdrop-blur-xl border-border/50 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/30">
          <h3 className="font-semibold text-foreground text-sm">Notificaciones</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{unreadCount} sin leer</p>
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-border/20">
          {previewNotifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">No hay notificaciones</div>
          ) : (
            previewNotifications.map((notif) => (
              <div key={notif.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-accent/30 transition-colors cursor-pointer ${!notif.read ? "bg-primary/5" : ""}`}>
                <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${!notif.read ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{notif.body || ""}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{formatNotificationTime(notif.createdAt)}</p>
                </div>
                {!notif.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
              </div>
            ))
          )}
        </div>
        <div className="px-4 py-2.5 border-t border-border/30 text-center">
          <button onClick={() => navigate("/portal/notifications")} className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">Ver todas las notificaciones</button>
        </div>
      </PopoverContent>
    </Popover>
  );

  const UserPopover = () => (
    <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-3 pl-4 border-l border-border/30 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground">
              {user?.role === "admin" ? "Administrador" : "Suscriptor"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-semibold overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user?.name || "Usuario"} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || "U"
            )}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-0 bg-card/95 backdrop-blur-xl border-border/50">
        <div className="p-4 border-b border-border/30">
          <p className="text-sm font-semibold text-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
        </div>
        <div className="p-2">
          <button
            type="button"
            onClick={() => {
              navigate("/portal/account");
              setUserMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <User className="w-4 h-4" />
            Mi Cuenta
          </button>
          <button
            type="button"
            onClick={() => {
              navigate("/portal/subscription");
              setUserMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Suscripción
          </button>
          <button
            type="button"
            onClick={() => {
              navigate("/portal/orders");
              setUserMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Mis pedidos
          </button>
        </div>
        <div className="p-2 border-t border-border/30">
          <button
            type="button"
            onClick={() => {
              void handleLogout();
              setUserMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="min-h-screen bg-gradient-dark flex">
      <div className="fixed inset-0 bg-noise pointer-events-none z-0" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-card/80 backdrop-blur-xl border-r border-border/50 z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="h-[73px] flex flex-col justify-center px-6 border-b border-border/30">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded">
            <img src={logoSrc} alt="Astar" className="h-8 w-auto" />
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Portal del Cliente</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-dashed border-border/50"
            >
              <Shield className="w-4 h-4" />
              Panel administración
            </Link>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 relative z-10">
        {/* Mobile header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <img src={logoSrc} alt="Astar" className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <NotificationPopover />
            <Link
              to="/portal/orders"
              className="relative p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              aria-label={
                extrasCartCount > 0
                  ? `Mis pedidos, ${extrasCartCount} en el carrito`
                  : "Mis pedidos"
              }
            >
              <ShoppingCart className="w-5 h-5" />
              {extrasCartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[20px] min-h-[20px] px-1 flex items-center justify-center bg-primary text-[10px] text-primary-foreground font-medium rounded-full">
                  {extrasCartCount > 99 ? "99+" : extrasCartCount}
                </span>
              )}
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Desktop header with dynamic title */}
        <header className="hidden lg:flex fixed top-0 left-64 right-0 z-30 items-center justify-between h-[73px] px-10 bg-background/60 backdrop-blur-xl border-b border-border/20">
          <div>
            <h1 className="font-serif text-lg text-foreground font-semibold leading-tight">{meta.title}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{meta.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationPopover />
            <Link
              to="/portal/orders"
              className="relative p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              aria-label={
                extrasCartCount > 0
                  ? `Mis pedidos, ${extrasCartCount} en el carrito`
                  : "Mis pedidos"
              }
            >
              <ShoppingCart className="w-5 h-5" />
              {extrasCartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[20px] min-h-[20px] px-1 flex items-center justify-center bg-primary text-[10px] text-primary-foreground font-medium rounded-full">
                  {extrasCartCount > 99 ? "99+" : extrasCartCount}
                </span>
              )}
            </Link>
            <ThemeToggle />
            <UserPopover />
          </div>
        </header>

        <div className="mt-[73px] p-6 md:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const PortalLayout = () => {
  const { user, isAuthenticated, authLoading, hasActiveSubscription, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useIdleLogout({
    enabled: !authLoading && isAuthenticated && Boolean(user),
    ms: 10 * 60 * 1000,
    onIdle: async () => {
      await logout();
      navigate("/", { replace: true });
    },
  });

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowedWithoutSubscription =
    location.pathname === "/portal/subscription" ||
    location.pathname === "/portal/extra-services" ||
    location.pathname === "/portal/orders";
  const adminBypassSubscription = user?.role === "admin";
  if (!hasActiveSubscription && !allowedWithoutSubscription && !adminBypassSubscription) {
    return <Navigate to="/portal/subscription" replace />;
  }

  return (
    <PortalNotificationsProvider>
      <PortalExtrasCartProvider>
        <PortalLayoutContent />
      </PortalExtrasCartProvider>
    </PortalNotificationsProvider>
  );
};

export default PortalLayout;
