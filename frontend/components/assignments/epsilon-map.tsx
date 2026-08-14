'use client'

import { useEffect, useMemo } from 'react'
import type { EpsilonPayload } from '@/lib/domain-types'

type Pin = { id: string; letter: string; name: string; lat: number; lng: number }

export function EpsilonMap({
  payload,
  selectedId: _selectedId,
  onSelect,
}: {
  payload: EpsilonPayload
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const user = payload.user_location_pin
  const pins: Pin[] = payload.results
    .filter((r) => r.pin_shown)
    .map((r) => ({
      id: r.id,
      letter: r.id.toUpperCase(),
      name: r.name_shown,
      lat: r.pin_shown!.lat,
      lng: r.pin_shown!.lng,
    }))

  const srcDoc = useMemo(
    () =>
      buildMapHtml({
        user: user ? { lat: user.lat, lng: user.lng, label: payload.user_location } : null,
        radiusM: payload.search_radius_m ?? null,
        pins,
        selectedId: null,
      }),
    // Rebuild only when the assignment changes — not on pin highlight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payload.query, payload.user_location, payload.search_radius_m, payload.results],
  )

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data
      if (!data || data.source !== 'dna-epsilon-map') return
      if (typeof data.id === 'string') onSelect(data.id)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [onSelect])

  if (!user && pins.length === 0) return null

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Map · user location and result pins
        </p>
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-[#2563eb] ring-2 ring-[#2563eb]/40" />
            User
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
              A
            </span>
            Result
          </span>
          {payload.search_radius_m ? (
            <span>Gold ring · ~{Math.round(payload.search_radius_m / 1609)} mi</span>
          ) : null}
        </div>
      </div>
      <div className="overflow-hidden rounded-md border border-border bg-[#d8d4c8]">
        <iframe
          title="Map evaluation — user location and search results"
          className="block h-[320px] w-full sm:h-[380px]"
          sandbox="allow-scripts allow-same-origin"
          srcDoc={srcDoc}
        />
      </div>
      <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
        Blue YOU is the user. Gold letters are results. Click a pin to open that card. Judge
        distance and pin placement against the streets.
      </p>
    </div>
  )
}

function buildMapHtml(opts: {
  user: { lat: number; lng: number; label: string } | null
  radiusM: number | null
  pins: Pin[]
  selectedId: string | null
}) {
  const payload = JSON.stringify(opts)
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; background: #d8d4c8; }
    .you {
      width: 36px; height: 36px; border-radius: 999px; background: #2563eb; color: #fff;
      font: 700 9px/36px ui-monospace, monospace; text-align: center; letter-spacing: .08em;
      box-shadow: 0 0 0 4px rgba(37,99,235,.28), 0 2px 8px rgba(0,0,0,.25);
    }
    .pin {
      width: 28px; height: 28px; border-radius: 999px; background: #c8973a; color: #0a0907;
      font: 700 12px/28px ui-monospace, monospace; text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,.28);
    }
    .pin.sel { background: #f0e9db; box-shadow: 0 0 0 3px #c8973a, 0 2px 10px rgba(0,0,0,.3); }
    .leaflet-div-icon { background: none; border: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    (function () {
      var data = ${payload};
      var pts = [];
      if (data.user) pts.push([data.user.lat, data.user.lng]);
      data.pins.forEach(function (p) { pts.push([p.lat, p.lng]); });
      var center = pts[0] || [39.277, -74.575];
      var map = L.map('map', { scrollWheelZoom: true }).setView(center, 14);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);
      var bounds = L.latLngBounds([]);
      if (data.user) {
        L.marker([data.user.lat, data.user.lng], {
          icon: L.divIcon({ className: '', html: '<div class="you">YOU</div>', iconSize: [36,36], iconAnchor: [18,18] }),
          zIndexOffset: 400
        }).addTo(map).bindTooltip(data.user.label, { direction: 'top', offset: [0,-12] });
        bounds.extend([data.user.lat, data.user.lng]);
        if (data.radiusM) {
          L.circle([data.user.lat, data.user.lng], {
            radius: data.radiusM, color: '#c8973a', weight: 1.5, dashArray: '5 5',
            fillColor: '#c8973a', fillOpacity: 0.08
          }).addTo(map);
        }
      }
      data.pins.forEach(function (p) {
        var sel = data.selectedId === p.id;
        var marker = L.marker([p.lat, p.lng], {
          icon: L.divIcon({
            className: '',
            html: '<div class="pin' + (sel ? ' sel' : '') + '">' + p.letter + '</div>',
            iconSize: [28,28],
            iconAnchor: [14,14]
          }),
          zIndexOffset: sel ? 500 : 200
        }).addTo(map).bindTooltip(p.letter + ' · ' + p.name, { direction: 'top', offset: [0,-14] });
        marker.on('click', function () {
          parent.postMessage({ source: 'dna-epsilon-map', id: p.id }, '*');
        });
        bounds.extend([p.lat, p.lng]);
      });
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.28), { maxZoom: 16 });
    })();
  </script>
</body>
</html>`
}
