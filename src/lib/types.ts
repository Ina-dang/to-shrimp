export type SourceId = 'japan24' | 'japangift' | 'heyprice' | 'bbts';

export interface SearchItem {
  id: string;
  title: string;
  url: string;
  price?: string;
  image?: string;
  source: SourceId;
}

export interface SearchResult {
  query: string;
  items: SearchItem[];
}

export interface SiteParser {
  source: SourceId;
  search: (query: string, signal?: AbortSignal) => Promise<SearchItem[]>;
}
