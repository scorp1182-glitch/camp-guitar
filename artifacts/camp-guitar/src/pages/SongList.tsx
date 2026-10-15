import { songs } from "@/data/songs";
import { AdBanner } from "@/components/AdBanner";
import { YouTubeLink } from "@/components/YouTubeLink";

interface Props {
  onSelect: (id: string) => void;
}

const LANG_COLOR: Record<string, string> = {
  Hindi: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  English: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Both: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export function SongList({ onSelect }: Props) {
  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white flex flex-col">
      <AdBanner position="top" />

      {/* Header */}
      <header className="px-6 pt-10 pb-6 text-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-5xl mb-3 select-none">🎸</div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
          CampGuitar
        </p>
        <h1 className="text-3xl font-black tracking-tight text-white mb-1">
          Easy Guitar Songs in Hindi &amp; English
        </h1>
        <p className="text-slate-400 text-base">
          Learn four chords with chord diagrams, timed lyrics, strumming patterns, and an adjustable metronome.
        </p>

        {/* Chord badges */}
        <div className="flex justify-center gap-3 mt-5">
          {(["G", "D", "Em", "C"] as const).map((ch) => (
            <div
              key={ch}
              className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-black text-amber-400"
            >
              {ch}
            </div>
          ))}
        </div>
        <p className="text-slate-600 text-xs mt-2">Just these four chords — start playing right away.</p>
        <a
          href={`${import.meta.env.BASE_URL}songs/`}
          className="mt-4 inline-flex items-center gap-1 rounded-full border border-amber-400/30 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:border-amber-300 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Browse song guides <span aria-hidden="true">→</span>
        </a>
      </header>

      {/* Song list */}
      <main className="flex-1 px-4 pb-6 max-w-2xl mx-auto w-full">
        <section aria-labelledby="song-list-heading">
          <h2
            id="song-list-heading"
            className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1"
          >
            {songs.length} Songs to Play
          </h2>
          <div className="flex flex-col gap-2">
            {songs.map((song, idx) => (
              <div
                key={song.id}
                className="group flex w-full items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2.5 transition-all hover:border-amber-400/40 hover:bg-slate-800/80"
              >
                <button
                  type="button"
                  onClick={() => onSelect(song.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-bold text-slate-500 transition-colors group-hover:border-amber-400/50 group-hover:text-amber-400">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white transition-colors group-hover:text-amber-100">
                      {song.title}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {song.bpm} BPM &bull; {song.timeSignature}/4 time
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        LANG_COLOR[song.language]
                      }`}
                    >
                      {song.language}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-lg text-slate-600 transition-colors group-hover:text-amber-400"
                    >
                      →
                    </span>
                  </span>
                </button>
                <YouTubeLink songTitle={song.title} iconOnly />
              </div>
            ))}
          </div>
        </section>

      {/* Bottom tip */}
        <p className="pt-5 text-center text-xs text-slate-500">
          Select a song to open its chord and strumming guide.
        </p>
      </main>

      <AdBanner position="bottom" />
    </div>
  );
}
