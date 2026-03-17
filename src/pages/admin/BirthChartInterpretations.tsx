import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Sun, Moon, ArrowUpCircle, Save, Search } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  adminGetBirthChartInterpretations,
  adminUpdateBirthChartInterpretation,
  type AdminBirthChartInterpretationItem,
  type BirthChartInterpretationType,
} from "@/lib/api";

const TYPE_META: Record<BirthChartInterpretationType, { title: string; icon: typeof Sun }> = {
  sun: { title: "Sol", icon: Sun },
  moon: { title: "Luna", icon: Moon },
  ascendant: { title: "Ascendente", icon: ArrowUpCircle },
};

export default function AdminBirthChartInterpretations() {
  const [items, setItems] = useState<AdminBirthChartInterpretationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingById, setSavingById] = useState<Record<string, boolean>>({});
  const [draftById, setDraftById] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    let alive = true;
    adminGetBirthChartInterpretations()
      .then((data) => {
        if (!alive) return;
        setItems(data);
        const nextDrafts: Record<string, string> = {};
        data.forEach((row) => {
          nextDrafts[row.id] = row.description;
        });
        setDraftById(nextDrafts);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (row) => row.sign.toLowerCase().includes(q) || row.description.toLowerCase().includes(q) || row.type.toLowerCase().includes(q),
    );
  }, [items, search]);

  const grouped = useMemo(() => {
    const groups: Record<BirthChartInterpretationType, AdminBirthChartInterpretationItem[]> = {
      sun: [],
      moon: [],
      ascendant: [],
    };
    filtered.forEach((row) => {
      groups[row.type].push(row);
    });
    return groups;
  }, [filtered]);

  const handleSave = async (id: string) => {
    const draft = (draftById[id] ?? "").trim();
    if (!draft) return;
    setSavingById((prev) => ({ ...prev, [id]: true }));
    try {
      const updated = await adminUpdateBirthChartInterpretation(id, draft);
      if (!updated) return;
      setItems((prev) => prev.map((row) => (row.id === id ? updated : row)));
      setDraftById((prev) => ({ ...prev, [id]: updated.description }));
    } finally {
      setSavingById((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-12 w-full rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 premium-shadow space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por signo o contenido..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm"
        />
      </motion.div>

      {filtered.length === 0 ? (
        <EmptyState icon={Sun} message="No hay interpretaciones para mostrar." />
      ) : (
        (Object.keys(TYPE_META) as BirthChartInterpretationType[]).map((type, sectionIndex) => {
          const sectionItems = grouped[type];
          if (sectionItems.length === 0) return null;
          const Icon = TYPE_META[type].icon;
          return (
            <motion.section
              key={type}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.06 }}
              className="glass-card rounded-2xl p-6 premium-shadow"
            >
              <h3 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                {TYPE_META[type].title}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sectionItems.map((row) => {
                  const draft = draftById[row.id] ?? "";
                  const changed = draft.trim() !== row.description.trim();
                  const saving = Boolean(savingById[row.id]);
                  return (
                    <div key={row.id} className="rounded-xl border border-border/40 bg-background/30 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">{row.sign}</p>
                        <button
                          onClick={() => handleSave(row.id)}
                          disabled={!changed || saving}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/15 text-primary border border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Guardar
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={draft}
                        onChange={(e) => setDraftById((prev) => ({ ...prev, [row.id]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-background/60 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-y"
                      />
                    </div>
                  );
                })}
              </div>
            </motion.section>
          );
        })
      )}
    </div>
  );
}
