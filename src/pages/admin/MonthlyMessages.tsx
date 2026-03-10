import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Send, User, Mail, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { adminGetUsers, type AdminUserListItem } from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { getPaginationItems } from "@/lib/pagination";

const ITEMS_PER_PAGE = 8;

const AdminMonthlyMessages = () => {
  const [subscribers, setSubscribers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminGetUsers({ limit: 500, search: "" })
      .then((res) => {
        if (!cancelled) {
          setSubscribers(res.data.filter((u) => u.role === "client"));
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
  }, []);

  const filtered = subscribers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return iso;
    }
  };

  const handleSend = () => {
    if (message.trim()) setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 premium-shadow">
          <h3 className="font-serif text-lg text-foreground mb-4">Suscriptores (clientes)</h3>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {paginated.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelected(s.id);
                      setSent(false);
                      setMessage("");
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all text-sm ${
                      selected === s.id ? "bg-primary/10 border border-primary/20" : "hover:bg-accent/50"
                    }`}
                  >
                    <User className="w-4 h-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                      <p className="text-xs text-muted-foreground">Registro: {formatDate(s.createdAt)}</p>
                    </div>
                  </button>
                ))}
                {paginated.length === 0 && (
                  <EmptyState icon={Mail} message="No hay mensajes mensuales." className="py-8" />
                )}
              </div>

              {totalPages > 1 && filtered.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/20">
                  <p className="text-xs text-muted-foreground">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {getPaginationItems(totalPages, currentPage).map((item, i) =>
                      item === "ellipsis" ? (
                        <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-muted-foreground text-xs">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => goToPage(item)}
                          className={`w-7 h-7 rounded-lg text-xs transition-colors ${
                            item === currentPage ? "bg-primary/10 text-primary border border-primary/20 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6 premium-shadow">
          {selected ? (
            sent ? (
              <div className="text-center py-10">
                <Send className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-serif text-xl text-foreground mb-2">Mensaje Enviado</h3>
                <p className="text-sm text-muted-foreground">El envío real de mensajes se implementará con el backend de mensajería.</p>
              </div>
            ) : (
              <>
                <h3 className="font-serif text-lg text-foreground mb-4">Escribir Mensaje</h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={10}
                  placeholder="Escribe el mensaje mensual personalizado..."
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm resize-none mb-4"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="w-full py-3.5 rounded-xl shimmer-gold text-primary-foreground font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2 glow-gold"
                >
                  <Send className="w-4 h-4" /> Enviar Mensaje
                </button>
              </>
            )
          ) : (
            <EmptyState icon={Mail} message="Selecciona un suscriptor para escribir su mensaje." className="py-20" />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminMonthlyMessages;
