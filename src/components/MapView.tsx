'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { HistoricalEvent, CATEGORY_COLORS } from '@/lib/types';

interface MapViewProps {
  events: HistoricalEvent[];
  selectedEventId: string | null;
  onEventSelect: (id: string | null) => void;
  onMapReady?: (map: maplibregl.Map) => void;
}

export default function MapView({ events, selectedEventId, onEventSelect, onMapReady }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const animFrameRef = useRef<number>(0);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
            tileSize: 256,
            attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
          },
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: [5.5, 52.1], // Netherlands center
      zoom: 6.5,
      minZoom: 2,
      maxZoom: 18,
      attributionControl: { compact: true },
      dragRotate: true,
      touchZoomRotate: true,
    });

    // Navigation controls
    map.addControl(new maplibregl.NavigationControl({
      visualizePitch: false,
    }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);
      if (onMapReady) onMapReady(map);
    });

    mapRef.current = map;

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, [onMapReady]);

  // Update markers when events change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Remove old area layers
    ['event-area-fill', 'event-area-line', 'event-glow'].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });

    events.forEach((event) => {
      const color = CATEGORY_COLORS[event.category];
      const isSelected = event.id === selectedEventId;

      // Create marker element
      const el = document.createElement('div');
      el.className = 'relative cursor-pointer group';

      // Year label
      const yearLabel = document.createElement('span');
      yearLabel.className = 'absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-wide pointer-events-none';
      yearLabel.style.color = isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)';
      yearLabel.textContent = event.date.slice(0, 4);
      el.appendChild(yearLabel);

      // Dot
      const dot = document.createElement('div');
      dot.className = `rounded-full border-2 transition-all duration-300 ${isSelected ? 'scale-[1.4]' : ''}`;
      dot.style.width = isSelected ? '16px' : '12px';
      dot.style.height = isSelected ? '16px' : '12px';
      dot.style.background = color;
      dot.style.borderColor = isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)';
      dot.style.boxShadow = isSelected
        ? `0 0 20px ${color}, 0 0 40px ${color}40`
        : '0 0 10px rgba(0,0,0,0.5)';
      el.appendChild(dot);

      // Pulse ring for selected
      if (isSelected) {
        const ring = document.createElement('div');
        ring.className = 'absolute inset-0 rounded-full pointer-events-none';
        ring.style.animation = 'pulseRing 2s ease-out infinite';
        ring.style.border = `2px solid ${color}`;
        ring.style.opacity = '0.5';
        el.appendChild(ring);
      }

      el.addEventListener('click', () => {
        onEventSelect(event.id === selectedEventId ? null : event.id);
      });

      // Hover effect
      el.addEventListener('mouseenter', () => {
        dot.style.transform = 'scale(1.3)';
      });
      el.addEventListener('mouseleave', () => {
        if (!isSelected) dot.style.transform = 'scale(1)';
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(event.coordinates)
        .addTo(map);

      markersRef.current.set(event.id, marker);
    });
  }, [events, selectedEventId, mapLoaded, onEventSelect]);

  // Draw area polygon for selected event
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    ['event-area-fill', 'event-area-line', 'event-glow'].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });

    const selectedEvent = events.find((e) => e.id === selectedEventId);
    if (!selectedEvent?.geometry) return;

    const color = CATEGORY_COLORS[selectedEvent.category];

    // Animated border
    map.addSource('event-area-line', {
      type: 'geojson',
      data: selectedEvent.geometry as GeoJSON.GeoJSON,
    });

    map.addLayer({
      id: 'event-area-line',
      type: 'line',
      source: 'event-area-line',
      paint: {
        'line-color': color,
        'line-opacity': 0.8,
        'line-width': 2.5,
        'line-dasharray': [4, 3],
      },
    });

    // Fill
    map.addSource('event-area-fill', {
      type: 'geojson',
      data: selectedEvent.geometry as GeoJSON.GeoJSON,
    });

    map.addLayer({
      id: 'event-area-fill',
      type: 'fill',
      source: 'event-area-fill',
      paint: {
        'fill-color': color,
        'fill-opacity': 0.08,
      },
    });

    // Glow border
    map.addSource('event-glow', {
      type: 'geojson',
      data: selectedEvent.geometry as GeoJSON.GeoJSON,
    });

    map.addLayer({
      id: 'event-glow',
      type: 'line',
      source: 'event-glow',
      paint: {
        'line-color': color,
        'line-opacity': 0.2,
        'line-width': 8,
        'line-blur': 6,
      },
    });

    // Fly to the event
    map.flyTo({
      center: selectedEvent.coordinates,
      zoom: Math.max(map.getZoom(), 11),
      duration: 1200,
    });
  }, [selectedEventId, events, mapLoaded]);

  return (
    <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
  );
}
