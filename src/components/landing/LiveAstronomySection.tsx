import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as Astronomy from "astronomy-engine";
import { MoonStar, Orbit, Satellite } from "lucide-react";

type PlanetRow = {
  name: string;
  longitude: number;
  zodiac: string;
};

const ZODIAC = [
  "Aries",
  "Tauro",
  "Geminis",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Escorpio",
  "Sagitario",
  "Capricornio",
  "Acuario",
  "Piscis",
];

const PLANETS: Array<{ label: string; body: Astronomy.Body }> = [
  { label: "Mercurio", body: Astronomy.Body.Mercury },
  { label: "Venus", body: Astronomy.Body.Venus },
  { label: "Marte", body: Astronomy.Body.Mars },
  { label: "Jupiter", body: Astronomy.Body.Jupiter },
  { label: "Saturno", body: Astronomy.Body.Saturn },
  { label: "Urano", body: Astronomy.Body.Uranus },
  { label: "Neptuno", body: Astronomy.Body.Neptune },
  { label: "Pluton", body: Astronomy.Body.Pluto },
];

function normalizeLongitude(value: number): number {
  const mod = value % 360;
  return mod < 0 ? mod + 360 : mod;
}

function zodiacFromLongitude(longitude: number): string {
  const index = Math.floor(normalizeLongitude(longitude) / 30) % 12;
  return ZODIAC[index];
}

function phaseNameFromAngle(phaseAngle: number): string {
  const angle = normalizeLongitude(phaseAngle);
  if (angle < 22.5 || angle >= 337.5) return "Luna nueva";
  if (angle < 67.5) return "Luna creciente";
  if (angle < 112.5) return "Cuarto creciente";
  if (angle < 157.5) return "Gibosa creciente";
  if (angle < 202.5) return "Luna llena";
  if (angle < 247.5) return "Gibosa menguante";
  if (angle < 292.5) return "Cuarto menguante";
  return "Luna menguante";
}

function formatDegrees(value: number): string {
  return `${normalizeLongitude(value).toFixed(2)}°`;
}

function calculateSnapshot(now: Date): {
  planets: PlanetRow[];
  moonLongitude: number;
  moonZodiac: string;
  moonPhaseName: string;
  moonIlluminationPct: number;
} {
  const planets = PLANETS.map((planet) => {
    const vector = Astronomy.GeoVector(planet.body, now, true);
    const ecliptic = Astronomy.Ecliptic(vector);
    return {
      name: planet.label,
      longitude: ecliptic.elon,
      zodiac: zodiacFromLongitude(ecliptic.elon),
    };
  });

  const moonVector = Astronomy.GeoVector(Astronomy.Body.Moon, now, true);
  const moonEcliptic = Astronomy.Ecliptic(moonVector);
  const phaseAngle = Astronomy.MoonPhase(now);
  const moonIlluminationPct = ((1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2) * 100;

  return {
    planets,
    moonLongitude: moonEcliptic.elon,
    moonZodiac: zodiacFromLongitude(moonEcliptic.elon),
    moonPhaseName: phaseNameFromAngle(phaseAngle),
    moonIlluminationPct,
  };
}

export default function LiveAstronomySection() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const data = useMemo(() => calculateSnapshot(now), [now]);

  return (
    <section className="relative py-24 px-6 border-y border-border/30">
      <div className="absolute inset-0 section-glow pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-3">Tiempo real</p>
          <h2 className="font-serif text-3xl md:text-5xl font-light mb-4">
            Posicion planetaria y <span className="text-gradient-gold italic">Luna en vivo</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Posiciones eclipticas, ubicacion actual de la Luna y fase lunar actualizadas cada minuto.
          </p>
        </motion.div>

        <div className="glass-card rounded-2xl p-6 md:p-8 premium-shadow border border-border/40">
          <div className="grid lg:grid-cols-3 gap-5 mb-6">
            <div className="rounded-xl border border-border/40 bg-background/40 p-4">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Satellite className="w-4 h-4" />
                <p className="text-xs tracking-widest uppercase">Ubicacion Luna</p>
              </div>
              <p className="text-xl font-semibold text-foreground">{data.moonZodiac}</p>
              <p className="text-sm text-muted-foreground mt-1">Longitud: {formatDegrees(data.moonLongitude)}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-background/40 p-4">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <MoonStar className="w-4 h-4" />
                <p className="text-xs tracking-widest uppercase">Fase lunar</p>
              </div>
              <p className="text-xl font-semibold text-foreground">{data.moonPhaseName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Iluminacion: {data.moonIlluminationPct.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-background/40 p-4">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Orbit className="w-4 h-4" />
                <p className="text-xs tracking-widest uppercase">Actualizado</p>
              </div>
              <p className="text-lg font-semibold text-foreground">{now.toLocaleTimeString("es-ES")}</p>
              <p className="text-sm text-muted-foreground mt-1">{now.toLocaleDateString("es-ES")}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/40 overflow-hidden">
            <div className="grid grid-cols-3 px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground border-b border-border/40 bg-background/30">
              <span>Planeta</span>
              <span className="text-center">Longitud</span>
              <span className="text-right">Signo</span>
            </div>
            <div>
              {data.planets.map((planet) => (
                <div
                  key={planet.name}
                  className="grid grid-cols-3 px-4 py-3 text-sm border-b border-border/20 last:border-0"
                >
                  <span className="text-foreground">{planet.name}</span>
                  <span className="text-center text-foreground tabular-nums">{formatDegrees(planet.longitude)}</span>
                  <span className="text-right text-primary">{planet.zodiac}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
