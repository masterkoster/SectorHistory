'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { HistoricalEvent, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types';
import { curatedEvents } from '@/data/curated-events';

interface EventPanelProps {
  event: HistoricalEvent | null;
  onClose: () => void;
  onShowRelated?: (eventId: string) => void;
  relatedActive?: boolean;
}

export default function EventPanel({ event, onClose, onShowRelated, relatedActive }: EventPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!event) return null;

  const color = CATEGORY_COLORS[event.category];

  // Check if this event has sub-events or related events
  const hasSubEvents = curatedEvents.filter((e) => e.parentEventId === event.id).length > 0;
  const hasRelatedEvents = (event.relatedEvents && event.relatedEvents.length > 0) || hasSubEvents;
  const subEventCount = curatedEvents.filter((e) => e.parentEventId === event.id).length;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="fixed bottom-0 md:top-0 right-0 z-50 w-full md:w-[420px] h-[70vh] md:h-full
                   glass-strong border-t md:border-t-0 md:border-l border-border
                   rounded-t-2xl md:rounded-none
                   flex flex-col animate-[slideInRight_0.35s_cubic-bezier(0.16,1,0.3,1)]
                   shadow-[-10px_0_40px_rgba(0,0,0,0.4)]"
      >
        <div className="flex md:hidden justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                style={{
                  background: `${color}20`,
                  color: color,
                  border: `1px solid ${color}20`,
                }}
              >
                {CATEGORY_LABELS[event.category].nl}
              </span>
              <span className="text-xs font-medium text-text-muted">
                {event.date.slice(0, 4)}{event.endDate ? ` — ${event.endDate.slice(0, 4)}` : ''}
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-primary leading-tight">
              {event.title}
            </h2>
            <p className="text-xs text-text-muted mt-1">{event.locationName}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-border
                       flex items-center justify-center text-text-muted hover:text-text-primary
                       hover:bg-white/10 transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Image placeholder */}
          <div className="w-full h-44 rounded-xl bg-gradient-to-br from-surface to-surface-hover
                          border border-border-light flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-text-muted/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-xs text-text-muted/40">Historische afbeelding</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-text-secondary leading-relaxed font-light">
            {event.description}
          </p>

          {/* Stats */}
          {event.stats && event.stats.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {event.stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/[0.03] border border-border-light rounded-lg p-3"
                >
                  <div className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
                    {stat.label}
                  </div>
                  <div className="text-sm font-semibold text-text-primary">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sub-event preview (if any sub-events exist on the map) */}
          {subEventCount > 0 && (
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div>
                  <p className="text-sm text-text-secondary">
                    <span className="text-indigo-300 font-medium">{subEventCount} locatie{subEventCount !== 1 ? 's' : ''}</span> op straatniveau beschikbaar
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Klik op &quot;Toon gerelateerd&quot; om de exacte locaties te zien.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 pt-1">
            {/* Lees meer → dedicated page */}
            <Link
              href={`/kaart/${event.id}`}
              className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl
                         bg-white/[0.06] border border-border text-text-primary
                         hover:bg-white/10 hover:border-white/20 transition-all duration-200
                         text-sm font-medium group"
            >
              <svg className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <span>Lees meer over deze gebeurtenis</span>
              <svg className="w-4 h-4 ml-auto text-text-muted/30 group-hover:text-accent/50 transition-all group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Toon gerelateerde gebeurtenissen */}
            {hasRelatedEvents && onShowRelated && (
              <button
                onClick={() => onShowRelated(event.id)}
                className={`flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl
                           transition-all duration-200 text-sm font-medium border
                           ${relatedActive
                             ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                             : 'bg-white/[0.04] border-border text-text-secondary hover:bg-white/[0.08] hover:text-text-primary'
                           }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                {relatedActive
                  ? 'Verberg gerelateerde locaties'
                  : `Toon gerelateerde locaties (${subEventCount || event.relatedEvents?.length || 0})`}
              </button>
            )}

            {/* Direct sub-event links (if on a parent event) */}
            {subEventCount > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold px-1">
                  Gerelateerde locaties
                </p>
                {curatedEvents
                  .filter((e) => e.parentEventId === event.id)
                  .slice(0, 5)
                  .map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/kaart/${sub.id}`}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors text-sm group"
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-text-secondary group-hover:text-text-primary transition-colors flex-1 min-w-0 truncate">
                        {sub.title}
                      </span>
                      <span className="text-[10px] text-text-muted whitespace-nowrap">{sub.locationName}</span>
                    </Link>
                  ))}
              </div>
            )}
          </div>

          {/* Sources */}
          <div>
            <h4 className="text-[11px] uppercase tracking-widest text-text-muted font-semibold mb-2">
              Bronnen
            </h4>
            <div className="space-y-1.5">
              {event.sources.map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-300/70 hover:text-blue-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  {source.title}
                </a>
              ))}
            </div>
          </div>

          {/* Book affiliate link */}
          {event.books && event.books.length > 0 && (
            <div className="bg-accent-muted/30 border border-accent/10 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M20 8v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h14" />
                  <path d="M16 2v4M12 2v4M8 2v4" />
                </svg>
                <div>
                  <p className="text-sm text-text-secondary">
                    <span className="text-accent font-medium">Verder lezen?</span>{' '}
                    — <em>{event.books[0].title}</em> van {event.books[0].author}
                  </p>
                  <a
                    href={event.books[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1.5 text-xs text-accent/60 hover:text-accent transition-colors"
                  >
                    Bol.com →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Ko-fi support */}
          <a
            href="https://ko-fi.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl
                       bg-accent-muted/20 border border-accent/10 text-accent
                       hover:bg-accent-muted/30 transition-all duration-200
                       text-sm font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Steun SectorHistory op Ko-fi
          </a>
        </div>
      </div>
    </>
  );
}
