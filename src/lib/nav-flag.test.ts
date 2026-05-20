import { beforeEach, describe, expect, it } from 'vitest';
import {
  markInternalNav,
  consumeInternalNav,
  shouldPlayLandingIntro,
} from './nav-flag';

describe('nav-flag', () => {
  beforeEach(() => sessionStorage.clear());

  it('marks and consumes the internal-nav flag', () => {
    markInternalNav();
    expect(consumeInternalNav()).toBe(true);
    expect(consumeInternalNav()).toBe(false);
  });

  it('shouldPlayLandingIntro skips animation when flag is set', () => {
    markInternalNav();
    expect(shouldPlayLandingIntro({ navType: 'back_forward' })).toBe(false);
  });

  it('plays on direct navigation', () => {
    expect(shouldPlayLandingIntro({ navType: 'navigate' })).toBe(true);
  });

  it('plays on reload', () => {
    expect(shouldPlayLandingIntro({ navType: 'reload' })).toBe(true);
  });

  it('skips on back/forward without flag', () => {
    expect(shouldPlayLandingIntro({ navType: 'back_forward' })).toBe(false);
  });
});
