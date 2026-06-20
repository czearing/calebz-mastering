import { vi } from "vitest";

// jsdom lacks several browser APIs the Work feature touches. These installers
// give tests a controllable matchMedia plus the dialog and observer stubs.

type MediaState = { fine?: boolean; reduced?: boolean };

// matchMedia that answers (pointer: fine) and reduced-motion from a state object.
export function mockMatchMedia(state: MediaState = {}) {
  const impl = (query: string) => {
    const matches =
      query.includes("pointer: fine")
        ? Boolean(state.fine)
        : query.includes("prefers-reduced-motion")
          ? Boolean(state.reduced)
          : false;
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    };
  };
  Object.defineProperty(window, "matchMedia", { writable: true, value: impl });
}

// IntersectionObserver no-op so Reveal mounts without throwing.
export function mockIntersectionObserver() {
  class MockIO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(globalThis, "IntersectionObserver", {
    writable: true,
    value: MockIO,
  });
}

// ResizeObserver no-op so the grid FLIP hook mounts without throwing in jsdom.
export function mockResizeObserver() {
  class MockRO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(globalThis, "ResizeObserver", {
    writable: true,
    value: MockRO,
  });
}

// jsdom's <dialog> has no showModal/close; stub them so open toggles dialog.open
// and the onClose handler still fires on close.
export function mockDialog() {
  const proto = window.HTMLDialogElement.prototype as unknown as Record<
    string,
    unknown
  >;
  const showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  const close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  });
  proto.showModal = showModal;
  proto.close = close;
  return { showModal, close };
}
