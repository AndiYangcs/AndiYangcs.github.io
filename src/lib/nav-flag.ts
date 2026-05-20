const KEY = 'internal-nav';

export function markInternalNav(): void {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}

export function consumeInternalNav(): boolean {
  try {
    const had = sessionStorage.getItem(KEY) === '1';
    sessionStorage.removeItem(KEY);
    return had;
  } catch {
    return false;
  }
}

export type NavType = 'navigate' | 'reload' | 'back_forward' | 'prerender';

export function shouldPlayLandingIntro(opts: { navType: NavType }): boolean {
  if (consumeInternalNav()) return false;
  return opts.navType === 'navigate' || opts.navType === 'reload';
}
