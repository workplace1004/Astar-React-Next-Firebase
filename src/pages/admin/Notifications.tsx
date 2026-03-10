import React from "react";
import { Bell, UserPlus, CreditCard, HelpCircle, FileText, Check, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import EmptyState from "@/components/EmptyState";
import { getPaginationItems } from "@/lib/pagination";

type NotifItem = { id: number; icon: React.ComponentType<{ className?: string }>; title: string; desc: string; time: string; date: string; unread: boolean; category: string };

const ITEMS_PER_PAGE = 10;

const AdminNotifications = () => {
  const [notifications] = useState<NotifItem[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(
    () =>
      notifications.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.desc.toLowerCase().includes(search.toLowerCase()) ||
          n.category.toLowerCase().includes(search.toLowerCase())
      ),
    [notifications, search]
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl tracking-wide text-gradient-gold font-semibold">Notificaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">Tienes {notifications.filter((n) => n.unread).length} notificaciones sin leer</p>
        </div>
        <button className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors font-medium px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5">
          <Check className="w-3.5 h-3.5" />
          Marcar todo como leído
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar notificaciones..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm" />
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden divide-y divide-border/20">
        {paginated.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-start gap-4 px-5 py-4 hover:bg-accent/20 transition-colors cursor-pointer ${notif.unread ? "bg-primary/5" : ""}`}
          >
            <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${notif.unread ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              <notif.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className={`text-sm font-medium ${notif.unread ? "text-foreground" : "text-muted-foreground"}`}>{notif.title}</p>
                {notif.unread && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{notif.desc}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-muted-foreground/60">{notif.time}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">{notif.category}</span>
              </div>
            </div>
          </div>
        ))}
        {paginated.length === 0 && (
          <div className="p-6">
            <EmptyState icon={Bell} message="No hay notificaciones." />
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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

export default AdminNotifications;
