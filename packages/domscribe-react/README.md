# @domscribe/react

React adapter for Domscribe — fiber walking, props/state extraction, and bundler plugins.

## Install

```bash
npm install -D @domscribe/react
```

## Vite

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { domscribe } from '@domscribe/react/vite';

export default defineConfig({
  plugins: [react(), domscribe()],
});
```

## Webpack

```js
const { DomscribeWebpackPlugin } = require('@domscribe/react/webpack');

// Add to plugins array + add webpack loader rule
// (see @domscribe/transform README for full webpack config)
```

## Plugin Options

The React plugin extends the base transform plugin options with `runtime` and `capture` namespaces:

```ts
interface DomscribeReactPluginOptions {
  // Base transform options
  include?: RegExp;
  exclude?: RegExp;
  debug?: boolean;
  relay?: { autoStart?: boolean; port?: number; host?: string };
  overlay?:
    | boolean
    | { initialMode?: 'collapsed' | 'expanded'; debug?: boolean };

  // React-specific
  runtime?: DomscribeRuntimeOptions;
  capture?: DomscribeReactCaptureOptions;
}
```

### Runtime Options

| Option           | Type       | Default | Description                                                     |
| ---------------- | ---------- | ------- | --------------------------------------------------------------- |
| `phase`          | `1 \| 2`   | `1`     | Feature phase gate (Phase 1: props/state, Phase 2: events/perf) |
| `redactPII`      | `boolean`  | `true`  | Redact sensitive values in captured data                        |
| `blockSelectors` | `string[]` | `[]`    | CSS selectors to exclude from capture                           |

### Capture Options

| Option              | Type                                     | Default         | Description                                                                                                                                                                       |
| ------------------- | ---------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `strategy`          | `'devtools' \| 'fiber' \| 'best-effort'` | `'best-effort'` | Capture strategy. `devtools` uses React DevTools hook (most reliable), `fiber` accesses Fiber tree directly (fast), `best-effort` tries multiple strategies                       |
| `maxTreeDepth`      | `number`                                 | `50`            | Maximum component tree depth to traverse                                                                                                                                          |
| `includeWrappers`   | `boolean`                                | `true`          | Include HOC/memo/forwardRef wrapper components                                                                                                                                    |
| `hookNameResolvers` | `Record<string, Record<number, string>>` | `undefined`     | Map component names to hook index to semantic name mappings. Keys are component names, values map hook index to name. Converted to `Map<string, Map<number, string>>` at runtime. |

## Subpath Exports

- `@domscribe/react/vite` — Vite plugin with React adapter
- `@domscribe/react/webpack` — Webpack plugin with React adapter
- `@domscribe/react/auto-init` — Auto-initialization module

---

Part of the [Domscribe](https://github.com/patchorbit/domscribe) monorepo. License: MIT.
