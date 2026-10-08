import { useEffect, useRef, useState } from "react";
import type { LatLng, Plot } from "@/lib/plots-store";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { google?: any; __gmapsReady?: () => void } }

let loader: Promise<void> | null = null;
function loadMaps() {
  if (window.google?.maps?.Map) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    window.__gmapsReady = () => resolve();
    const env = import.meta.env as Record<string, string | undefined>;
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"]}&loading=async&libraries=geometry&callback=__gmapsReady&channel=${env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"]}`;
    s.async = true;
    s.onerror = () => reject(new Error("Falha ao carregar o mapa"));
    document.head.appendChild(s);
  });
  return loader;
}

export function areaHa(path: LatLng[]): number {
  const g = window.google;
  if (!g?.maps?.geometry || path.length < 3) return 0;
  return g.maps.geometry.spherical.computeArea(path.map((p) => new g.maps.LatLng(p.lat, p.lng))) / 10000;
}

type Props = {
  plots: Plot[];
  draft: LatLng[];
  onMapClick?: (p: LatLng) => void;
  center?: LatLng | null;
};

export function PlotMap({ plots, draft, onMapClick, center }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const overlays = useRef<any[]>([]);
  const clickRef = useRef(onMapClick);
  clickRef.current = onMapClick;
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadMaps().then(() => {
      if (!el.current || map.current) return;
      const g = window.google;
      map.current = new g.maps.Map(el.current, {
        center: plots[0]?.location ?? { lat: -15.78, lng: -47.93 }, zoom: 14,
        mapTypeId: "hybrid", clickableIcons: false, streetViewControl: false,
      });
      map.current.addListener("click", (e: any) => clickRef.current?.({ lat: e.latLng.lat(), lng: e.latLng.lng() }));
      setReady(true);
    }).catch((e) => setError(e.message));
  }, []);

  useEffect(() => { if (ready && center) { map.current.panTo(center); map.current.setZoom(16); } }, [ready, center]);

  useEffect(() => {
    if (!ready) return;
    const g = window.google;
    overlays.current.forEach((o) => o.setMap(null));
    overlays.current = [];
    for (const p of plots) {
      if (p.boundary && p.boundary.length >= 3)
        overlays.current.push(new g.maps.Polygon({ map: map.current, paths: p.boundary, strokeColor: "#4ade80", fillColor: "#4ade80", fillOpacity: 0.2, strokeWeight: 2, clickable: false }));
      if (p.location)
        overlays.current.push(new g.maps.Marker({ map: map.current, position: p.location, title: p.name, label: { text: p.id, color: "#fff", fontSize: "11px" } }));
    }
    if (draft.length) {
      overlays.current.push(new g.maps.Polygon({ map: map.current, paths: draft, strokeColor: "#38bdf8", fillColor: "#38bdf8", fillOpacity: 0.3, strokeWeight: 2, clickable: false }));
      draft.forEach((pt) => overlays.current.push(new g.maps.Marker({ map: map.current, position: pt, clickable: false,
        icon: { path: g.maps.SymbolPath.CIRCLE, scale: 5, fillColor: "#38bdf8", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 } })));
    }
  }, [ready, plots, draft]);

  return (
    <div className="relative h-[420px] overflow-hidden rounded-xl border bg-muted">
      <div ref={el} className="h-full w-full" />
      {!ready && <div className="absolute inset-0 grid place-items-center p-4 text-center text-sm text-muted-foreground">{error ?? "Carregando mapa…"}</div>}
    </div>
  );
}
