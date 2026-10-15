# CampGuitar SEO plan

## Current baseline

- CampGuitar is a React/Vite single-page app. A deployment record exists, but the latest build failed its startup health check and the public app URL currently returns 404.
- The intended custom domain is `https://www.campguitar.com`; the user plans to connect it, but deployment metadata does not list it yet.
- The song catalogue has 20 English and Hindi entries. The app offers four chord shapes, chord timing, strumming patterns, a tempo control, and an optional metronome.
- Before this work, the page had only a brand title, no search description, no crawl files, and no stable URL for individual songs.
- Search results reviewed on 13 October 2026 include Hindi beginner-song lessons and English beginner song lists. They commonly offer static chord lists; CampGuitar can stand out with an interactive, beat-synced player.
- No search-volume estimates or Search Console data are available yet. Treat the terms below as hypotheses to validate, not ranking guarantees.

## Search intent and page targets

| Page | Search intent | Initial keyword themes |
| --- | --- | --- |
| Home | Find an easy guitar practice tool | easy Hindi and English guitar songs; beginner guitar songs with chords |
| Song-guide hub | Browse songs suitable for guitar practice | Hindi guitar songs chords for beginners; easy English songs to play on guitar |
| Individual song guide | Learn one named song | `[song title] guitar chords`; `[song title] guitar strumming pattern` |
| Product feature copy | Practice timing and rhythm | guitar practice metronome; guitar chords with beat-synced lyrics |

## Implemented in code

1. Added a keyword-focused home title, description, Open Graph/Twitter metadata, and WebSite/WebApplication JSON-LD.
2. Added a static song-guide hub and one pre-rendered HTML guide per catalogue entry. Pages are generated from `src/data/songs.ts`, so chord, tempo, and pattern details stay aligned with the player.
3. Added direct player links (`?song=<id>`), guide-to-guide internal links, an accessible guide link from the home page, and dynamic browser titles when a song is opened.
4. Added `robots.txt` and a sitemap generator. The sitemap, canonical URLs, and absolute social image URLs are emitted only when `VITE_SITE_URL` is configured.
5. Made Google Fonts non-blocking and reused the existing CampGuitar social image.

The SEO guide pages intentionally use song titles, chord patterns, tempo, and practice instructions rather than copying lyrics.

## Release and growth priorities

### P0 — Establish the canonical site URL

The latest three publishing attempts built the app successfully but failed while the Autoscale service was checking `GET /`. The CampGuitar artifact is configured to serve static files, while the workspace publishing target is currently Autoscale. For this frontend-only website, select Static in Publishing settings and retry. If the health check still fails, inspect the static `publicDir` and rewrite mapping.

After a healthy publish and once `www.campguitar.com` is connected, set production `VITE_SITE_URL` to the verified canonical URL. Rebuild and verify `/robots.txt`, `/sitemap.xml`, canonical tags, and the sitemap’s 22 public URLs (home, hub, and 20 song pages). Submit the sitemap in Google Search Console.

### P1 — Strengthen useful song content

- Add original, song-specific teaching notes: chord transitions that need practice, suggested strum feel, and common beginner mistakes.
- Verify each arrangement’s chords and tempo before expanding copy.
- Keep pages distinct and useful; do not add keyword-stuffed text or reproduce full lyrics.
- Consider separate Hindi and English guide indexes if learners need language-specific browsing.

### P2 — Measure and iterate

- Set up Google Search Console for the published domain.
- Track indexed guide pages, impressions/clicks by query, click-through rate, and visits that open the player.
- Use Search Console queries to replace weak keyword assumptions with actual search language.
- Run Lighthouse/PageSpeed on mobile and address Core Web Vitals before adding heavier content.

## Research references

- [Guitar World — easy guitar songs for beginners](https://www.guitarworld.com/features/10-easy-guitar-songs-for-beginners)
- [Spardha — easy Bollywood guitar songs](https://www.spardhaschoolofmusic.com/blog/easy-guitar-songs-bollywood)
- [Music Pandit — Hindi guitar songs and chords](https://www.musicpandit.com/blog/10-best-guitar-keys-of-hindi-songs)

