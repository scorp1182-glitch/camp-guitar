import { chords, type ChordName } from "@/data/chords";

interface Props {
  chord: ChordName;
  size?: "sm" | "md" | "lg";
  active?: boolean;
}

const STRING_COUNT = 6;
const FRET_COUNT = 4;
const FINGER_COLORS: Record<number, string> = {
  1: "#f97316",
  2: "#a855f7",
  3: "#22c55e",
  4: "#3b82f6",
};

export function ChordDiagram({ chord, size = "md", active = false }: Props) {
  const data = chords[chord];

  const dims = {
    sm: { w: 100, h: 120, dot: 7, strW: 11, fretH: 20, topPad: 28, leftPad: 14, fontSize: 10, labelSize: 18 },
    md: { w: 140, h: 168, dot: 10, strW: 16, fretH: 28, topPad: 38, leftPad: 20, fontSize: 13, labelSize: 24 },
    lg: { w: 180, h: 216, dot: 13, strW: 20, fretH: 36, topPad: 48, leftPad: 26, fontSize: 16, labelSize: 32 },
  }[size];

  const { w, h, dot, strW, fretH, topPad, leftPad, fontSize, labelSize } = dims;
  const gridW = strW * (STRING_COUNT - 1);
  const gridH = fretH * FRET_COUNT;

  return (
    <div
      className={`flex flex-col items-center transition-all duration-200 ${
        active ? "scale-110" : ""
      }`}
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className={`rounded-lg transition-all duration-200`}
        style={{
          filter: active
            ? "drop-shadow(0 0 12px rgba(251, 191, 36, 0.8))"
            : "none",
        }}
      >
        <rect x={0} y={0} width={w} height={h} rx={8} fill={active ? "#1a1a2e" : "#0f0f23"} />

        {/* Chord name label */}
        <text
          x={w / 2}
          y={topPad - 10}
          textAnchor="middle"
          fill={active ? "#fbbf24" : "#94a3b8"}
          fontSize={labelSize}
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          {data.name}
        </text>

        {/* Nut (top thick bar) */}
        <rect
          x={leftPad}
          y={topPad}
          width={gridW}
          height={3}
          fill={active ? "#fbbf24" : "#64748b"}
        />

        {/* Fret lines */}
        {Array.from({ length: FRET_COUNT + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={leftPad}
            y1={topPad + i * fretH}
            x2={leftPad + gridW}
            y2={topPad + i * fretH}
            stroke={active ? "#334155" : "#1e293b"}
            strokeWidth={i === 0 ? 3 : 1}
          />
        ))}

        {/* String lines */}
        {Array.from({ length: STRING_COUNT }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={leftPad + i * strW}
            y1={topPad}
            x2={leftPad + i * strW}
            y2={topPad + gridH}
            stroke={active ? "#475569" : "#1e293b"}
            strokeWidth={1}
          />
        ))}

        {/* Muted strings (X) */}
        {data.mutedStrings.map((s) => {
          const x = leftPad + (STRING_COUNT - s) * strW;
          const y = topPad - 12;
          return (
            <text
              key={`muted-${s}`}
              x={x}
              y={y}
              textAnchor="middle"
              fill="#ef4444"
              fontSize={fontSize}
              fontWeight="bold"
            >
              ×
            </text>
          );
        })}

        {/* Open strings (O) */}
        {data.openStrings.map((s) => {
          const x = leftPad + (STRING_COUNT - s) * strW;
          const y = topPad - 12;
          return (
            <text
              key={`open-${s}`}
              x={x}
              y={y}
              textAnchor="middle"
              fill={active ? "#86efac" : "#64748b"}
              fontSize={fontSize}
            >
              ○
            </text>
          );
        })}

        {/* Finger dots */}
        {data.positions.map(({ string, fret, finger }) => {
          const x = leftPad + (STRING_COUNT - string) * strW;
          const y = topPad + (fret - 0.5) * fretH;
          const color = active ? FINGER_COLORS[finger] : "#64748b";
          return (
            <g key={`pos-${string}-${fret}`}>
              <circle cx={x} cy={y} r={dot} fill={color} />
              <text
                x={x}
                y={y + fontSize * 0.4}
                textAnchor="middle"
                fill="white"
                fontSize={fontSize * 0.75}
                fontWeight="bold"
              >
                {finger}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
