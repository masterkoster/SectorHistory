export type EventCategory =
  | 'bombing'
  | 'battle'
  | 'industry'
  | 'logistics'
  | 'civilian'
  | 'resistance'
  | 'political';

export type TimePeriod = 'all' | 'ww1' | 'ww2' | 'coldwar' | 'modern';

export type LocationType = 'city' | 'neighborhood' | 'street' | 'region' | 'country' | 'building';

export interface EventSource {
  title: string;
  url: string;
}

export interface EventStat {
  label: string;
  value: string;
}

export interface SubEventLink {
  id: string;
  title: string;
  locationName: string;
  coordinates: [number, number];
  date: string;
  category: EventCategory;
}

export interface TimelineEntry {
  date: string;
  title: string;
  description: string;
}

export interface HistoricalEvent {
  id: string;
  title: string;
  titleEn?: string;
  date: string;
  endDate?: string;
  category: EventCategory;
  locationName: string;
  coordinates: [number, number];
  geometry?: GeoJSON.Polygon;
  description: string;
  detailedDescription?: string;
  descriptionEn?: string;
  images: string[];
  sources: EventSource[];
  stats?: EventStat[];
  casualties?: number;
  period: TimePeriod[];
  books?: { title: string; author: string; url: string }[];
  relatedEvents?: string[];
  subEvents?: SubEventLink[];
  timeline?: TimelineEntry[];
  locationType?: LocationType;
  parentEventId?: string;
}

export const CATEGORY_LABELS: Record<EventCategory, { nl: string; en: string }> = {
  bombing: { nl: 'Bombardement', en: 'Bombing' },
  battle: { nl: 'Gevecht', en: 'Battle' },
  industry: { nl: 'Industrie', en: 'Industry' },
  logistics: { nl: 'Logistiek', en: 'Logistics' },
  civilian: { nl: 'Burger', en: 'Civilian' },
  resistance: { nl: 'Verzet', en: 'Resistance' },
  political: { nl: 'Politiek', en: 'Political' },
};

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  bombing: '#d47070',
  battle: '#d4a050',
  industry: '#70a0d4',
  logistics: '#60b090',
  civilian: '#b080c0',
  resistance: '#80c080',
  political: '#d0b060',
};

export const PERIOD_LABELS: Record<TimePeriod, { nl: string; en: string }> = {
  all: { nl: 'Alle', en: 'All' },
  ww1: { nl: 'WO1', en: 'WW1' },
  ww2: { nl: 'WO2', en: 'WW2' },
  coldwar: { nl: 'Koude Oorlog', en: 'Cold War' },
  modern: { nl: 'Modern', en: 'Modern' },
};
