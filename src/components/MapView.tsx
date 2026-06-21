'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { HistoricalEvent, CATEGORY_COLORS } from '@/lib/types';

interface MapViewProps {
  events: HistoricalEvent[];
  selectedEventId: string | null;
  onEventSelect: (id: string | null) => void;
  highlightedEventIds?: Set<string>;
  onMapReady?: (map: maplibregl.Map) => void;
}

export default function MapView({
  events,
  selectedEventId,
  onEventSelect,
  highlightedEventIds,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
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
      center: [5.5, 52.1],
      zoom: 6.5,
      minZoom: 2,
      maxZoom: 18,
      attributionControl: { compact: true },
      dragRotate: true,
      touchZoomRotate: true,
    });

    map.addControl(new maplibregl.NavigationControl({
      visualizePitch: false,
    }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);
      if (onMapReady) onMapReady(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onMapReady]);

  // Update markers when events change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    ['event-area-fill', 'event-area-line', 'event-glow',
     'related-area-fill', 'related-area-line', 'related-glow'].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });

    // Track which events need to be fitted
    let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;

    events.forEach((event) => {
      const color = CATEGORY_COLORS[event.category];
      const isSelected = event.id === selectedEventId;
      const isHighlighted = highlightedEventIds?.has(event.id) && !isSelected;

      // Track bounds for zooming
      if (isHighlighted || isSelected) {
        const [lng, lat] = event.coordinates;
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }

      // Build marker element
      const el = document.createElement('div');
      el.className = 'relative cursor-pointer group';

      // Year label
      const yearLabel = document.createElement('span');
      yearLabel.className = `absolute pointer-events-none font-semibold tracking-wide ${
        isHighlighted ? '-top-4 text-[8px] opacity-50' : '-top-5 text-[10px]'
      }`;
      yearLabel.style.color = isSelected
        ? 'rgba(255,255,255,0.8)'
        : isHighlighted
        ? 'rgba(255,255,255,0.4)'
        : 'rgba(255,255,255,0.25)';
      yearLabel.textContent = event.date.slice(0, 4);
      el.appendChild(yearLabel);

      // "Related" label for highlighted events
      if (isHighlighted) {
        const label = document.createElement('span');
        label.className = 'absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-medium uppercase tracking-wider pointer-events-none';
        label.style.color = 'rgba(255,255,255,0.3)';
        label.textContent = 'gerelateerd';
        el.appendChild(label);
      }

      // Dot
      const dot = document.createElement('div');
      const dotSize = isSelected ? 16 : isHighlighted ? 8 : 12;
      dot.className = 'rounded-full border-2 transition-all duration-300';
      dot.style.width = `${dotSize}px`;
      dot.style.height = `${dotSize}px`;
      dot.style.background = isHighlighted ? 'transparent' : color;
      dot.style.borderColor = isSelected
        ? 'rgba(255,255,255,0.7)'
        : isHighlighted
        ? `${color}80`
        : 'rgba(255,255,255,0.25)';
      dot.style.boxShadow = isSelected
        ? `0 0 20px ${color}, 0 0 40px ${color}40`
        : isHighlighted
        ? `0 0 8px ${color}40`
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

      // Click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onEventSelect(event.id === selectedEventId ? null : event.id);
      });

      // Hover
      el.addEventListener('mouseenter', () => {
        if (!isSelected) dot.style.transform = 'scale(1.3)';
      });
      el.addEventListener('mouseleave', () => {
        if (!isSelected) dot.style.transform = 'scale(1)';
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(event.coordinates)
        .addTo(map);

      markersRef.current.set(event.id, marker);
    });

    // Zoom to fit highlighted/selected events
    if (minLng !== 180 && maxLng !== -180) {
      const padding = 0.02;
      const bounds = [
        [Math.max(minLng - padding, -180), Math.max(minLat - padding, -90)],
        [Math.min(maxLng + padding, 180), Math.min(maxLat + padding, 90)],
      ] as [[number, number], [number, number]];

      map.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
        maxZoom: 16,
        duration: 1200,
      });
    }
  }, [events, selectedEventId, highlightedEventIds, mapLoaded, onEventSelect]);

  // Draw area polygon for selected event
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    ['event-area-fill', 'event-area-line', 'event-glow',
     'related-area-fill', 'related-area-line', 'related-glow'].forEach((id) => {
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
