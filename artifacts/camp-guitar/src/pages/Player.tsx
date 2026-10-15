import { useState, useEffect, useRef, useCallback } from "react";
import { songs, type Chord } from "@/data/songs";
import { ChordDiagram } from "@/components/ChordDiagram";
import { StrummingPattern } from "@/components/StrummingPattern";
import { Metronome } from "@/components/Metronome";
import { LyricDisplay } from "@/components/LyricDisplay";
import { AdBanner } from "@/components/AdBanner";
import { YouTubeLink } from "@/components/YouTubeLink";

interface Props {
  songId: string;
  onBack: () => void;
}

export function Player({ songId, onBack }: Props) {
  const song = songs.find((s) => s.id === songId)!;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [bpm, setBpm] = useState(song.bpm);
  const [clickEnabled, setClickEnabled] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatRef = useRef(0);
  const clickEnabledRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const totalBeats = song.lines[song.lines.length - 1].beat + song.timeSignature * 4;

  const getCurrentLineIndex = (beat: number) => {
    let idx = 0;
    for (let i = 0; i < song.lines.length; i++) {
      if (song.lines[i].beat <= beat) idx = i;
    }
    return idx;
  };

  const currentLineIndex = getCurrentLineIndex(currentBeat);
  const currentLine = song.lines[currentLineIndex];
  const currentChord: Chord = currentLine.chord;
  const nextLine = song.lines[currentLineIndex + 1];
  const nextChord: Chord | null = nextLine ? nextLine.chord : null;

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined" || !window.AudioContext) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playMetronomeClick = useCallback((beatInMeasure: number) => {
    if (!clickEnabledRef.current) return;
    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state !== "running") return;

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const isDownbeat = beatInMeasure === 0;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(isDownbeat ? 1320 : 880, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(isDownbeat ? 0.18 : 0.12, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.06);
  }, []);

  const ensureAudioReady = useCallback(
    (onReady: () => void) => {
      const audioContext = getAudioContext();
      if (!audioContext) return;
      if (audioContext.state === "suspended") {
        void audioContext.resume().then(onReady);
      } else {
        onReady();
      }
    },
    [getAudioContext],
  );

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startPlayback = useCallback(() => {
    setIsPlaying(true);
    if (clickEnabledRef.current) {
      ensureAudioReady(() => {
        playMetronomeClick(beatRef.current % song.timeSignature);
      });
    }
  }, [ensureAudioReady, playMetronomeClick, song.timeSignature]);

  const reset = useCallback(() => {
    stopPlayback();
    beatRef.current = 0;
    setCurrentBeat(0);
    setCompleted(false);
  }, [stopPlayback]);

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      if (completed) reset();
      startPlayback();
    }
  };

  const toggleClick = () => {
    const nextEnabled = !clickEnabledRef.current;
    clickEnabledRef.current = nextEnabled;
    setClickEnabled(nextEnabled);

    if (nextEnabled) {
      const audioContext = getAudioContext();
      if (isPlaying && audioContext) {
        ensureAudioReady(() => {
          playMetronomeClick(beatRef.current % song.timeSignature);
        });
      }
    }
  };

  const advanceBeat = useCallback(() => {
    beatRef.current += 1;
    const nextBeat = beatRef.current;
    setCurrentBeat(nextBeat);

    if (nextBeat < totalBeats) {
      playMetronomeClick(nextBeat % song.timeSignature);
      return;
    }

    setIsPlaying(false);
    setCompleted(true);
  }, [playMetronomeClick, song.timeSignature, totalBeats]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(advanceBeat, (60 / bpm) * 1000);
    intervalRef.current = interval;
    return () => {
      clearInterval(interval);
      if (intervalRef.current === interval) intervalRef.current = null;
    };
  }, [advanceBeat, bpm, isPlaying]);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close();
      }
    },
    [],
  );

  const patternBeat = currentBeat % song.strummingPattern.length;
  const progress = Math.min(100, (currentBeat / totalBeats) * 100);

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-slate-950 text-white flex flex-col overflow-hidden">

      {/* Top ad — compact */}
      <AdBanner position="top" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 shrink-0">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors text-sm font-medium px-2 py-1"
        >
          ← Songs
        </button>
        <div className="text-center max-w-[55%]">
          <div className="font-bold text-white text-sm leading-tight truncate">{song.title}</div>
          <div className="text-[11px] text-slate-500">{song.language}</div>
        </div>
        <YouTubeLink songTitle={song.title} />
      </div>

      {/* ── CHORD AREA ── */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 shrink-0">
        {/* Current chord */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Now</span>
          <ChordDiagram chord={currentChord} size="sm" active={isPlaying} />
        </div>

        {/* Divider + next chord */}
        {nextChord && nextChord !== currentChord ? (
          <>
            <div className="text-slate-700 text-2xl font-thin">→</div>
            <div className="flex flex-col items-center gap-0.5 opacity-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next</span>
              <ChordDiagram chord={nextChord} size="sm" active={false} />
            </div>
          </>
        ) : (
          <div className="w-24" />
        )}
      </div>

      {/* ── LYRICS ── flexible height */}
      <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <LyricDisplay lines={song.lines} currentLineIndex={currentLineIndex} />
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-1 shrink-0">
        <div className="w-full h-1 rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── STRUMMING PATTERN ── */}
      <div className="px-3 py-2 border-t border-slate-800/60 shrink-0">
        <StrummingPattern
          pattern={song.strummingPattern}
          currentBeat={patternBeat}
          isPlaying={isPlaying}
        />
      </div>

      {/* ── METRONOME + CONTROLS ── */}
      <div className="px-4 pt-2 pb-2 border-t border-slate-800/60 bg-slate-900/40 shrink-0">
        <Metronome
          bpm={bpm}
          defaultBpm={song.bpm}
          onBpmChange={setBpm}
          onBpmReset={() => setBpm(song.bpm)}
          currentBeat={currentBeat}
          timeSignature={song.timeSignature}
          isPlaying={isPlaying}
          clickEnabled={clickEnabled}
          onClickToggle={toggleClick}
        />

        <div className="flex items-center justify-center gap-5 mt-3">
          <button
            onClick={reset}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            title="Restart"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black transition-all shadow-lg ${
              isPlaying
                ? "bg-slate-700 hover:bg-slate-600 text-white shadow-slate-700/40"
                : "bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-amber-500/40"
            }`}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            title="Song list"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom ad */}
      <AdBanner position="bottom" />

      {/* Reward ad overlay */}
    </div>
  );
}
