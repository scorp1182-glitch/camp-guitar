import { type LyricLine } from "@/data/songs";

interface Props {
  lines: LyricLine[];
  currentLineIndex: number;
}

export function LyricDisplay({ lines, currentLineIndex }: Props) {
  const VISIBLE = 4;
  const start = Math.max(0, currentLineIndex - 1);
  const visible = lines.slice(start, start + VISIBLE);

  return (
    <div className="flex flex-col items-center gap-1 w-full px-4 py-1">
      {visible.map((line, i) => {
        const absoluteIndex = start + i;
        const isCurrent = absoluteIndex === currentLineIndex;
        const isPast = absoluteIndex < currentLineIndex;
        const isNext = absoluteIndex === currentLineIndex + 1;

        return (
          <div
            key={absoluteIndex}
            className={`w-full text-center transition-all duration-300 px-3 py-1 rounded-xl ${
              isCurrent
                ? "bg-amber-400/10 border border-amber-400/30"
                : isNext
                ? "bg-slate-800/30"
                : ""
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {isCurrent && (
                <span className="text-xs font-bold text-amber-400 shrink-0">[{line.chord}]</span>
              )}
              <span
                className={`font-medium leading-snug transition-all ${
                  isCurrent
                    ? "text-white text-lg sm:text-xl"
                    : isPast
                    ? "text-slate-700 text-sm line-through"
                    : isNext
                    ? "text-slate-400 text-base"
                    : "text-slate-600 text-sm"
                }`}
              >
                {line.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
