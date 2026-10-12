import '@testing-library/jest-dom/vitest'

// jsdom lacks these browser APIs; embla-carousel (used by the shadcn carousel) needs them.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

class StubObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!('ResizeObserver' in window)) {
  window.ResizeObserver = StubObserver as unknown as typeof ResizeObserver
}

if (!('IntersectionObserver' in window)) {
  window.IntersectionObserver = StubObserver as unknown as typeof IntersectionObserver
}
