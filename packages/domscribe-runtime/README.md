# @domscribe/runtime

Browser-side context capture engine for Domscribe.

`@domscribe/runtime` runs in the browser during development and captures component props, state, and DOM context when a developer clicks an element. It is framework-agnostic at its core — framework-specific behavior is provided by adapters.

## Install

```bash
npm install @domscribe/runtime
```

## Framework Support

| Framework     | Adapter            | Capture Strategy                                 |
| ------------- | ------------------ | ------------------------------------------------ |
| React 18-19   | `@domscribe/react` | Fiber walking, DevTools hook, BestEffort         |
| Vue 3         | `@domscribe/vue`   | VNode inspection, Composition + Options API      |
| Next.js 15-16 | `@domscribe/next`  | React adapter + `withDomscribe()` config wrapper |
| Nuxt 3+       | `@domscribe/nuxt`  | Vue adapter + auto-configured Nuxt module        |

For most projects you will install a framework adapter rather than `@domscribe/runtime` directly. The adapter declares `@domscribe/runtime` as a peer dependency and handles initialization.

## RuntimeManager

`RuntimeManager` is a singleton that manages the active adapter and provides the capture API to the overlay and other internal consumers.

```ts
import { RuntimeManager } from '@domscribe/runtime';

const runtime = RuntimeManager.getInstance();
await runtime.initialize({
  adapter: myAdapter,
  phase: 1,
  debug: false,
  redactPII: true,
  blockSelectors: [],
});
```

### Options

| Option           | Type               | Default       | Description                                                                                                 |
| ---------------- | ------------------ | ------------- | ----------------------------------------------------------------------------------------------------------- |
| `adapter`        | `FrameworkAdapter` | `NoopAdapter` | Framework adapter for context capture                                                                       |
| `phase`          | `1 \| 2`           | `1`           | Feature phase gate. Phase 1: props and state capture. Phase 2: event flow and performance metrics (future). |
| `debug`          | `boolean`          | `false`       | Enable debug logging                                                                                        |
| `redactPII`      | `boolean`          | `true`        | Redact sensitive values (emails, tokens) in captured data                                                   |
| `blockSelectors` | `string[]`         | `[]`          | CSS selectors for elements to skip during capture                                                           |

`initialize()` is safe to call multiple times — subsequent calls with the same configuration are no-ops.

## FrameworkAdapter Interface

Adapters implement the `FrameworkAdapter` interface to bridge the runtime to a specific framework's internal component model.

```ts
interface FrameworkAdapter {
  readonly name: string;
  readonly version?: string;
  getComponentInstance(element: HTMLElement): Nullable<unknown>;
  captureProps(component: unknown): Nullable<Record<string, unknown>>;
  captureState(component: unknown): Nullable<Record<string, unknown>>;
  getComponentName?(component: unknown): Nullable<string>;
  getComponentTree?(component: unknown): Nullable<ComponentTreeNode>;
}
```

See the [Custom Adapters Guide](./CUSTOM_ADAPTERS.md) for the full interface, a worked example, and integration instructions.

## Links

Part of [Domscribe](https://github.com/patchorbit/domscribe).

## License

MIT
