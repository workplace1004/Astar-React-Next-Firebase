import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Send, User, Mail, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { adminGetUsers, adminGetConversation, adminSendMessage, type AdminUserListItem, type AdminConversationMessage } from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { getPaginationItems } from "@/lib/pagination";

const ITEMS_PER_PAGE = 8;

function formatMessageTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

const AdminMonthlyMessages = () => {
  const [subscribers, setSubscribers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<AdminConversationMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }
    setMessagesLoading(true);
    adminGetConversation(selected)
      .then(setMessages)
      .finally(() => setMessagesLoading(false));
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const selectedUser = selected ? subscribers.find((s) => s.id === selected) : null;

  const handleSend = () => {
    const text = message.trim();
    if (!selected || !text || sending) return;
    setSending(true);
    adminSendMessage(selected, text)
      .then((sent) => {
        if (sent) {
          setMessages((prev) => [...prev, sent]);
          setMessage("");
        }
      })
      .finally(() => setSending(false));
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
                    onClick={() => setSelected(s.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all text-sm ${selected === s.id ? "bg-primary/10 border border-primary/20" : "hover:bg-accent/50"
                      }`}
                  >
                    <User className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    </div>
                  </button>
                ))}
                {paginated.length === 0 && (
                  <EmptyState icon={Mail} message="No hay suscriptores." className="py-8" />
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
                        <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-muted-foreground text-xs">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => goToPage(item)}
                          className={`w-7 h-7 rounded-lg text-xs transition-colors ${item === currentPage ? "bg-primary/10 text-primary border border-primary/20 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6 pb-0 premium-shadow flex flex-col min-h-[420px]">
          {selected ? (
            <>
              <div className="mb-4">
                <h3 className="font-serif text-lg text-foreground">Escribir Mensaje</h3>
                {selectedUser && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Conversación con {selectedUser.name}
                  </p>
                )}
              </div>

              <div className="flex-1 flex flex-col min-h-0 border border-border/30 rounded-xl overflow-hidden bg-background/30">
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[585px]">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No hay mensajes aún. Escribe el primer mensaje.</p>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.fromAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.fromAdmin
                            ? "bg-primary/15 text-foreground border border-primary/20 rounded-br-md"
                            : "bg-muted/50 text-foreground border border-border/50 rounded-bl-md"
                            }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          <p className="text-xs text-muted-foreground mt-1.5">{formatMessageTime(m.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <div className="p-3 flex gap-2 items-center">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Escribe el mensaje mensual personalizado"
                  className="flex-1 min-h-[30px] px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="shrink-0 px-4 py-3 rounded-xl shimmer-gold text-primary-foreground font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2 glow-gold h-[43px]"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Enviar
                </button>
              </div>
            </>
          ) : (
            <EmptyState icon={Mail} message="Selecciona un suscriptor para ver y escribir mensajes." className="py-20" />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminMonthlyMessages;
