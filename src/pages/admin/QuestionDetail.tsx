import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, User, Loader2 } from "lucide-react";
import { adminGetQuestion, adminUpdateQuestionAnswer, type AdminQuestionItem } from "@/lib/api";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

const AdminQuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<AdminQuestionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    adminGetQuestion(id)
      .then((q) => {
        setQuestion(q);
        if (q?.answer) setAnswer(q.answer);
      })
      .catch(() => setError("No se pudo cargar la pregunta"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSend = () => {
    if (!id || !answer.trim()) return;
    setSending(true);
    setError(null);
    adminUpdateQuestionAnswer(id, answer)
      .then((updated) => {
        if (updated) {
          setQuestion(updated);
          setSent(true);
        } else setError("No se pudo enviar la respuesta");
      })
      .catch(() => setError("No se pudo enviar la respuesta"))
      .finally(() => setSending(false));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link to="/admin/questions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver a preguntas
        </Link>
        <div className="glass-card rounded-2xl p-8 premium-shadow text-center text-muted-foreground">{error}</div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/admin/questions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Volver a preguntas
      </Link>

      <div className="glass-card rounded-2xl p-6 premium-shadow mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-primary" />
          <span className="text-foreground font-medium">{question.user}</span>
          <span className="text-xs text-muted-foreground">{formatDate(question.date)}</span>
        </div>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{question.question}</p>
      </div>

      {sent ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8 premium-shadow text-center">
          <Send className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-serif text-xl text-foreground mb-2">Respuesta enviada</h3>
          <p className="text-muted-foreground text-sm">La respuesta se ha guardado y el usuario podrá verla.</p>
        </motion.div>
      ) : (
        <div className="glass-card rounded-2xl p-6 premium-shadow">
          <label className="text-xs tracking-widest uppercase text-muted-foreground mb-3 block">TU RESPUESTA</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={8}
            placeholder="Escribe la respuesta basada en la lectura simbólica..."
            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm resize-none mb-4"
          />
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
          <button
            onClick={handleSend}
            disabled={!answer.trim() || sending}
            className="w-full py-3.5 rounded-xl shimmer-gold text-primary-foreground font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2 glow-gold"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar Respuesta
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionDetail;
