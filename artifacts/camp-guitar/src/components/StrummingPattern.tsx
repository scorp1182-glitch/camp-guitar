interface Props {
  pattern: ("D" | "U" | "-")[];
  currentBeat: number;
  isPlaying: boolean;
}

export function StrummingPattern({ pattern, currentBeat, isPlaying }: Props) {
  const beatInPattern = currentBeat % pattern.length;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
        Strumming Pattern
      </h3>
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {pattern.map((beat, i) => {
          const isActive = isPlaying && i === beatInPattern;
          const isDown = beat === "D";
          const isUp = beat === "U";
          const isMuted = beat === "-";

          return (
            <div
              key={i}
              className={`relative flex flex-col items-center justify-center w-8 h-11 rounded-lg border-2 transition-all duration-75 ${
                isActive
                  ? isDown
                    ? "border-amber-400 bg-amber-400/20 scale-110"
                    : isUp
                    ? "border-blue-400 bg-blue-400/20 scale-110"
                    : "border-slate-600 bg-slate-700/50"
                  : "border-slate-700 bg-slate-800/50"
              }`}
            >
              {isMuted ? (
                <span className={`text-xs font-bold ${isActive ? "text-slate-400" : "text-slate-600"}`}>·</span>
              ) : (
                <>
                  <span
                    className={`text-base font-black leading-none transition-colors ${
                      isActive ? (isDown ? "text-amber-400" : "text-blue-400") : "text-slate-600"
                    }`}
                  >
                    {isDown ? "↓" : "↑"}
                  </span>
                  <span
                    className={`text-[8px] font-bold mt-0.5 transition-colors ${
                      isActive ? (isDown ? "text-amber-300" : "text-blue-300") : "text-slate-700"
                    }`}
                  >
                    {isDown ? "D" : "U"}
                  </span>
                </>
              )}
              {isActive && !isMuted && (
                <div
                  className={`absolute inset-0 rounded-md opacity-20 animate-ping ${
                    isDown ? "bg-amber-400" : "bg-blue-400"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 text-[10px] text-slate-600">
        <span className="flex items-center gap-1"><span className="text-amber-400">↓</span> Down</span>
        <span className="flex items-center gap-1"><span className="text-blue-400">↑</span> Up</span>
        <span className="flex items-center gap-1"><span className="text-slate-600">·</span> Rest</span>
      </div>
    </div>
  );
}
