import type { SiteParser } from '../types';
import { heypriceParser } from './heyprice';
import { japan24Parser } from './japan24';
import { japangiftParser } from './japangift';

export const parsers: SiteParser[] = [
  japan24Parser,
  japangiftParser,
  heypriceParser,
];
