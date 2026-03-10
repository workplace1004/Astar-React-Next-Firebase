import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, X, Search, ChevronLeft, ChevronRight, FileText, Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { adminGetBlogPosts } from "@/lib/api";
import { getPaginationItems } from "@/lib/pagination";

type PostItem = { id: string; title: string; status: string; date: string; content: string };

type ModalType = "new" | "view" | "edit" | "delete" | null;

const ITEMS_PER_PAGE = 10;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

const AdminBlog = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    adminGetBlogPosts().then((data) => {
      setPosts(
        data.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status === "published" ? "Publicado" : p.status === "draft" ? "Borrador" : p.status,
          date: formatDate(p.date),
          content: p.content,
        }))
      );
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() =>
    posts.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.status.toLowerCase().includes(search.toLowerCase())
    ), [search, posts]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const openModal = (type: ModalType, post?: PostItem) => {
    setSelectedPost(post || null);
    if (type === "edit" && post) {
      setFormTitle(post.title);
      setFormContent(post.content);
    } else if (type === "new") {
      setFormTitle("");
      setFormContent("");
    }
    setModal(type);
  };

  const closeModal = () => {
    setModal(null);
    setSelectedPost(null);
  };

  const handleDelete = () => {
    if (selectedPost) {
      setPosts((prev) => prev.filter((p) => p.id !== selectedPost.id));
    }
    closeModal();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar por título o estado..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm" />
        </div>
        <button onClick={() => openModal("new")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl shimmer-gold text-primary-foreground text-sm font-medium glow-gold shrink-0">
          <Plus className="w-4 h-4" /> Nuevo Artículo
        </button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={closeModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative z-10 w-full max-w-2xl glass-card rounded-2xl p-8 premium-shadow border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-2xl text-foreground">
                  {modal === "new" && "Nuevo Artículo"}
                  {modal === "view" && "Ver Artículo"}
                  {modal === "edit" && "Editar Artículo"}
                  {modal === "delete" && "Eliminar Artículo"}
                </h3>
                <button onClick={closeModal} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              {modal === "view" && selectedPost && (
                <div className="space-y-4">
                  <div><p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Título</p><p className="text-foreground font-medium text-lg">{selectedPost.title}</p></div>
                  <div className="flex gap-4">
                    <div><p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Estado</p><span className={`text-xs px-2 py-1 rounded-full ${selectedPost.status === "Publicado" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{selectedPost.status}</span></div>
                    <div><p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Fecha</p><p className="text-sm text-muted-foreground">{selectedPost.date}</p></div>
                  </div>
                  <div><p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Contenido</p><p className="text-muted-foreground leading-relaxed text-sm">{selectedPost.content}</p></div>
                  <div className="pt-2"><button onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-border/50 text-foreground text-sm hover:bg-accent/50 transition-colors">Cerrar</button></div>
                </div>
              )}
              {(modal === "new" || modal === "edit") && (
                <div className="space-y-4">
                  <div><label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Título</label><input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Título del artículo" className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-sm" /></div>
                  <div><label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Contenido</label><textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} rows={10} placeholder="Escribe el contenido del artículo..." className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-sm resize-none" /></div>
                  <div className="flex gap-3 pt-2">
                    <button className="px-5 py-2.5 rounded-xl shimmer-gold text-primary-foreground text-sm font-medium glow-gold">Publicar</button>
                    <button className="px-5 py-2.5 rounded-xl border border-border/50 text-foreground text-sm hover:bg-accent/50 transition-colors">Guardar Borrador</button>
                    <button onClick={closeModal} className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
                  </div>
                </div>
              )}
              {modal === "delete" && selectedPost && (
                <div className="space-y-6">
                  <p className="text-muted-foreground">¿Estás seguro de que deseas eliminar el artículo <span className="text-foreground font-medium">"{selectedPost.title}"</span>? Esta acción no se puede deshacer.</p>
                  <div className="flex gap-3">
                    <button onClick={handleDelete} className="px-5 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors">Eliminar</button>
                    <button onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-border/50 text-foreground text-sm hover:bg-accent/50 transition-colors">Cancelar</button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl premium-shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/30"><th className="text-left p-4 text-muted-foreground font-normal">Título</th><th className="text-left p-4 text-muted-foreground font-normal">Estado</th><th className="text-left p-4 text-muted-foreground font-normal">Fecha</th><th className="p-4 text-muted-foreground font-normal">Acciones</th></tr></thead>
          <tbody>
            {paginated.map((p) => (
              <tr key={p.id} className="border-b border-border/20 hover:bg-accent/30 transition-colors">
                <td className="p-4 text-foreground">{p.title}</td>
                <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${p.status === "Publicado" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{p.status}</span></td>
                <td className="p-4 text-muted-foreground">{p.date}</td>
                <td className="p-4 flex items-center gap-2">
                  <button onClick={() => openModal("view", p)} className="p-1.5 hover:bg-accent/50 rounded-lg transition-colors"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => openModal("edit", p)} className="p-1.5 hover:bg-accent/50 rounded-lg transition-colors"><Edit className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => openModal("delete", p)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-destructive" /></button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={4} className="p-0">
                  <EmptyState icon={FileText} message="No hay artículos." />
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

export default AdminBlog;
