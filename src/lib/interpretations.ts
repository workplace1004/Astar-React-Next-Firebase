import type { PortalReport } from "@/lib/api";
import { getAstarContentStyleConfig, type AstarContentStyleConfig } from "@/lib/contentStyleConfig";

type UnknownRecord = Record<string, unknown>;

export type SupportedReportType = "birth_chart" | "solar_return" | "numerology";

export interface InterpretationSection {
  id: string;
  title: string;
  content: string;
  source: "astar" | "vendor";
}

export interface InterpretationTheme {
  title: string;
  subtitle: string;
}

export interface NormalizedInterpretation {
  sections: InterpretationSection[];
  theme: InterpretationTheme | null;
  usedVendorFallback: boolean;
}

export interface BuildInterpretationOptions {
  reportType: SupportedReportType;
  defaultSectionTitle?: string;
  useAstarCopy?: boolean;
  allowVendorFallback?: boolean;
  styleConfig?: AstarContentStyleConfig;
}

export interface BuildPreviewDescriptionOptions {
  pillarLabel: "Sol" | "Luna" | "Ascendente";
  useAstarCopy?: boolean;
  allowVendorFallback?: boolean;
  styleConfig?: AstarContentStyleConfig;
}

const USE_ASTAR_COPY = import.meta.env.VITE_USE_ASTAR_COPY !== "false";
const ALLOW_VENDOR_FALLBACK = import.meta.env.VITE_ALLOW_VENDOR_TEXT_FALLBACK !== "false";

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asCleanString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeArrayEntry(entry: unknown, index: number, defaultTitle: string): InterpretationSection | null {
  if (typeof entry === "string") {
    const content = asCleanString(entry);
    if (!content) return null;
    return {
      id: `section-${index + 1}`,
      title: `${defaultTitle} ${index + 1}`,
      content,
      source: "vendor",
    };
  }

  if (!isRecord(entry)) return null;

  const contentCandidate =
    asCleanString(entry.content) ||
    asCleanString(entry.description) ||
    asCleanString(entry.text) ||
    asCleanString(entry.body);
  if (!contentCandidate) return null;

  const id = asCleanString(entry.id) || `section-${index + 1}`;
  const title = asCleanString(entry.title) || asCleanString(entry.name) || `${defaultTitle} ${index + 1}`;

  return {
    id,
    title,
    content: contentCandidate,
    source: "vendor",
  };
}

