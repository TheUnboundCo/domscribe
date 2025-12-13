import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Track the latest effect callback registered via useEffect
let capturedEffect: (() => void) | undefined;

vi.mock('react', () => ({
  useEffect: (fn: () => void) => {
    capturedEffect = fn;
  },
}));

const mockInitialize = vi.fn();
const mockGetInstance = vi.fn(() => ({ initialize: mockInitialize }));
const mockCreateReactAdapter = vi.fn(() => ({ name: 'react-adapter' }));
const mockInitOverlay = vi.fn();

vi.mock('@domscribe/runtime', () => ({
  RuntimeManager: { getInstance: mockGetInstance },
}));

vi.mock('@domscribe/react', () => ({
  createReactAdapter: mockCreateReactAdapter,
}));

vi.mock('@domscribe/overlay', () => ({
  initOverlay: mockInitOverlay,
}));

import { DomscribeDevProvider } from './domscribe-provider.js';

describe('DomscribeDevProvider', () => {
  beforeEach(() => {
    capturedEffect = undefined;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete (globalThis as Record<string, unknown>)[
      '__DOMSCRIBE_OVERLAY_OPTIONS__'
    ];
  });

  it('should return null (renders nothing)', () => {
    const result = DomscribeDevProvider();

    expect(result).toBeNull();
  });

  it('should register a useEffect with empty dependency array', () => {
    DomscribeDevProvider();

    expect(capturedEffect).toBeDefined();
  });

  it('should skip initialization in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    DomscribeDevProvider();
    capturedEffect?.();

    // Should not attempt to import runtime or react adapter
    expect(mockGetInstance).not.toHaveBeenCalled();
    expect(mockCreateReactAdapter).not.toHaveBeenCalled();
  });

  it('should initialize runtime and react adapter in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    DomscribeDevProvider();
    capturedEffect?.();

    // Allow dynamic import promises to resolve
    await vi.dynamicImportSettled();

    expect(mockGetInstance).toHaveBeenCalled();
    expect(mockCreateReactAdapter).toHaveBeenCalled();
    expect(mockInitialize).toHaveBeenCalledWith({
      adapter: { name: 'react-adapter' },
    });
  });

  it('should initialize overlay when __DOMSCRIBE_OVERLAY_OPTIONS__ is set', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    (globalThis as Record<string, unknown>)['__DOMSCRIBE_OVERLAY_OPTIONS__'] = {
      initialMode: 'collapsed',
    };

    DomscribeDevProvider();
    capturedEffect?.();

    await vi.dynamicImportSettled();

    expect(mockInitOverlay).toHaveBeenCalled();
  });

  it('should not initialize overlay when __DOMSCRIBE_OVERLAY_OPTIONS__ is not set', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    DomscribeDevProvider();
    capturedEffect?.();

    await vi.dynamicImportSettled();

    expect(mockInitOverlay).not.toHaveBeenCalled();
  });
});
