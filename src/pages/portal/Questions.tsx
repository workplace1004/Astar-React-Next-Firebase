import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Send, HelpCircle, Package, Loader2, MessageCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { portalSubmitQuestion, portalGetMyQuestions, type PortalQuestionItem } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

const Questions = () => {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [messagePacksModalOpen, setMessagePacksModalOpen] = useState(false);
  const [myQuestions, setMyQuestions] = useState<PortalQuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const maxChars = 500;
  const remaining = useMemo(() => {
    const monthStartUtc = new Date();
    monthStartUtc.setUTCDate(1);
    monthStartUtc.setUTCHours(0, 0, 0, 0);
    const askedThisMonth = myQuestions.some((q) => {
      const createdAt = new Date(q.createdAt);
      return Number.isFinite(createdAt.getTime()) && createdAt >= monthStartUtc;
    });
    return askedThisMonth ? 0 : 1;
  }, [myQuestions]);

  useEffect(() => {
    refetchQuestions();
  }, []);

  const refetchQuestions = (showLoading = true) => {
    if (showLoading) setLoadingQuestions(true);
    portalGetMyQuestions()
      .then(setMyQuestions)
      .finally(() => setLoadingQuestions(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || remaining === 0) return;
    setError(null);
    setSubmitting(true);
    const textToSend = question.trim();
    try {
      const created = await portalSubmitQuestion(textToSend);
      setQuestion("");
      setSubmitted(true);
      setMyQuestions((prev) => [{ id: created.id, question: textToSend, answer: null, status: created.status, createdAt: created.createdAt }, ...prev]);
      refetchQuestions(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la pregunta");
    } finally {
      setSubmitting(false);
    }
  };

  const messagePacks = [
    {
      id: "pack-1",
      title: "1 mensaje",
      totalUsd: 2,
      discountPct: 0,
      description: "Compra individual para enviar un mensaje adicional.",
    },
    {
      id: "pack-5",
      title: "5 mensajes",
      totalUsd: 8,
      discountPct: 20,
      description: "Incluye reducción del 20% sobre el precio base.",
    },
    {
      id: "pack-10",
      title: "10 mensajes",
      totalUsd: 12,
      discountPct: 40,
      description: "Incluye reducción del 40% para mayor ahorro.",
    },
  ] as const;

  const openMessagePacksModal = () => {
    setLimitModalOpen(false);
    setMessagePacksModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-2 gap-5">
      <div>
        {/* Remaining indicator */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`glass-card rounded-2xl p-6 premium-shadow mb-8 flex items-center gap-4 ${remaining === 0 ? "border border-accent-foreground/20" : "border border-primary/20"}`}>
          <HelpCircle className={`w-8 h-8 shrink-0 ${remaining > 0 ? "text-primary" : "text-muted-foreground"}`} />
          <div className="flex-1">
            {remaining > 0 ? (
              <>
                <p className="text-foreground font-medium">Preguntas disponibles este mes: {remaining}</p>
                <p className="text-sm text-muted-foreground">Tu suscripción incluye 1 pregunta por mes. Se renueva el 1 de cada mes.</p>
              </>
            ) : (
              <>
                <p className="text-foreground font-medium">Ya usaste tu pregunta mensual</p>
                <p className="text-sm text-muted-foreground">
                  Consultá servicios y extras en el catálogo.{" "}
                  <Link to="/portal/extra-services" className="text-primary hover:text-primary/80 inline-flex items-center gap-1">
                    <Package className="w-3 h-3" /> Servicios extras
                  </Link>
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* Past questions & answers */}
        {myQuestions.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {loadingQuestions ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4 max-h-[650px] overflow-y-auto">
                {myQuestions.map((q) => (
                  <div key={q.id} className="glass-card rounded-2xl p-6 premium-shadow border border-border/50 space-y-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {formatDate(q.createdAt)}
                      {q.status === "answered" && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">Respondida</span>
                      )}
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{q.question}</p>
                    {q.answer && (
                      <div className="pt-4 border-t border-border/30">
                        <div className="flex items-center gap-2 text-xs text-primary mb-2">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Respuesta
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">{q.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        )}
      </div>



      {submitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-10 premium-shadow text-center max-h-[350px]">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-serif text-2xl text-foreground mb-2">Pregunta Enviada</h3>
          <p className="text-muted-foreground">Tu pregunta ha sido recibida. Verás la respuesta aquí en Mis Preguntas y también en Mensajes cuando el administrador responda.</p>
        </motion.div>
      ) : (
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card max-h-[350px] rounded-2xl p-10 premium-shadow">
          <label className="text-xs tracking-widest uppercase text-muted-foreground mb-3 block">Tu Pregunta</label>
          <div className="relative mb-2">
            <textarea
              value={question}
              onChange={(e) => e.target.value.length <= maxChars && setQuestion(e.target.value)}
              placeholder="Escribe tu pregunta aquí. Sé específico para recibir una respuesta más precisa..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm resize-none"
              disabled={remaining === 0}
            />
            {remaining === 0 ? (
              <button
                type="button"
                onClick={() => setLimitModalOpen(true)}
                className="absolute inset-0 z-10 rounded-xl bg-transparent"
                aria-label="Open monthly question limit message"
              />
            ) : null}
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-muted-foreground">{question.length}/{maxChars} caracteres</span>
          </div>
          {error && (
            <p className="text-sm text-destructive mb-4">{error}</p>
          )}
          <button type="submit" disabled={!question.trim() || remaining === 0 || submitting} className="w-full py-3.5 rounded-xl shimmer-gold text-primary-foreground font-medium tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed glow-gold flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "Enviando…" : "Enviar Pregunta"}
          </button>
        </motion.form>
      )}

      <AlertDialog open={limitModalOpen} onOpenChange={setLimitModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Límite mensual alcanzado</AlertDialogTitle>
            <AlertDialogDescription>
              Solo puedes enviar un mensaje una vez al mes.
              <br />
              Haz clic{" "}
              <button
                type="button"
                onClick={openMessagePacksModal}
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                aquí
              </button>{" "}
              para enviar un mensaje adicional.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
            <AlertDialogAction onClick={openMessagePacksModal}>Ir a servicios extras</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={messagePacksModalOpen} onOpenChange={setMessagePacksModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Mensajes adicionales</DialogTitle>
            <DialogDescription>
              Elige un paquete para enviar mensajes extra.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-3">
            {messagePacks.map((pack) => (
              <div key={pack.id} className="rounded-xl border border-border/60 bg-card/40 p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="font-semibold text-foreground">{pack.title}</div>
                  {pack.discountPct > 0 ? (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-primary/15 text-primary font-semibold">
                      {pack.discountPct}% OFF
                    </span>
                  ) : null}
                </div>
                <p className="text-3xl font-light text-gradient-gold mb-2">${pack.totalUsd}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{pack.description}</p>
                <Link
                  to="/portal/extra-services"
                  className="mt-auto inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  Seleccionar
                </Link>
              </div>
            ))}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setMessagePacksModalOpen(false)}
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cerrar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Questions;