function parseReportContent(content: string | null): unknown {
  if (!content) return null;
  const trimmed = content.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function extractTheme(parsedContent: unknown): InterpretationTheme | null {
  if (!isRecord(parsedContent) || !isRecord(parsedContent.theme)) return null;
  const title = asCleanString(parsedContent.theme.title);
  const subtitle = asCleanString(parsedContent.theme.subtitle);
  if (!title && !subtitle) return null;
  return { title, subtitle };
}

function extractSections(parsedContent: unknown, defaultSectionTitle: string): InterpretationSection[] {
  if (!parsedContent) return [];

  const normalizeArray = (arr: unknown[]): InterpretationSection[] =>
    arr
      .map((item, index) => normalizeArrayEntry(item, index, defaultSectionTitle))
      .filter((item): item is InterpretationSection => Boolean(item));

  if (Array.isArray(parsedContent)) {
    return normalizeArray(parsedContent);
  }

  if (typeof parsedContent === "string") {
    return [
      {
        id: "main",
        title: defaultSectionTitle,
        content: asCleanString(parsedContent),
        source: "vendor",
      },
    ].filter((item) => item.content.length > 0);
  }

  if (!isRecord(parsedContent)) return [];

  const listKeys = ["sections", "interpretations"];
  for (const key of listKeys) {
    const maybeList = parsedContent[key];
    if (Array.isArray(maybeList)) {
      const sections = normalizeArray(maybeList);
      if (sections.length > 0) return sections;
    }
  }

  const contentCandidate =
    asCleanString(parsedContent.content) ||
    asCleanString(parsedContent.description) ||
    asCleanString(parsedContent.text) ||
    asCleanString(parsedContent.body);

  if (!contentCandidate) return [];

  return [
    {
      id: asCleanString(parsedContent.id) || "main",
      title: asCleanString(parsedContent.title) || defaultSectionTitle,
      content: contentCandidate,
      source: "vendor",
    },
  ];
}

function applyAstarTone(
  content: string,
  reportType: SupportedReportType,
  sectionTitle: string,
  styleConfig?: AstarContentStyleConfig,
): string {
  const cleaned = asCleanString(content);
  if (!cleaned) return "";

  const softened = cleaned
    .replace(/\bdebes\b/gi, "puedes")
    .replace(/\bnunca\b/gi, "difícilmente")
    .replace(/\bsiempre\b/gi, "con frecuencia");

  const config = styleConfig ?? getAstarContentStyleConfig();
  const template = config.reportTemplates[reportType];
  const closing = template.closing.replace(/\{\{\s*section\s*\}\}/gi, sectionTitle.toLowerCase());
  return `${template.intro}\n\n${softened}\n\n${closing}`;
}

function applyAstarPreviewTone(
  content: string,
  pillarLabel: BuildPreviewDescriptionOptions["pillarLabel"],
  styleConfig?: AstarContentStyleConfig,
): string {
  const cleaned = asCleanString(content);
  if (!cleaned) return "";

  const softened = cleaned
    .replace(/\bdebes\b/gi, "puedes")
    .replace(/\bnunca\b/gi, "difícilmente")
    .replace(/\bsiempre\b/gi, "con frecuencia");

  const config = styleConfig ?? getAstarContentStyleConfig();
  return `${config.previewTemplates[pillarLabel].intro} ${softened}`;
}

export function buildPortalInterpretation(
  report: PortalReport | null,
  options: BuildInterpretationOptions,
): NormalizedInterpretation {
  const defaultSectionTitle = options.defaultSectionTitle ?? "Interpretación";
  const useAstarCopy = options.useAstarCopy ?? USE_ASTAR_COPY;
  const allowVendorFallback = options.allowVendorFallback ?? ALLOW_VENDOR_FALLBACK;

  if (!report || !report.content) {
    return { sections: [], theme: null, usedVendorFallback: false };
  }

  const parsed = parseReportContent(report.content);
  const theme = extractTheme(parsed);
  const rawSections = extractSections(parsed, defaultSectionTitle);

  if (rawSections.length === 0) {
    return { sections: [], theme, usedVendorFallback: false };
  }

  if (!useAstarCopy) {
    return { sections: rawSections, theme, usedVendorFallback: false };
  }

  const astarSections = rawSections
    .map((section) => ({
      ...section,
      content: applyAstarTone(section.content, options.reportType, section.title, options.styleConfig),
      source: "astar" as const,
    }))
    .filter((section) => section.content.length > 0);

  if (astarSections.length > 0) {
    return { sections: astarSections, theme, usedVendorFallback: false };
  }

  if (!allowVendorFallback) {
    return { sections: [], theme, usedVendorFallback: false };
  }

  return { sections: rawSections, theme, usedVendorFallback: true };
}

export function buildPreviewDescription(
  description: string,
  options: BuildPreviewDescriptionOptions,
): { content: string; source: "astar" | "vendor"; usedVendorFallback: boolean } {
  const useAstarCopy = options.useAstarCopy ?? USE_ASTAR_COPY;
  const allowVendorFallback = options.allowVendorFallback ?? ALLOW_VENDOR_FALLBACK;
  const vendor = asCleanString(description);

  if (!vendor) {
    return { content: "", source: "vendor", usedVendorFallback: false };
  }

  if (!useAstarCopy) {
    return { content: vendor, source: "vendor", usedVendorFallback: false };
  }

  const astar = applyAstarPreviewTone(vendor, options.pillarLabel, options.styleConfig);
  if (astar) {
    return { content: astar, source: "astar", usedVendorFallback: false };
  }

  if (!allowVendorFallback) {
    return { content: "", source: "vendor", usedVendorFallback: false };
  }

  return { content: vendor, source: "vendor", usedVendorFallback: true };
}
