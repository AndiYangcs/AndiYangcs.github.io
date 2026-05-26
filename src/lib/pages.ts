/**
 * Registry of navigable pages on the site.
 *
 * Add a new entry here when you add a new page under src/pages/.
 * Both the terminal `ls` / `cd` commands and any future site nav can
 * consume this single list.
 */

export interface SitePage {
  id: string; // path slug, e.g. "professional" → /professional
  label: string;
  description?: string;
}

export const PAGES: SitePage[] = [
  {
    id: 'professional',
    label: 'Professional Andi',
    description: 'Resume, projects, and experience',
  },
  {
    id: 'personal',
    label: 'Personal Andi',
    description: 'Life outside of work',
  },
];

export const PAGE_IDS = PAGES.map((p) => p.id);
