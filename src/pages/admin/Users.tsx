import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminGetUsers, type AdminUserListItem } from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { getPaginationItems } from "@/lib/pagination";

const ITEMS_PER_PAGE = 10;

const statusLabel: Record<string, string> = {
  active: "Activa",
  inactive: "Inactiva",
  cancelled: "Cancelada",
};

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<{ data: AdminUserListItem[]; total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminGetUsers({ page: currentPage, limit: ITEMS_PER_PAGE, search: debouncedSearch || undefined })
      .then((res) => {
        if (!cancelled) {
          setData({ data: res.data, total: res.total, totalPages: res.totalPages });
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error al cargar usuarios");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentPage, debouncedSearch]);

  const goToPage = (page: number) => {
    if (data && page >= 1 && page <= data.totalPages) setCurrentPage(page);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm"
        />
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl premium-shadow overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-4 text-muted-foreground font-normal">Nombre</th>
                  <th className="text-left p-4 text-muted-foreground font-normal">Email</th>
                  <th className="text-left p-4 text-muted-foreground font-normal">Estado cuenta</th>
                  <th className="text-left p-4 text-muted-foreground font-normal">Registro</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((u) => (
                  <tr key={u.id} className="border-b border-border/20 hover:bg-accent/30 transition-colors">
                    <td className="p-4 text-foreground font-medium">{u.name}</td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          u.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {u.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(u.createdAt)}</td>
                    <td className="p-4">
                      <Link to={`/admin/users/${u.id}`} className="text-primary text-xs hover:text-primary/80">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
                {data && data.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <EmptyState icon={Users} message="No hay usuarios." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </motion.div>

      {data && data.totalPages > 1 && !loading && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-muted-foreground">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, data.total)} de {data.total} usuarios
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {getPaginationItems(data.totalPages, currentPage).map((item, i) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => goToPage(item)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                    item === currentPage
                      ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {item}
                </button>
              )
            )}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === data.totalPages}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
