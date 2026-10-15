# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## CampGuitar App

**Artifact**: `artifacts/camp-guitar` (react-vite, preview path `/`)

A karaoke-style guitar teaching app for beginners. Features:
- 20 songs (Hindi + English) with full lyrics
- 4 chords: G, D, Em, C — with interactive SVG chord diagrams
- Real-time beat-synced strumming pattern with up/down arrow highlights
- Built-in adjustable metronome (40–200 BPM)
- Progress bar + lyric scrolling synchronized to the beat
- Banner ads (top + bottom) and reward ad after each completed song
- Fully frontend-only (no backend needed)

**Key files**:
- `src/data/songs.ts` — all 20 songs with lyrics, chords, BPM, strumming patterns
- `src/data/chords.ts` — chord finger position data for G, D, Em, C
- `src/components/ChordDiagram.tsx` — SVG chord diagram with active state glow
- `src/components/StrummingPattern.tsx` — animated strum direction display
- `src/components/Metronome.tsx` — beat dots + BPM slider
- `src/components/LyricDisplay.tsx` — scrolling lyric view with chord markers
- `src/components/AdBanner.tsx` — top/bottom banner ads
- `src/components/RewardAd.tsx` — full-screen reward ad after song completion
- `src/pages/SongList.tsx` — song selection screen
- `src/pages/Player.tsx` — main player with all features integrated
