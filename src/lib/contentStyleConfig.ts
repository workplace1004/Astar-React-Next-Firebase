import { adminGetContentStyleConfig, adminUpdateContentStyleConfig, apiGetContentStyleConfig } from "@/lib/api";

export type ReportStyleKey = "birth_chart" | "solar_return" | "numerology";
export type PreviewPillarKey = "Sol" | "Luna" | "Ascendente";

export interface ReportStyleTemplate {
  intro: string;
  closing: string;
}

export interface PreviewStyleTemplate {
  intro: string;
}

export interface AstarContentStyleConfig {
  reportTemplates: Record<ReportStyleKey, ReportStyleTemplate>;
  previewTemplates: Record<PreviewPillarKey, PreviewStyleTemplate>;
}

const STORAGE_KEY = "astar_content_style_config_v1";
let inMemoryConfig: AstarContentStyleConfig | null = null;

export const DEFAULT_ASTAR_CONTENT_STYLE_CONFIG: AstarContentStyleConfig = {
  reportTemplates: {
    birth_chart: {
      intro: "En Astar leemos esta energía como una guía para conocerte mejor.",
      closing:
        "Claves de integración de {{section}}: toma lo que te resuene y llévalo a decisiones concretas en tu día a día.",
    },
    solar_return: {
      intro: "En Astar leemos este ciclo como una invitación a ordenar prioridades y ritmo.",
      closing:
        "Claves de integración de {{section}}: enfócate en lo que puedas sostener con constancia durante este año.",
    },
    numerology: {
      intro: "En Astar usamos esta vibración como una brújula práctica para tu proceso actual.",
      closing:
        "Claves de integración de {{section}}: traduce esta energía en hábitos simples y medibles.",
    },
  },
  previewTemplates: {
    Sol: { intro: "En Astar, tu Sol habla de identidad y dirección." },
    Luna: { intro: "En Astar, tu Luna muestra tu mundo emocional y tus necesidades de cuidado." },
    Ascendente: {
      intro: "En Astar, tu Ascendente refleja cómo inicias procesos y cómo te perciben al conocerte.",
    },
  },
};

function cloneDefaultConfig(): AstarContentStyleConfig {
  return JSON.parse(JSON.stringify(DEFAULT_ASTAR_CONTENT_STYLE_CONFIG)) as AstarContentStyleConfig;
}

function canUseStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined" &&
    typeof window.localStorage.getItem === "function" &&
    typeof window.localStorage.setItem === "function" &&
    typeof window.localStorage.removeItem === "function"
  );
}

function safeText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const next = value.trim();
  return next || fallback;
}

function mergeConfig(raw: unknown): AstarContentStyleConfig {
  const merged = cloneDefaultConfig();
  if (typeof raw !== "object" || raw === null) return merged;
  const input = raw as Record<string, unknown>;

  const reportTemplates = input.reportTemplates as Record<string, unknown> | undefined;
  if (reportTemplates && typeof reportTemplates === "object") {
    (Object.keys(merged.reportTemplates) as ReportStyleKey[]).forEach((key) => {
      const source = reportTemplates[key];
      if (!source || typeof source !== "object") return;
      const sourceRecord = source as Record<string, unknown>;
      merged.reportTemplates[key] = {
        intro: safeText(sourceRecord.intro, merged.reportTemplates[key].intro),
        closing: safeText(sourceRecord.closing, merged.reportTemplates[key].closing),
      };
    });
  }

  const previewTemplates = input.previewTemplates as Record<string, unknown> | undefined;
  if (previewTemplates && typeof previewTemplates === "object") {
    (Object.keys(merged.previewTemplates) as PreviewPillarKey[]).forEach((key) => {
      const source = previewTemplates[key];
      if (!source || typeof source !== "object") return;
      const sourceRecord = source as Record<string, unknown>;
      merged.previewTemplates[key] = {
        intro: safeText(sourceRecord.intro, merged.previewTemplates[key].intro),
      };
    });
  }

  return merged;
}

export function getAstarContentStyleConfig(): AstarContentStyleConfig {
  if (inMemoryConfig) return inMemoryConfig;
  if (!canUseStorage()) {
    inMemoryConfig = cloneDefaultConfig();
    return inMemoryConfig;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    inMemoryConfig = raw ? mergeConfig(JSON.parse(raw)) : cloneDefaultConfig();
    return inMemoryConfig;
  } catch {
    inMemoryConfig = cloneDefaultConfig();
    return inMemoryConfig;
  }
}

export function saveAstarContentStyleConfig(config: AstarContentStyleConfig): void {
  const merged = mergeConfig(config);
  inMemoryConfig = merged;
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export function resetAstarContentStyleConfig(): void {
  inMemoryConfig = cloneDefaultConfig();
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export async function hydrateAstarContentStyleConfigFromPublicApi(): Promise<AstarContentStyleConfig> {
  const remote = await apiGetContentStyleConfig().catch(() => null);
  if (!remote) return getAstarContentStyleConfig();
  const merged = mergeConfig(remote);
  saveAstarContentStyleConfig(merged);
  return merged;
}

export async function hydrateAstarContentStyleConfigFromAdminApi(): Promise<AstarContentStyleConfig> {
  const remote = await adminGetContentStyleConfig().catch(() => null);
  if (!remote) return getAstarContentStyleConfig();
  const merged = mergeConfig(remote);
  saveAstarContentStyleConfig(merged);
  return merged;
}

export async function saveAstarContentStyleConfigToAdminApi(
  config: AstarContentStyleConfig,
): Promise<AstarContentStyleConfig> {
  const merged = mergeConfig(config);
  saveAstarContentStyleConfig(merged);
  const remote = await adminUpdateContentStyleConfig(merged).catch(() => null);
  if (!remote) return merged;
  const synced = mergeConfig(remote);
  saveAstarContentStyleConfig(synced);
  return synced;
}
