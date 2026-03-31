import { createElement, Fragment } from "react";
import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "blockquote";

export type SerifWithSansNumeralsProps = {
  as?: HeadingTag;
  className?: string;
  /** Texto en serif; cualquier secuencia de dígitos se renderiza con la familia sans del proyecto. */
  text: string;
};

/**
 * Títulos y frases en `font-serif` sin aplicar serif a los números (convención del proyecto).
 */
function splitNumeralsToNodes(text: string) {
  const segments = text.split(/(\d+)/);
  return segments.map((segment, i) =>
    /^\d+$/.test(segment) ? (
      <span key={i} className="font-sans tabular-nums">
        {segment}
      </span>
    ) : (
      <Fragment key={i}>{segment}</Fragment>
    ),
  );
}

/**
 * Misma regla que `SerifWithSansNumerals`, sin forzar serif en el contenedor (p. ej. meta, párrafos body).
 */
export function SansNumeralsInherit({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{splitNumeralsToNodes(text)}</span>;
}

export function SerifWithSansNumerals({ as = "h2", className, text }: SerifWithSansNumeralsProps) {
  return createElement(as, { className: cn("font-serif", className) }, splitNumeralsToNodes(text));
}
