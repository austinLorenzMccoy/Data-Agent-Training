'use client'

import { useEffect, useRef } from 'react'
import type { EpsilonPayload } from '@/lib/domain-types'
import { cn } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'

export function EpsilonMap({
  payload,
  selectedId,
  onSelect,
}: {
  payload: EpsilonPayload
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<Map<string, import('leaflet').Marker>>(new Map())
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const user = payload.user_location_pin

  useEffect(() => {
    let cancelled = false
    async function mount() {
      if (!hostRef.current) return
      const L = (await import('leaflet')).default
      if (cancelled || !hostRef.current || mapRef.current) return

      const pins = payload.results.filter((r) => r.pin_shown)
      const center = payload.user_location_pin ?? pins[0]?.pin_shown
      if (!center) return

      const map = L.map(hostRef.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
      }).setView([center.lat, center.lng], 14)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map)

      const bounds = L.latLngBounds([])

      if (payload.user_location_pin) {
        const youPin = payload.user_location_pin
        const you = L.divIcon({
          className: 'eps-marker-wrap',
          html: `<div class="eps-you" title="${escapeHtml(youPin.label ?? 'You are here')}">YOU</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })
        L.marker([youPin.lat, youPin.lng], { icon: you, zIndexOffset: 400, keyboard: false })
          .addTo(map)
          .bindTooltip(payload.user_location, { direction: 'top', offset: [0, -12] })
        bounds.extend([youPin.lat, youPin.lng])

        if (payload.search_radius_m) {
          L.circle([youPin.lat, youPin.lng], {
            radius: payload.search_radius_m,
            color: '#c8973a',
            weight: 1.5,
            dashArray: '5 5',
            fillColor: '#c8973a',
            fillOpacity: 0.08,
          }).addTo(map)
        }
      }

      for (const result of pins) {
        const pin = result.pin_shown!
        const letter = result.id.toUpperCase()
        const marker = L.marker([pin.lat, pin.lng], {
          icon: pinIcon(L, letter, false),
          zIndexOffset: 200,
        })
          .addTo(map)
          .bindTooltip(`${letter} · ${result.name_shown}`, { direction: 'top', offset: [0, -16] })
        marker.on('click', () => onSelectRef.current(result.id))
        markersRef.current.set(result.id, marker)
        bounds.extend([pin.lat, pin.lng])
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.28), { maxZoom: 16, animate: false })
      }

      mapRef.current = map
      requestAnimationFrame(() => map.invalidateSize())
    }

    void mount()
    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [payload])

  useEffect(() => {
    void import('leaflet').then((mod) => {
      const L = mod.default
      markersRef.current.forEach((marker, id) => {
        const letter = id.toUpperCase()
        marker.setIcon(pinIcon(L, letter, id === selectedId))
        marker.setZIndexOffset(id === selectedId ? 500 : 200)
      })
    })
  }, [selectedId])

  if (!user && !payload.results.some((r) => r.pin_shown)) return null

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Map · user location and result pins
        </p>
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-[#3b82f6] ring-2 ring-[#3b82f6]/40" />
            User
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
              A
            </span>
            Result
          </span>
          {payload.search_radius_m ? <span>Gold ring · ~{Math.round(payload.search_radius_m / 1609)} mi</span> : null}
        </div>
      </div>
      <div
        className={cn(
          'overflow-hidden rounded-md border border-border bg-[#d8d4c8]',
          '[&_.leaflet-control-attribution]:bg-white/80 [&_.leaflet-control-attribution]:text-[10px]',
        )}
      >
        <div ref={hostRef} className="h-[300px] w-full sm:h-[360px]" />
      </div>
      <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
        Click a pin to jump to that result. Judge name, address, and pin against what the map actually shows.
      </p>
    </div>
  )
}

function pinIcon(L: typeof import('leaflet'), letter: string, selected: boolean) {
  return L.divIcon({
    className: 'eps-marker-wrap',
    html: `<div class="eps-pin${selected ? ' is-selected' : ''}">${letter}</div>`,
    iconSize: [28, 34],
    iconAnchor: [14, 32],
  })
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}
