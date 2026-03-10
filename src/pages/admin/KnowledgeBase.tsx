import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import { Database, Plus, X, ChevronDown, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { adminGetKnowledgeBase } from "@/lib/api";
import { getPaginationItems } from "@/lib/pagination";

type CategoryItem = { title: string; entries: string[] };

type ModalType = "new" | "edit" | null;

const ITEMS_PER_PAGE = 10;

const AdminKnowledgeBase = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [editEntry, setEditEntry] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formContent, setFormContent] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const allEntries = useMemo(
    () => categories.flatMap((c) => c.entries.map((e) => ({ category: c.title, entry: e }))),
    [categories]
  );

  useEffect(() => {
    adminGetKnowledgeBase().then((data) => {
      setCategories(data.map((c) => ({ title: c.title, entries: c.entries.map((e) => e.content) })));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(
    () =>
      allEntries.filter(
        (item) =>
          item.entry.toLowerCase().includes(search.toLowerCase()) ||
          item.category.toLowerCase().includes(search.toLowerCase())
      ),
    [allEntries, search]
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Group paginated entries by category for display
  const groupedPaginated = useMemo(() => {
    const groups: Record<string, string[]> = {};
    paginated.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item.entry);
    });
    return Object.entries(groups);
  }, [paginated]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const openNew = () => {
    setFormCategory("");
    setFormContent("");
    setModal("new");
  };

  const openEdit = (category: string, entry: string) => {
    setEditCategory(category);
    setEditEntry(entry);
    setFormCategory(category);
    setFormContent(entry);
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar por categoría o contenido..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm" />
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 rounded-xl shimmer-gold text-primary-foreground text-sm font-medium glow-gold shrink-0">
          <Plus className="w-4 h-4" /> Nueva Entrada
        </button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={closeModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative z-10 w-full max-w-lg glass-card rounded-2xl p-8 premium-shadow border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-2xl text-foreground">{modal === "new" ? "Nueva Entrada" : "Editar Entrada"}</h3>
                <button onClick={closeModal} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Categoría</label>
                  <div ref={dropdownRef} className="relative">
                    <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors">
                      <span className={formCategory ? "text-foreground" : "text-muted-foreground/50"}>{formCategory || "Seleccionar categoría..."}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="absolute z-20 mt-1 w-full rounded-xl bg-card border border-border/50 shadow-lg overflow-hidden">
                          {categories.map((c) => (
                            <li key={c.title} onClick={() => { setFormCategory(c.title); setDropdownOpen(false); }} className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-accent/50 ${formCategory === c.title ? "text-primary bg-accent/30" : "text-foreground"}`}>{c.title}</li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Contenido</label>
                  <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} rows={4} placeholder="Ej: Júpiter: Expansión, abundancia, sabiduría" className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-sm resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button className="px-5 py-2.5 rounded-xl shimmer-gold text-primary-foreground text-sm font-medium glow-gold">{modal === "new" ? "Crear" : "Guardar"}</button>
                  <button onClick={closeModal} className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
      <div className="space-y-6">
        {groupedPaginated.map(([title, entries], i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card rounded-2xl p-6 premium-shadow">
            <h3 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> {title}</h3>
            <div className="space-y-2">
              {entries.map((e) => (
                <div key={e} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0 min-h-[2.25rem]">
                  <span className="text-sm text-muted-foreground truncate min-w-0 flex-1">{e}</span>
                  <button onClick={() => openEdit(title, e)} className="text-xs text-primary hover:text-primary/80 shrink-0">Editar</button>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
        {groupedPaginated.length === 0 && (
          <EmptyState icon={Database} message="No hay base de conocimiento." />
        )}
      </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-muted-foreground">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
            {getPaginationItems(totalPages, currentPage).map((item, i) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">…</span>
              ) : (
                <button key={item} onClick={() => goToPage(item)} className={`w-8 h-8 rounded-lg text-sm transition-colors ${item === currentPage ? "bg-primary/10 text-primary border border-primary/20 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>{item}</button>
              )
            )}
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKnowledgeBase;
