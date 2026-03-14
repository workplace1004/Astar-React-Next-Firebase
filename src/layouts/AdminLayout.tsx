import { Outlet, Navigate, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminNotifications } from "@/contexts/AdminNotificationsContext";
import { AdminNotificationsProvider } from "@/contexts/AdminNotificationsContext";
import { LayoutDashboard, Users, HelpCircle, Mail, FileText, BookOpen, Database, CreditCard, LogOut, Menu, Bell, Settings, User } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/components/landing/ThemeToggle";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "next-themes";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Panel", end: true },
  { to: "/admin/users", icon: Users, label: "Usuarios" },
  { to: "/admin/questions", icon: HelpCircle, label: "Preguntas" },
  { to: "/admin/monthly-messages", icon: Mail, label: "Mensajes Mensuales" },
  { to: "/admin/blog", icon: FileText, label: "Blog" },
  { to: "/admin/reports", icon: BookOpen, label: "Reportes" },
  { to: "/admin/knowledge-base", icon: Database, label: "Base de Conocimiento" },
  { to: "/admin/orders", icon: CreditCard, label: "Pedidos" },
];

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Panel Administrativo", subtitle: "Vista general del sistema Astar" },
  "/admin/users": { title: "Gestión de Usuarios", subtitle: "Lista de todos los usuarios registrados" },
  "/admin/questions": { title: "Gestión de Preguntas", subtitle: "Preguntas de los suscriptores" },
  "/admin/monthly-messages": { title: "Mensajes Mensuales", subtitle: "Envía mensajes personalizados a los suscriptores" },
  "/admin/blog": { title: "Gestión de Blog", subtitle: "Crea, edita y publica artículos" },
  "/admin/reports": { title: "Gestión de Reportes", subtitle: "Genera, edita y revisa reportes de usuarios" },
  "/admin/knowledge-base": { title: "Base de Conocimiento", subtitle: "Reglas de interpretación simbólica para la IA" },
  "/admin/orders": { title: "Pedidos y Pagos", subtitle: "Historial de todas las transacciones" },
  "/admin/notifications": { title: "Notificaciones", subtitle: "Todas las notificaciones del sistema" },
  "/admin/profile": { title: "Mi Perfil", subtitle: "Información de tu cuenta" },
};

const AdminLayoutContent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications } = useAdminNotifications();
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "light" ? "/3SIN%20FONDO/logosolofinal.png" : "/3SIN%20FONDO/logoblanco.png";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const currentPath = location.pathname;
  const meta = pageMeta[currentPath] || { title: "Admin", subtitle: "Panel de administración" };

  const unreadCount = notifications.filter((n) => n.unread).length;
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
      <PopoverContent align="end" className="w-80 p-0 bg-card/95 backdrop-blur-xl border-border/50">
        <div className="p-4 border-b border-border/30">
          <h3 className="font-semibold text-foreground text-sm">Notificaciones</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {unreadCount > 0 ? `${unreadCount} nueva${unreadCount !== 1 ? "s" : ""}` : "Sin notificaciones nuevas"}
          </p>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-4">
              <EmptyState icon={Bell} message="No hay notificaciones nuevas." className="py-6" />
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => navigate(n.link)}
                className={`w-full text-left px-4 py-3 border-b border-border/20 hover:bg-accent/30 transition-colors cursor-pointer ${n.unread ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {n.unread && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />}
                  <div className={n.unread ? "" : "ml-5"}>
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        <div className="p-3 border-t border-border/30">
          <button
            onClick={() => navigate("/admin/notifications")}
            className="w-full text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Ver todas las notificaciones
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );

  const UserPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-3 pl-4 border-l border-border/30 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
            {user?.name?.charAt(0) || "A"}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-0 bg-card/95 backdrop-blur-xl border-border/50">
        <div className="p-4 border-b border-border/30">
          <p className="text-sm font-semibold text-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
        </div>
        <div className="p-2">
          <button onClick={() => navigate("/admin/profile")} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
            <User className="w-4 h-4" />
            Mi Perfil
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
            <Settings className="w-4 h-4" />
            Configuración
          </button>
        </div>
        <div className="p-2 border-t border-border/30">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
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

      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-card/80 backdrop-blur-xl border-r border-border/50 z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="h-[73px] flex flex-col justify-center px-6 border-b border-border/30">
          <Link to="/admin" className="inline-block hover:opacity-90 transition-opacity rounded">
            <img src={logoSrc} alt="Astar" className="h-8 w-auto" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 lg:ml-64 relative z-10">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/3SIN%20FONDO/logosolofinal.png" alt="Astar" className="h-7 w-auto dark:hidden" />
            <img src="/3SIN%20FONDO/logoblanco.png" alt="Astar" className="h-7 w-auto hidden dark:block" />
            <span className="font-serif text-lg tracking-[0.15em] text-gradient-gold font-semibold">ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationPopover />
            <ThemeToggle />
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between h-[73px] px-10 bg-background/60 backdrop-blur-xl border-b border-border/20">
          <div>
            <h1 className="font-serif text-lg text-foreground font-semibold leading-tight">{meta.title}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{meta.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationPopover />
            <ThemeToggle />
            <UserPopover />
          </div>
        </header>

        <div className="p-6 md:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const { isAuthenticated, isAdmin, authLoading } = useAuth();

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminNotificationsProvider>
      <AdminLayoutContent />
    </AdminNotificationsProvider>
  );
};

export default AdminLayout;
