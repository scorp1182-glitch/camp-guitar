export type ChordName = "G" | "D" | "Em" | "C";

export interface FretPosition {
  string: number;
  fret: number;
  finger: number;
}

export interface ChordData {
  name: ChordName;
  fullName: string;
  positions: FretPosition[];
  openStrings: number[];
  mutedStrings: number[];
  baseFret: number;
}

export const chords: Record<ChordName, ChordData> = {
  G: {
    name: "G",
    fullName: "G Major",
    baseFret: 1,
    openStrings: [1, 2],
    mutedStrings: [],
    positions: [
      { string: 6, fret: 3, finger: 2 },
      { string: 5, fret: 2, finger: 1 },
      { string: 1, fret: 3, finger: 3 },
    ],
  },
  D: {
    name: "D",
    fullName: "D Major",
    baseFret: 1,
    openStrings: [4],
    mutedStrings: [6, 5],
    positions: [
      { string: 3, fret: 2, finger: 1 },
      { string: 1, fret: 2, finger: 2 },
      { string: 2, fret: 3, finger: 3 },
    ],
  },
  Em: {
    name: "Em",
    fullName: "E Minor",
    baseFret: 1,
    openStrings: [1, 2, 3, 4],
    mutedStrings: [],
    positions: [
      { string: 5, fret: 2, finger: 2 },
      { string: 4, fret: 2, finger: 3 },
    ],
  },
  C: {
    name: "C",
    fullName: "C Major",
    baseFret: 1,
    openStrings: [1, 2],
    mutedStrings: [6],
    positions: [
      { string: 2, fret: 1, finger: 1 },
      { string: 4, fret: 2, finger: 2 },
      { string: 5, fret: 3, finger: 3 },
    ],
  },
};
