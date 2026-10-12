import '@testing-library/jest-dom/vitest';
import { setConsoleFunction } from 'three';

setConsoleFunction((type, message, ...params) => {
  if (type === 'warn' && typeof message === 'string' && message.includes('Clock: This module has been deprecated')) {
    return;
  }
  console[type](message, ...params);
});

// Mock matchMedia for jsdom
if (typeof window !== 'undefined') {
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () {
          return false;
        },
      };
    };

  // Mock ResizeObserver
  window.ResizeObserver =
    window.ResizeObserver ||
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

  // Mock URL.createObjectURL and URL.revokeObjectURL
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = () => 'blob:mock-url';
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = () => {};
  }

  // Mock HTMLCanvasElement.getContext and toDataURL / toBlob for jsdom
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
      return {
        getExtension: () => null,
        getParameter: () => 0,
        createShader: () => ({}),
        shaderSource: () => {},
        compileShader: () => {},
        createProgram: () => ({}),
        attachShader: () => {},
        linkProgram: () => {},
        useProgram: () => {},
        clearColor: () => {},
        clear: () => {},
        viewport: () => {},
        enable: () => {},
        disable: () => {},
        blendFunc: () => {},
      };
    }
    return originalGetContext ? originalGetContext.call(this, type, ...args) : null;
  };

  HTMLCanvasElement.prototype.toDataURL = function () {
    return 'data:image/png;base64,mockPngBase64';
  };

  HTMLCanvasElement.prototype.toBlob = function (callback, mimeType) {
    const mockBlob = new Blob(['mock data'], { type: mimeType || 'image/png' });
    if (callback) callback(mockBlob);
  };
}
