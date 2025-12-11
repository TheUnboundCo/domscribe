'use client';

/**
 * DomscribeDevProvider - React client component for runtime initialization
 * @module @domscribe/next/runtime/domscribe-provider
 */
import { useEffect } from 'react';

/**
 * Client component that initializes Domscribe runtime + overlay in dev mode.
 *
 * Add to your root layout:
 * ```tsx
 * import { DomscribeDevProvider } from '@domscribe/next/runtime';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <DomscribeDevProvider />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * Renders nothing — only performs side-effect initialization.
 * All imports are dynamic and wrapped in catch() — never breaks the app.
 */
export function DomscribeDevProvider() {
  useEffect(() => {
    // Dev-only: skip all initialization in production.
    // Next.js inlines process.env.NODE_ENV at build time, so the
    // bundler can dead-code-eliminate the dynamic imports below.
    if (process.env.NODE_ENV === 'production') return;

    // Relay and overlay globals (window.__DOMSCRIBE_RELAY_PORT__, etc.)
    // are injected by the turbopack/webpack loader into a transformed
    // module. Module-level code executes before React mounts, so the
    // globals are already available by the time this effect fires.

    // Initialize runtime + react adapter
    Promise.all([import('@domscribe/runtime'), import('@domscribe/react')])
      .then(([{ RuntimeManager }, { createReactAdapter }]) => {
        RuntimeManager.getInstance().initialize({
          adapter: createReactAdapter(),
        });
      })
      .catch((err) => {
        // Never break the app
        console.warn('[domscribe] Runtime init failed:', err);
      });

    // Initialize overlay if configured (globals set by loader)
    const win = globalThis as Record<string, unknown>;
    if (win['__DOMSCRIBE_OVERLAY_OPTIONS__']) {
      import('@domscribe/overlay')
        .then(({ initOverlay }) => {
          initOverlay();
        })
        .catch((err) => {
          // Overlay is optional
          console.warn('[domscribe] Overlay init failed:', err);
        });
    }
  }, []);

  return null;
}
