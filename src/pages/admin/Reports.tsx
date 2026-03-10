import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { RefreshCw, Edit, Eye, X, Search, ChevronLeft, ChevronRight, BookOpen, Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { adminGetReports, type AdminReportItem } from "@/lib/api";
import { getPaginationItems } from "@/lib/pagination";

type ReportItem = { id: string; user: string; type: string; status: string; date: string; content: string };

const ITEMS_PER_PAGE = 10;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

const AdminReports = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"view" | "edit" | null>(null);
  const [selected, setSelected] = useState<ReportItem | null>(null);
  const [editContent, setEditContent] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    adminGetReports().then((data) => {
      setReports(
        data.map((r) => ({
          id: r.id,
          user: r.user,
          type: r.type,
          status: r.status,
          date: formatDate(r.date),
          content: r.content ?? "",
        }))
      );
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          r.user.toLowerCase().includes(search.toLowerCase()) ||
          r.type.toLowerCase().includes(search.toLowerCase()) ||
          r.status.toLowerCase().includes(search.toLowerCase())
      ),
    [reports, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const openModal = (type: "view" | "edit", report: ReportItem) => {
    setSelected(report);
    if (type === "edit") setEditContent(report.content);
    setModal(type);
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <AnimatePresence>
        {modal && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={closeModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-2xl glass-card rounded-2xl p-8 premium-shadow border border-border/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-2xl text-foreground">{modal === "view" ? "Ver Reporte" : "Editar Reporte"}</h3>
                <button onClick={closeModal} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-4 flex-wrap mb-6">
                <div>
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Usuario</p>
                  <p className="text-sm text-foreground font-medium">{selected.user}</p>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Tipo</p>
                  <p className="text-sm text-foreground">{selected.type}</p>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Estado</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      selected.status === "Generado" ? "bg-primary/10 text-primary" : selected.status === "Pendiente" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {selected.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Fecha</p>
                  <p className="text-sm text-muted-foreground">{selected.date}</p>
                </div>
              </div>
              {modal === "view" ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Contenido</p>
                    <p className="text-muted-foreground leading-relaxed text-sm">{selected.content || "Este reporte aún no tiene contenido generado."}</p>
                  </div>
                  <button onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-border/50 text-foreground text-sm hover:bg-accent/50 transition-colors">
                    Cerrar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Contenido del Reporte</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={10}
                      placeholder="Escribe o edita el contenido del reporte..."
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-sm resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-xl shimmer-gold text-primary-foreground text-sm font-medium glow-gold">Guardar</button>
                    <button onClick={closeModal} className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Buscar por usuario, tipo o estado..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm"
        />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl premium-shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left p-4 text-muted-foreground font-normal">Usuario</th>
              <th className="text-left p-4 text-muted-foreground font-normal">Tipo</th>
              <th className="text-left p-4 text-muted-foreground font-normal">Estado</th>
              <th className="text-left p-4 text-muted-foreground font-normal">Fecha</th>
              <th className="p-4 text-muted-foreground font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((r) => (
              <tr key={r.id} className="border-b border-border/20 hover:bg-accent/30 transition-colors">
                <td className="p-4 text-foreground">{r.user}</td>
                <td className="p-4 text-muted-foreground">{r.type}</td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      r.status === "Generado" ? "bg-primary/10 text-primary" : r.status === "Pendiente" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{r.date}</td>
                <td className="p-4 flex items-center gap-2">
                  <button onClick={() => openModal("view", r)} className="p-1.5 hover:bg-accent/50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => openModal("edit", r)} className="p-1.5 hover:bg-accent/50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-1.5 hover:bg-accent/50 rounded-lg transition-colors">
                    <RefreshCw className="w-4 h-4 text-primary" />
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="p-0">
                  <EmptyState icon={BookOpen} message="No hay reportes." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </motion.div>

      {totalPages > 1 && filtered.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-muted-foreground">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {getPaginationItems(totalPages, currentPage).map((item, i) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => goToPage(item)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
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

export default AdminReports;
