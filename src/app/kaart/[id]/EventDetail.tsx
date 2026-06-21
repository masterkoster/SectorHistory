'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HistoricalEvent, CATEGORY_LABELS, CATEGORY_COLORS, PERIOD_LABELS } from '@/lib/types';

interface EventDetailProps {
  event: HistoricalEvent;
  relatedEvents: HistoricalEvent[];
  subEvents: HistoricalEvent[];
  parentEvent: HistoricalEvent | null;
  nearbyEvents: HistoricalEvent[];
  allEvents: HistoricalEvent[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr.replace(/-/g, '/');
  return d.toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Simple markdown renderer for the detailed description
function renderMarkdown(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .map((line) => {
      if (line.startsWith('## ')) return `<h2 class="text-xl font-bold text-text-primary mt-8 mb-3">${line.slice(3)}</h2>`;
      if (line.startsWith('### ')) return `<h3 class="text-lg font-semibold text-text-primary mt-6 mb-2">${line.slice(4)}</h3>`;
      if (line.startsWith('- ')) return `<li class="text-text-secondary ml-4">${line.slice(2)}</li>`;
      return `<p class="text-text-secondary leading-relaxed mb-3">${line}</p>`;
    })
    .join('\n');
}

export default function EventDetail({
  event,
  relatedEvents,
  subEvents,
  parentEvent,
  nearbyEvents,
  allEvents,
}: EventDetailProps) {
  const color = CATEGORY_COLORS[event.category];
  const periodsLabel = event.period
    .filter((p) => p !== 'all')
    .map((p) => PERIOD_LABELS[p].nl)
    .join(', ');

  return (
    <div className="min-h-full bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/kaart"
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Terug naar kaart
            </Link>
            <span className="text-text-muted/30 text-sm">|</span>
            <Link href="/" className="text-xs text-text-muted hover:text-text-secondary transition-colors">
              SectorHistory
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Category badge */}
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border"
              style={{
                background: `${color}15`,
                borderColor: `${color}25`,
                color: color,
              }}
            >
              {CATEGORY_LABELS[event.category].nl}
            </span>
            {event.locationType && (
              <span className="text-[10px] text-text-muted uppercase tracking-wider bg-white/[0.04] px-2 py-0.5 rounded-full">
                {event.locationType}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 text-sm text-text-muted mb-3">
            <time dateTime={event.date}>{formatDate(event.date)}</time>
            {event.endDate && (
              <>
                <span>—</span>
                <time dateTime={event.endDate}>{formatDate(event.endDate)}</time>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-text-muted/30" />
            <span>{periodsLabel}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight tracking-tight">
            {event.title}
          </h1>
          <p className="text-lg text-text-muted mt-2">{event.locationName}</p>
        </div>

        {/* Image gallery placeholder */}
        <div className="w-full h-64 sm:h-80 rounded-2xl bg-gradient-to-br from-surface to-surface-hover border border-border-light flex items-center justify-center mb-10">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-text-muted/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p className="text-sm text-text-muted/30">Historische afbeeldingen — binnenkort beschikbaar</p>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Detailed description */}
          <div className="lg:col-span-2">
            {event.detailedDescription ? (
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(event.detailedDescription) }}
              />
            ) : (
              <p className="text-text-secondary leading-relaxed text-lg">{event.description}</p>
            )}

            {/* Timeline */}
            {event.timeline && event.timeline.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-bold text-text-primary mb-6">Tijdlijn</h2>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-white/[0.06]" />

                  <div className="space-y-6">
                    {event.timeline.map((entry, i) => (
                      <div key={i} className="relative pl-10">
                        <div
                          className="absolute left-[5px] top-1.5 w-3.5 h-3.5 rounded-full border-2"
                          style={{
                            borderColor: color,
                            background: i === 0 ? color : 'transparent',
                          }}
                        />
                        <div>
                          <time className="text-xs font-semibold text-text-muted">{formatDate(entry.date)}</time>
                          <h3 className="text-base font-semibold text-text-primary mt-0.5">{entry.title}</h3>
                          <p className="text-sm text-text-secondary mt-1">{entry.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sources */}
            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">Bronnen</h2>
              <div className="space-y-3">
                {event.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-indigo-300/70 hover:text-indigo-200 transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Stats card */}
            {event.stats && event.stats.length > 0 && (
              <div className="glass rounded-xl p-5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Statistieken</h3>
                <div className="space-y-3">
                  {event.stats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-xs text-text-secondary">{stat.label}</span>
                      <span className="text-sm font-semibold text-text-primary">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ko-fi */}
            <a
              href="https://ko-fi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl p-5 flex items-center gap-3 hover:bg-surface-hover transition-colors group"
            >
              <svg className="w-6 h-6 text-accent flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-text-primary">Steun dit project</p>
                <p className="text-xs text-text-muted">Doneer een kop koffie op Ko-fi</p>
              </div>
            </a>

            {/* Affiliate book */}
            {event.books && event.books.length > 0 && (
              <div className="glass rounded-xl p-5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Verder lezen</h3>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M20 8v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h14" />
                    <path d="M16 2v4M12 2v4M8 2v4" />
                  </svg>
                  <div>
                    <p className="text-sm text-text-secondary">
                      <em>{event.books[0].title}</em>
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{event.books[0].author}</p>
                    <a
                      href={event.books[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-accent/60 hover:text-accent transition-colors"
                    >
                      Bestel op Bol.com →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Map link */}
            <Link
              href={`/kaart?event=${event.id}`}
              className="glass rounded-xl p-5 flex items-center gap-3 hover:bg-surface-hover transition-colors group"
            >
              <svg className="w-6 h-6 text-indigo-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <p className="text-sm font-medium text-text-primary">Bekijk op de kaart</p>
                <p className="text-xs text-text-muted">Open in interactieve kaartweergave</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Related events section */}
        {(relatedEvents.length > 0 || subEvents.length > 0 || parentEvent || nearbyEvents.length > 0) && (
          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="text-2xl font-bold text-text-primary mb-8">Gerelateerde gebeurtenissen</h2>

            <div className="space-y-10">
              {/* Parent event */}
              {parentEvent && (
                <div>
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-3">Onderdeel van</h3>
                  <RelatedEventCard event={parentEvent} allEvents={allEvents} />
                </div>
              )}

              {/* Sub-events (street level) */}
              {subEvents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-3">
                    Straatniveau — {subEvents.length} locatie{subEvents.length !== 1 ? 's' : ''}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subEvents.map((se) => (
                      <RelatedEventCard key={se.id} event={se} allEvents={allEvents} compact />
                    ))}
                  </div>
                </div>
              )}

              {/* Related events */}
              {relatedEvents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-3">
                    Ook in deze regio
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {relatedEvents.map((re) => (
                      <RelatedEventCard key={re.id} event={re} allEvents={allEvents} />
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby events */}
              {nearbyEvents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-3">
                    In de buurt ({Math.round(nearbyEvents[0].coordinates[0] * 100) / 100}, {Math.round(nearbyEvents[0].coordinates[1] * 100) / 100})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {nearbyEvents.slice(0, 4).map((ne) => (
                      <RelatedEventCard key={ne.id} event={ne} allEvents={allEvents} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-text-muted">
          <span>© 2026 SectorHistory</span>
          <a
            href="https://ko-fi.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent/60 hover:text-accent transition-colors"
          >
            Steun dit project
          </a>
        </div>
      </footer>
    </div>
  );
}

// Sub-component: Related event card
function RelatedEventCard({
  event,
  allEvents,
  compact = false,
}: {
  event: HistoricalEvent;
  allEvents: HistoricalEvent[];
  compact?: boolean;
}) {
  const color = CATEGORY_COLORS[event.category];
  const subCount = allEvents.filter((e) => e.parentEventId === event.id).length;

  return (
    <Link
      href={`/kaart/${event.id}`}
      className={`glass rounded-xl border border-border hover:border-border-light transition-all duration-200 hover:bg-surface-hover group ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Color dot */}
        <span
          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
          style={{ background: color }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color }}
            >
              {CATEGORY_LABELS[event.category].nl}
            </span>
            <span className="text-[10px] text-text-muted">
              {event.date.slice(0, 4)}
            </span>
            {event.locationType && (
              <span className="text-[9px] text-text-muted/50 uppercase bg-white/[0.03] px-1.5 py-0.5 rounded">
                {event.locationType}
              </span>
            )}
          </div>

          <h4 className={`font-semibold text-text-primary group-hover:text-accent transition-colors ${
            compact ? 'text-sm' : 'text-base'
          }`}>
            {event.title}
          </h4>

          {!compact && (
            <p className="text-xs text-text-muted mt-1 line-clamp-1">
              {event.locationName}
            </p>
          )}

          {compact && (
            <p className="text-xs text-text-muted/70 mt-0.5">
              {event.locationName}
            </p>
          )}

          {/* Sub-event count badge */}
          {subCount > 0 && !compact && (
            <div className="inline-flex items-center gap-1 mt-2 text-[10px] text-text-muted bg-white/[0.04] px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {subCount} locatie{subCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Arrow */}
        <svg className="w-4 h-4 text-text-muted/30 group-hover:text-accent/50 transition-colors flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
}
