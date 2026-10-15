import { useEffect, useState } from "react";
import { SongList } from "@/pages/SongList";
import { Player } from "@/pages/Player";
import { songs } from "@/data/songs";

const HOME_TITLE = "Easy Hindi & English Guitar Songs | CampGuitar";
const HOME_DESCRIPTION =
  "Practice beginner guitar songs in Hindi and English with four chords, chord diagrams, timed lyrics, strumming patterns, and an adjustable metronome.";

function getSongIdFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  const songId = new URLSearchParams(window.location.search).get("song");
  return songId && songs.some((song) => song.id === songId) ? songId : null;
}

function setSongQuery(songId: string | null) {
  const url = new URL(window.location.href);
  if (songId) {
    url.searchParams.set("song", songId);
  } else {
    url.searchParams.delete("song");
  }
  window.history.pushState({ songId }, "", `${url.pathname}${url.search}${url.hash}`);
}

function App() {
  const [selectedSongId, setSelectedSongId] = useState<string | null>(
    getSongIdFromLocation,
  );

  useEffect(() => {
    const handlePopState = () => setSelectedSongId(getSongIdFromLocation());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const song = songs.find((item) => item.id === selectedSongId);
    document.title = song
      ? `${song.title} Guitar Chords | CampGuitar`
      : HOME_TITLE;

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (description) {
      description.content = song
        ? `Practice ${song.title} with chord changes, a ${song.bpm} BPM starting tempo, and an adjustable metronome in CampGuitar.`
        : HOME_DESCRIPTION;
    }
  }, [selectedSongId]);

  const selectSong = (songId: string) => {
    setSongQuery(songId);
    setSelectedSongId(songId);
  };

  const goBackToSongs = () => {
    setSongQuery(null);
    setSelectedSongId(null);
  };

  return (
    <div className="font-sans antialiased">
      {selectedSongId ? (
        <Player songId={selectedSongId} onBack={goBackToSongs} />
      ) : (
        <SongList onSelect={selectSong} />
      )}
    </div>
  );
}

export default App;
