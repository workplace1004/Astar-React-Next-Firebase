import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { HelpCircle, Search, ChevronLeft, ChevronRight, Loader2, Eye, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import EmptyState from "@/components/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminGetQuestions, type AdminQuestionItem } from "@/lib/api";
import { getPaginationItems } from "@/lib/pagination";

const ITEMS_PER_PAGE = 10;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "new", label: "Nueva" },
  { value: "waiting", label: "En espera" },
  { value: "answered", label: "Respondida" },
];

const AdminQuestions = () => {
  const [questions, setQuestions] = useState<AdminQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewQuestion, setViewQuestion] = useState<AdminQuestionItem | null>(null);

  useEffect(() => {
    adminGetQuestions().then(setQuestions).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      questions.filter((q) => {
        const matchesSearch =
          !search.trim() ||
          q.user.toLowerCase().includes(search.toLowerCase()) ||
          (q.userEmail && q.userEmail.toLowerCase().includes(search.toLowerCase())) ||
          q.question.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || q.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [questions, search, statusFilter]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const statusLabels: Record<string, { label: string; cls: string }> = {
    new: { label: "Nueva", cls: "bg-primary/10 text-primary" },
    waiting: { label: "En espera", cls: "bg-accent text-accent-foreground" },
    answered: { label: "Respondida", cls: "bg-muted text-muted-foreground" },
  };

  return (
    <div className="max-w-5xl mx-auto">
      <AnimatePresence>
        {viewQuestion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setViewQuestion(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-2xl glass-card rounded-2xl p-8 premium-shadow border border-border/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-2xl text-foreground">Ver pregunta</h3>
                <button onClick={() => setViewQuestion(null)} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-4 flex-wrap mb-6">
                <div>
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Usuario</p>
                  <p className="text-sm text-foreground font-medium">{viewQuestion.user}</p>
                </div>
                {viewQuestion.userEmail && (
                  <div>
                    <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Email</p>
                    <p className="text-sm text-muted-foreground">{viewQuestion.userEmail}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Estado</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusLabels[viewQuestion.status]?.cls ?? "bg-muted text-muted-foreground"}`}>
                    {statusLabels[viewQuestion.status]?.label ?? viewQuestion.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Fecha</p>
                  <p className="text-sm text-muted-foreground">{formatDate(viewQuestion.date)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Pregunta</p>
                  <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap">{viewQuestion.question || "—"}</p>
                </div>
                {viewQuestion.answer && (
                  <div>
                    <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Respuesta</p>
                    <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap">{viewQuestion.answer}</p>
                  </div>
                )}
                <button onClick={() => setViewQuestion(null)} className="px-5 py-2.5 rounded-xl border border-border/50 text-foreground text-sm hover:bg-accent/50 transition-colors">
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por usuario o pregunta..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm"
          />
        </div>
        <Select
          value={statusFilter === "" ? "all" : statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="min-w-[180px] h-[46px] rounded-xl bg-background/50 border-border/50 focus:ring-primary/20">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="new">Nueva</SelectItem>
            <SelectItem value="waiting">En espera</SelectItem>
            <SelectItem value="answered">Respondida</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
                  <th className="text-left p-4 text-muted-foreground font-normal">Usuario</th>
                  <th className="text-left p-4 text-muted-foreground font-normal">Pregunta</th>
                  <th className="text-left p-4 text-muted-foreground font-normal">Estado</th>
                  <th className="text-left p-4 text-muted-foreground font-normal">Fecha</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((q) => (
                  <tr key={q.id} className="border-b border-border/20 hover:bg-accent/30 transition-colors">
                    <td className="p-4 text-foreground">{q.user}</td>
                    <td className="p-4 text-muted-foreground max-w-xs truncate">{q.question}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusLabels[q.status]?.cls ?? "bg-muted text-muted-foreground"}`}>
                        {statusLabels[q.status]?.label ?? q.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(q.date)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewQuestion(q)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                          title="Ver pregunta"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link to={`/admin/questions/${q.id}`} className="text-primary text-xs hover:text-primary/80">
                          Responder →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <EmptyState icon={HelpCircle} message="No hay preguntas." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
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
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">…</span>
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

export default AdminQuestions;
