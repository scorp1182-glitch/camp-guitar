interface Props {
  bpm: number;
  defaultBpm: number;
  onBpmChange: (bpm: number) => void;
  onBpmReset: () => void;
  currentBeat: number;
  timeSignature: 4 | 3;
  isPlaying: boolean;
  clickEnabled: boolean;
  onClickToggle: () => void;
}

export function Metronome({
  bpm,
  defaultBpm,
  onBpmChange,
  onBpmReset,
  currentBeat,
  timeSignature,
  isPlaying,
  clickEnabled,
  onClickToggle,
}: Props) {
  const beatInMeasure = currentBeat % timeSignature;
  const dots = Array.from({ length: timeSignature }, (_, i) => i);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-4">
        {/* Beat dots */}
        <div className="flex items-center gap-2">
          {dots.map((i) => {
            const isActive = isPlaying && i === beatInMeasure;
            const isAccent = i === 0;
            return (
              <div
                key={i}
                className={`rounded-full transition-all duration-75 ${
                  isActive
                    ? isAccent
                      ? "w-4 h-4 bg-amber-400 shadow-lg shadow-amber-400/60"
                      : "w-3.5 h-3.5 bg-green-400 shadow-lg shadow-green-400/60"
                    : isAccent
                    ? "w-3.5 h-3.5 bg-slate-700"
                    : "w-3 h-3 bg-slate-800"
                }`}
              />
            );
          })}
        </div>

        {/* BPM */}
        <div className="text-center">
          <div className="text-xl font-black text-white tabular-nums leading-none">{bpm}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest">BPM</div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={clickEnabled}
          aria-label={`Metronome click ${clickEnabled ? "on" : "off"}`}
          onClick={onClickToggle}
          className={`flex items-center gap-2 rounded-full border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            clickEnabled
              ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
              : "border-slate-700 bg-slate-800/70 text-slate-400 hover:text-white"
          }`}
        >
          <svg
            aria-hidden="true"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            {clickEnabled && <path d="M15.5 8.5a5 5 0 0 1 0 7" />}
            {clickEnabled && <path d="M19 5a10 10 0 0 1 0 14" />}
            {!clickEnabled && <path d="m16 9 5 6m0-6-5 6" />}
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Click {clickEnabled ? "on" : "off"}
          </span>
        </button>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <span className="text-[10px] text-slate-600 w-6 text-right">40</span>
        <input
          type="range"
          min={40}
          max={200}
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
          aria-label="Tempo in beats per minute"
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${((bpm - 40) / 160) * 100}%, #1e293b ${((bpm - 40) / 160) * 100}%, #1e293b 100%)`,
          }}
        />
        <span className="text-[10px] text-slate-600 w-6">200</span>
        <button
          type="button"
          onClick={onBpmReset}
          disabled={bpm === defaultBpm}
          aria-label={`Reset tempo to ${defaultBpm} BPM`}
          title={`Reset to ${defaultBpm} BPM`}
          className="rounded-md border border-slate-700 px-2 py-1 text-[10px] font-semibold text-slate-300 transition-colors hover:border-amber-400/50 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:text-slate-300"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
