import { useEffect } from "react";

interface Props {
  position?: "top" | "bottom";
}

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function AdBanner({ position = "bottom" }: Props) {
  const adConfig = import.meta.env as ImportMetaEnv & {
    readonly VITE_ADSENSE_CLIENT?: string;
    readonly VITE_ADSENSE_TOP_SLOT?: string;
    readonly VITE_ADSENSE_BOTTOM_SLOT?: string;
  };
  const clientId = adConfig.VITE_ADSENSE_CLIENT?.trim();
  const slotId = (
    position === "top"
      ? adConfig.VITE_ADSENSE_TOP_SLOT
      : adConfig.VITE_ADSENSE_BOTTOM_SLOT
  )?.trim();
  const isConfigured = Boolean(clientId && slotId);

  useEffect(() => {
    if (!clientId || !slotId) return;

    if (!document.querySelector('script[data-campguitar-adsense="true"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.campguitarAdsense = "true";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
      document.head.appendChild(script);
    }

    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  }, [clientId, slotId]);

  return (
    <aside
      aria-label={`${position === "top" ? "Top" : "Bottom"} advertisement`}
      className={`flex w-full shrink-0 items-center justify-center border-slate-800 bg-slate-900/80 px-3 ${
        position === "top" ? "border-b" : "border-t"
      }`}
    >
      {isConfigured ? (
        <ins
          className="adsbygoogle block min-h-[50px] w-full max-w-[970px] sm:min-h-[90px]"
          style={{ display: "block" }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex min-h-[50px] items-center justify-center gap-2 text-center text-[10px] text-slate-500 sm:min-h-[70px]">
          <span className="rounded border border-slate-700 px-1.5 py-0.5 font-bold uppercase tracking-wider">
            Ad
          </span>
          <span>Google AdSense slot · configure publisher and slot IDs to show ads</span>
        </div>
      )}
    </aside>
  );
}
