import { motion } from "framer-motion";
import { CreditCard, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import EmptyState from "@/components/EmptyState";
import { adminGetOrders, type AdminOrderItem } from "@/lib/api";
import { getPaginationItems } from "@/lib/pagination";

const ITEMS_PER_PAGE = 10;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function formatPaymentMethod(method: string) {
  const normalized = (method || "").toLowerCase();
  if (!normalized) return "—";
  if (normalized.includes("stripe")) return "Stripe";
  if (normalized.includes("mercadopago")) return "Mercado Pago";
  if (normalized.includes("card") || normalized.includes("tarjeta")) return "Tarjeta";
  if (normalized.includes("transfer") || normalized.includes("transferencia")) return "Transferencia";
  if (normalized.includes("cash") || normalized.includes("efectivo")) return "Efectivo";
  const head = method.split(":")[0]?.trim();
  return head ? head.charAt(0).toUpperCase() + head.slice(1) : method;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    adminGetOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.user.toLowerCase().includes(search.toLowerCase()) ||
          o.userEmail.toLowerCase().includes(search.toLowerCase()) ||
          o.type.toLowerCase().includes(search.toLowerCase())
      ),
    [orders, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const mainMethod = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const key = formatPaymentMethod(o.method);
      counts[key] = (counts[key] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] ?? "—";
  }, [orders]);

  const totalIncome = useMemo(() => {
    let sum = 0;
    orders.forEach((o) => {
      const match = o.amount.replace(/[^0-9.]/g, "");
      const n = parseFloat(match);
      if (!Number.isNaN(n)) sum += n;
    });
    return sum > 0 ? `${sum.toFixed(0)} USD` : "—";
  }, [orders]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Ingresos (período)", value: totalIncome },
          { label: "Total Pedidos", value: String(orders.length) },
          { label: "Método Principal", value: mainMethod },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card rounded-2xl p-6 premium-shadow text-center">
            <p className="font-sans text-2xl text-foreground tabular-nums">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Buscar por usuario, email o tipo..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl premium-shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border/30"><th className="text-left p-4 text-muted-foreground font-normal">Usuario</th><th className="text-left p-4 text-muted-foreground font-normal">Tipo</th><th className="text-left p-4 text-muted-foreground font-normal">Monto</th><th className="text-left p-4 text-muted-foreground font-normal">Método</th><th className="text-left p-4 text-muted-foreground font-normal">Fecha</th></tr></thead>
              <tbody>
                {paginated.map((o) => (
                  <tr key={o.id} className="border-b border-border/20 hover:bg-accent/30 transition-colors">
                    <td className="p-4 text-foreground">{o.user}</td>
                    <td className="p-4 text-muted-foreground">{o.type}</td>
                    <td className="p-4 text-primary font-sans tabular-nums">{o.amount}</td>
                    <td className="p-4 text-muted-foreground">{formatPaymentMethod(o.method)}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(o.date)}</td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <EmptyState icon={CreditCard} message="No hay pedidos." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalPages > 1 && filtered.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/20">
                <p className="text-xs text-muted-foreground">
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {getPaginationItems(totalPages, currentPage).map((item, i) =>
                    item === "ellipsis" ? (
                      <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">…</span>
                    ) : (
                      <button key={item} onClick={() => goToPage(item)} className={`w-8 h-8 rounded-lg text-sm transition-colors ${item === currentPage ? "bg-primary/10 text-primary border border-primary/20 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
                        {item}
                      </button>
                    )
                  )}
                  <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AdminOrders;
