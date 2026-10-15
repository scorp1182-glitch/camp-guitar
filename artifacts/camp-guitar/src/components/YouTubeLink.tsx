interface Props {
  songTitle: string;
  iconOnly?: boolean;
}

export function YouTubeLink({ songTitle, iconOnly = false }: Props) {
  const search = new URLSearchParams({ search_query: `${songTitle} song` });

  return (
    <a
      href={`https://www.youtube.com/results?${search.toString()}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Listen to ${songTitle} on YouTube, opens in a new tab`}
      title={`Listen to ${songTitle} on YouTube`}
      className={`inline-flex shrink-0 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
        iconOnly
          ? "h-10 w-10 rounded-xl border border-slate-700 bg-slate-800/70 text-rose-400 hover:border-rose-400/50 hover:bg-slate-700"
          : "gap-1.5 rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-2 text-xs font-semibold text-slate-300 hover:border-rose-400/50 hover:text-white"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 text-rose-400"
      >
        <path
          fill="currentColor"
          d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8Z"
        />
        <path fill="#fff" d="m9.6 15.7 6.2-3.7-6.2-3.7v7.4Z" />
      </svg>
      {!iconOnly && <span>Listen</span>}
    </a>
  );
}
