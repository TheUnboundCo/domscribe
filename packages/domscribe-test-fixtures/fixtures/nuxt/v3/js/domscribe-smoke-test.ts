/**
 * Domscribe Smoke Test - Console utilities for testing runtime context capture
 *
 * In Nuxt, the main runtime initialization is handled by the domscribe.client.ts plugin.
 * This file is imported by app.vue to ensure the smoke test utilities are loaded.
 */

console.log('[domscribe] Smoke test module loaded (Nuxt).');
console.log('[domscribe] Runtime initialization handled by Nuxt plugin.');
console.log(
  '[domscribe] Available commands: domscribe.captureElement(el), domscribe.captureSelector(sel), domscribe.listTracked(), domscribe.status()',
);
