import { describe, expect, it } from "vitest";
import type { PortalReport } from "@/lib/api";
import { buildPortalInterpretation, buildPreviewDescription } from "@/lib/interpretations";
import { DEFAULT_ASTAR_CONTENT_STYLE_CONFIG } from "@/lib/contentStyleConfig";

function makeReport(content: string | null): PortalReport {
  return {
    id: "r-1",
    type: "birth_chart",
    title: "Carta Natal",
    content,
    createdAt: new Date().toISOString(),
  };
}

describe("buildPortalInterpretation", () => {
  it("normalizes sections from JSON array and keeps vendor text by default (portal)", () => {
    const report = makeReport(
      JSON.stringify({
        sections: [{ id: "s1", title: "Sol", content: "Siempre debes confiar en tu luz." }],
      }),
    );

    const result = buildPortalInterpretation(report, { reportType: "birth_chart", defaultSectionTitle: "Interpretación" });

    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].source).toBe("vendor");
    expect(result.sections[0].content).toBe("Siempre debes confiar en tu luz.");
  });

  it("applies Astar copy only when useAstarCopy is true", () => {
    const report = makeReport(
      JSON.stringify({
        sections: [{ id: "s1", title: "Sol", content: "Siempre debes confiar en tu luz." }],
      }),
    );
    const result = buildPortalInterpretation(report, {
      reportType: "birth_chart",
      defaultSectionTitle: "Interpretación",
      useAstarCopy: true,
    });

    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].source).toBe("astar");
    expect(result.sections[0].content).toContain("con frecuencia");
    expect(result.sections[0].content).toContain("puedes");
  });

  it("keeps vendor text for plain string content", () => {
    const report = makeReport("Texto del proveedor");
    const result = buildPortalInterpretation(report, {
      reportType: "solar_return",
      defaultSectionTitle: "Interpretación",
    });

    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].source).toBe("vendor");
    expect(result.sections[0].content).toBe("Texto del proveedor");
  });

  it("returns empty sections for missing content", () => {
    const result = buildPortalInterpretation(makeReport(null), { reportType: "numerology" });
    expect(result.sections).toEqual([]);
    expect(result.theme).toBeNull();
  });

  it("uses custom style templates when configured", () => {
    const customStyleConfig = {
      ...DEFAULT_ASTAR_CONTENT_STYLE_CONFIG,
      reportTemplates: {
        ...DEFAULT_ASTAR_CONTENT_STYLE_CONFIG.reportTemplates,
        birth_chart: {
          intro: "Intro personalizada.",
          closing: "Cierre para {{section}}.",
        },
      },
    };

    const report = makeReport(
      JSON.stringify({
        sections: [{ id: "s1", title: "Sol", content: "Texto base." }],
      }),
    );
    const result = buildPortalInterpretation(report, {
      reportType: "birth_chart",
      styleConfig: customStyleConfig,
      useAstarCopy: true,
    });
    expect(result.sections[0].content).toContain("Intro personalizada.");
    expect(result.sections[0].content).toContain("Cierre para sol.");
  });
});

describe("buildPreviewDescription", () => {
  it("applies astar tone for preview pillars", () => {
    const result = buildPreviewDescription("Siempre debes priorizar tu corazón.", { pillarLabel: "Luna" });

    expect(result.source).toBe("astar");
    expect(result.content).toContain("En Astar, tu Luna");
    expect(result.content).toContain("con frecuencia");
    expect(result.content).toContain("puedes");
  });

  it("returns vendor text when astar copy is disabled", () => {
    const result = buildPreviewDescription("Texto original", {
      pillarLabel: "Sol",
      useAstarCopy: false,
    });

    expect(result.source).toBe("vendor");
    expect(result.content).toBe("Texto original");
  });

  it("uses preview intro from configured templates", () => {
    const customStyleConfig = {
      ...DEFAULT_ASTAR_CONTENT_STYLE_CONFIG,
      previewTemplates: {
        ...DEFAULT_ASTAR_CONTENT_STYLE_CONFIG.previewTemplates,
        Sol: { intro: "Sol personalizado." },
      },
    };

    const result = buildPreviewDescription("Texto base", {
      pillarLabel: "Sol",
      styleConfig: customStyleConfig,
    });
    expect(result.content).toContain("Sol personalizado.");
  });
});
