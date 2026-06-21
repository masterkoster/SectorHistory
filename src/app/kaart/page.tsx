'use client';

import { useState, useMemo, useCallback } from 'react';
import type maplibregl from 'maplibre-gl';
import Link from 'next/link';
import MapView from '@/components/MapView';
import EventPanel from '@/components/EventPanel';
import { curatedEvents } from '@/data/curated-events';
import { TimePeriod, EventCategory, PERIOD_LABELS, CATEGORY_LABELS } from '@/lib/types';

const PERIODS: TimePeriod[] = ['all', 'ww1', 'ww2', 'coldwar', 'modern'];
const CATEGORIES: EventCategory[] = ['bombing', 'battle', 'industry', 'logistics', 'civilian', 'resistance', 'political'];

export default function MapPage() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>('rotterdam-1940');
  const [selectedPeriods, setSelectedPeriods] = useState<Set<TimePeriod>>(new Set(['all']));
  const [selectedCategories, setSelectedCategories] = useState<Set<EventCategory>>(new Set(CATEGORIES));
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

  // Filter events
  const filteredEvents = useMemo(() => {
    return curatedEvents.filter((event) => {
      // Period filter
      const periodMatch = selectedPeriods.has('all') || event.period.some((p) => selectedPeriods.has(p));
      if (!periodMatch) return false;

      // Category filter
      if (!selectedCategories.has(event.category)) return false;

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesLocation = event.locationName.toLowerCase().includes(q);
        const matchesTitle = event.title.toLowerCase().includes(q);
        const matchesTitleEn = event.titleEn?.toLowerCase().includes(q);
        if (!matchesLocation && !matchesTitle && !matchesTitleEn) return false;
      }

      return true;
    });
  }, [selectedPeriods, selectedCategories, searchQuery]);

  const selectedEvent = useMemo(
    () => curatedEvents.find((e) => e.id === selectedEventId) ?? null,
    [selectedEventId]
  );

  // Toggle helpers
  const togglePeriod = useCallback((period: TimePeriod) => {
    setSelectedPeriods((prev) => {
      const next = new Set(prev);
      if (period === 'all') {
        return new Set(['all']);
      }
      next.delete('all');
      if (next.has(period)) {
        next.delete(period);
        if (next.size === 0) return new Set(['all']);
      } else {
        next.add(period);
      }
      return next;
    });
  }, []);

  const toggleCategory = useCallback((cat: EventCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  // Near me
  const handleNearMe = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          setUserLocation(loc);
          if (mapInstance) {
            mapInstance.flyTo({ center: loc, zoom: 12, duration: 1500 });
          }
        },
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [mapInstance]);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Map fills everything */}
      <div className="absolute inset-0">
        <MapView
          events={filteredEvents}
          selectedEventId={selectedEventId}
          onEventSelect={setSelectedEventId}
          onMapReady={setMapInstance}
        />
      </div>

      {/* ---- UI Overlay ---- */}

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3">
        <Link
          href="/"
          className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 hover:bg-surface-hover transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-sm font-bold text-text-primary hidden sm:inline">SectorHistory</span>
        </Link>

        {/* Search */}
        <div className="glass rounded-xl flex items-center gap-2.5 px-3.5 py-2.5 flex-1 max-w-md">
          <svg className="w-4 h-4 text-text-muted flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Zoek op stad, regio of gebeurtenis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder:text-text-muted/50"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-text-muted hover:text-text-primary">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Near me */}
        <button
          onClick={handleNearMe}
          className="glass rounded-xl px-3.5 py-2.5 flex items-center gap-2 hover:bg-surface-hover transition-colors text-sm text-text-secondary hover:text-text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4m0 12v4m-8-8H2m20 0h-4" />
          </svg>
          <span className="hidden sm:inline">In de buurt</span>
        </button>
      </div>

      {/* Filter row */}
      <div className="absolute top-[72px] left-4 right-4 z-10 flex items-center gap-2 flex-wrap">
        {/* Period pills */}
        {PERIODS.map((period) => (
          <button
            key={period}
            onClick={() => togglePeriod(period)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
              selectedPeriods.has(period)
                ? period === 'all'
                  ? 'bg-accent/15 border-accent/25 text-accent'
                  : 'bg-indigo-500/15 border-indigo-500/25 text-indigo-300'
                : 'bg-white/[0.04] border-white/[0.06] text-text-muted hover:text-text-secondary hover:bg-white/[0.06]'
            }`}
          >
            {PERIOD_LABELS[period].nl}
          </button>
        ))}

        <div className="w-px h-6 bg-white/[0.06]" />

        {/* Category pills */}
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
              selectedCategories.has(cat)
                ? 'bg-white/10 border-white/15 text-text-primary'
                : 'bg-white/[0.02] border-transparent text-text-muted/50 line-through opacity-50'
            }`}
          >
            {CATEGORY_LABELS[cat].nl}
          </button>
        ))}
      </div>

      {/* Bottom timeline bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 glass rounded-2xl px-5 py-3 flex items-center gap-4 min-w-[320px] sm:min-w-[400px]">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Tijdlijn
        </span>
        <div className="flex-1 h-1 bg-white/[0.06] rounded-full relative">
          <div
            className="h-full bg-gradient-to-r from-accent to-amber-500 rounded-full relative"
            style={{ width: '35%' }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-accent border-2 border-background shadow-[0_0_10px_rgba(212,184,112,0.3)]" />
          </div>
        </div>
        <span className="text-xs font-semibold text-text-secondary whitespace-nowrap tabular-nums">
          1914 — 1945
        </span>
        <button className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* Legend — desktop only */}
      <div className="absolute bottom-20 left-4 z-10 glass rounded-xl px-3.5 py-3 hidden md:block">
        <div className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">
          Legenda
        </div>
        {CATEGORIES.map((cat) => {
          const colors: Record<EventCategory, string> = {
            bombing: '#d47070',
            battle: '#d4a050',
            industry: '#70a0d4',
            logistics: '#60b090',
            civilian: '#b080c0',
            resistance: '#80c080',
            political: '#d0b060',
          };
          return (
            <div key={cat} className="flex items-center gap-2 text-xs text-text-secondary py-0.5">
              <span className="w-2 h-2 rounded-full" style={{ background: colors[cat] }} />
              <span>{CATEGORY_LABELS[cat].nl}</span>
            </div>
          );
        })}
      </div>

      {/* Ko-fi floating button */}
      <a
        href="https://ko-fi.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-20 right-4 z-10 glass rounded-xl px-3.5 py-2.5 flex items-center gap-2
                   text-accent text-xs font-medium hover:bg-accent-muted/20 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        Steun
      </a>

      {/* Event count */}
      <div className="absolute top-[116px] right-4 z-10 glass rounded-lg px-3 py-1.5">
        <span className="text-xs text-text-muted">
          {filteredEvents.length} gebeurtenis{filteredEvents.length !== 1 ? 'sen' : ''}
        </span>
      </div>

      {/* Slide-in panel */}
      <EventPanel event={selectedEvent} onClose={() => setSelectedEventId(null)} />
    </div>
  );
}
