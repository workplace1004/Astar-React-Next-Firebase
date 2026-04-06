export type ServiceItem = {
  id: string;
  title: string;
  meta?: string;
  paragraphs: string[];
  priceGuestUsd: number;
  priceSubUsd: number;
};

export const EXTRA_SERVICES: ServiceItem[] = [
  {
    id: "momento-actual",
    title: "Lectura de tu momento actual + preguntas",
    meta: "Aproximadamente 60 minutos en vivo. Chat escrito con Carlos desde tu portal.",
    paragraphs: [
      "Comprendé qué está pasando en tu vida ahora y por qué. Además, vas a poder hacer preguntas en vivo por chat conmigo, para profundizar y llevar claridad a lo que realmente te está moviendo.",
    ],
    priceGuestUsd: 210,
    priceSubUsd: 105,
  },
  {
    id: "energia-interna",
    title: "Tu energía interna vs la que estás mostrando",
    paragraphs: [
      "Descubrí la diferencia entre quién sos por dentro y lo que estás expresando hacia afuera. Ideal para entender bloqueos, incoherencias y empezar a alinearte.",
    ],
    priceGuestUsd: 110,
    priceSubUsd: 55,
  },
  {
    id: "tomar-decision",
    title: "Tomar una decisión",
    meta: "Se envía un informe escrito y se puede volver a preguntar alguna duda vía chat.",
    paragraphs: [
      "Si estás frente a una decisión importante, te ayudo a ver qué la está condicionando y desde dónde estás eligiendo. Más claridad para decidir con conciencia.",
    ],
    priceGuestUsd: 110,
    priceSubUsd: 55,
  },
  {
    id: "movimientos-6m",
    title: "Tus próximos movimientos — 6 meses",
    meta: "Se envía un informe escrito y se puede volver a preguntar alguna duda vía chat.",
    paragraphs: [
      "Interpretación de las energías que se están activando en tu vida en el corto plazo, para que entiendas hacia dónde te estás moviendo y cómo acompañarlo.",
    ],
    priceGuestUsd: 180,
    priceSubUsd: 90,
  },
  {
    id: "movimientos-12m",
    title: "Tus próximos movimientos — 12 meses",
    meta: "Se envía un informe escrito y se puede volver a preguntar alguna duda vía chat.",
    paragraphs: [
      "Una mirada más amplia de tu proceso. Entender el ciclo activo y cómo puede influir en tus decisiones.",
    ],
    priceGuestUsd: 230,
    priceSubUsd: 115,
  },
  {
    id: "audio-personalizado",
    title: "Audio personalizado de lo que necesites",
    meta: "Audio explicativo para escuchar o descargar desde tu portal.",
    paragraphs: [
      "Una respuesta en audio, clara y profunda, sobre cualquier duda que tengas: puede ser sobre tu carta astral, revolución solar, numerología o una pregunta puntual de tu vida. Recibís una interpretación personalizada para entender qué está pasando y cómo abordarlo.",
    ],
    priceGuestUsd: 50,
    priceSubUsd: 25,
  },
  {
    id: "carta-vivo",
    title: "Lectura en vivo de tu carta astral",
    meta: "Lectura por videollamada.",
    paragraphs: [
      "En esta sesión conocerás en profundidad los aspectos más importantes de tu carta astral y cómo se reflejan en tu vida. Te conocerás más a nivel personal, entendiendo tus rasgos, tu forma de pensar y de actuar. Comprenderás cómo se manifiestan tus vínculos, tus decisiones y tus experiencias a lo largo del tiempo. Podrás ver qué áreas de tu vida tienen mayor potencial y cuáles requieren más atención. Identificarás patrones que se repiten y el sentido detrás de ellos. Y mucho más… Una interpretación clara y personalizada para que puedas entenderte mejor y ver tu vida con otra perspectiva.",
    ],
    priceGuestUsd: 540,
    priceSubUsd: 270,
  },
  {
    id: "solar-vivo",
    title: "Lectura en vivo de tu revolución solar",
    meta: "Lectura por videollamada.",
    paragraphs: [
      "En esta sesión conocerás en profundidad el ciclo que estás atravesando en este año y cómo se refleja en tu vida. Comprenderás qué energías se activan durante este período y cómo pueden influir en tus decisiones. Verás qué áreas de tu vida toman protagonismo y cuáles requieren mayor atención. Podrás anticipar momentos clave del año para aprovecharlos con mayor conciencia. Identificarás el sentido de los cambios y procesos que estás viviendo. Y mucho más… Una interpretación clara y personalizada para que puedas transitar tu año con mayor claridad, enfoque y comprensión.",
    ],
    priceGuestUsd: 540,
    priceSubUsd: 270,
  },
  {
    id: "tres-preguntas",
    title: "3 preguntas (respondo integrando todas mis herramientas)",
    meta: "Se envía un informe escrito y se puede volver a preguntar alguna duda vía chat.",
    paragraphs: [
      "Respuestas profundas a tus preguntas, integrando astrología, tarot, numerología y lectura de patrones inconscientes.",
    ],
    priceGuestUsd: 70,
    priceSubUsd: 35,
  },
];

const byId = new Map(EXTRA_SERVICES.map((s) => [s.id, s]));

export function getExtraServiceById(id: string): ServiceItem | undefined {
  return byId.get(id);
}

export function priceUsdForService(id: string, isSubscriber: boolean): number | null {
  const s = byId.get(id);
  if (!s) return null;
  return isSubscriber ? s.priceSubUsd : s.priceGuestUsd;
}
