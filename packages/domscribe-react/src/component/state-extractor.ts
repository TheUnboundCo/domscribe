/**
 * StateExtractor - Extract state from React Fiber nodes
 *
 * Handles extraction of component state for both class and function components.
 * For class components, extracts from memoizedState. For function components,
 * extracts useState/useReducer state from the hook chain.
 *
 * @module @domscribe/react/component/state-extractor
 */

import type { ExtendedReactFiber } from '../fiber/types.js';
import type {
  StateExtractionResult,
  ComponentExtractionOptions,
} from './types.js';
import { REACT_FIBER_TAGS } from '../utils/constants.js';
import { StateExtractionError } from '../errors/index.js';

/**
 * StateExtractor class for extracting state from Fiber nodes
 */
export class StateExtractor {
  /**
   * Extract state from a Fiber node
   *
   * @param fiber - Fiber node to extract state from
   * @param options - Extraction options
   * @returns State extraction result
   */
  extract(
    fiber: ExtendedReactFiber,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: ComponentExtractionOptions,
  ): StateExtractionResult {
    if (!fiber) {
      return {
        success: false,
        stateType: 'none',
        error: new Error('Fiber node is required'),
      };
    }

    try {
      // Check component type and extract accordingly
      if (fiber.tag === REACT_FIBER_TAGS.ClassComponent) {
        return this.extractClassState(fiber);
      }

      if (
        fiber.tag === REACT_FIBER_TAGS.FunctionComponent ||
        fiber.tag === REACT_FIBER_TAGS.MemoComponent ||
        fiber.tag === REACT_FIBER_TAGS.SimpleMemoComponent ||
        fiber.tag === REACT_FIBER_TAGS.ForwardRef
      ) {
        return this.extractFunctionState(fiber);
      }

      // Other component types don't have state
      return {
        success: true,
        stateType: 'none',
      };
    } catch (error) {
      return {
        success: false,
        stateType: 'none',
        error:
          error instanceof Error
            ? error
            : new StateExtractionError('State extraction failed'),
      };
    }
  }

  /**
   * Extract state from a class component
   *
   * @param fiber - Class component Fiber node
   * @returns State extraction result
   */
  private extractClassState(fiber: ExtendedReactFiber): StateExtractionResult {
    // For class components, memoizedState IS the state
    const state = fiber.memoizedState;

    if (state === null || state === undefined) {
      return {
        success: true,
        stateType: 'class',
      };
    }

    // Ensure state is a record
    const stateRecord = this.ensureRecord(state);

    return {
      success: true,
      state: stateRecord,
      stateType: 'class',
    };
  }

  /**
   * Extract state from a function component
   *
   * @param fiber - Function component Fiber node
   * @returns State extraction result
   */
  private extractFunctionState(
    fiber: ExtendedReactFiber,
  ): StateExtractionResult {
    // For function components, we need to walk the hook chain
    if (!fiber.memoizedState) {
      return {
        success: true,
        stateType: 'hooks',
      };
    }

    // Extract state values from hooks - returns them as a record with indices as keys
    const stateRecord = this.extractStateFromHooks(fiber);

    if (Object.keys(stateRecord).length === 0) {
      return {
        success: true,
        stateType: 'hooks',
      };
    }

    return {
      success: true,
      state: stateRecord,
      stateType: 'hooks',
    };
  }

  /**
   * Extract state values from hook chain
   *
   * @param fiber - Fiber node with hooks
   * @returns Record mapping hook indices to state values
   */
  private extractStateFromHooks(
    fiber: ExtendedReactFiber,
  ): Record<string, unknown> {
    const stateRecord: Record<string, unknown> = {};
    let current: unknown = fiber.memoizedState;
    let hookIndex = 0;

    while (current && hookIndex < 100) {
      // Safety limit
      if (this.isHookNode(current)) {
        // Check if this is a state hook (useState or useReducer)
        // State hooks have memoizedState property
        if ('memoizedState' in current) {
          stateRecord[`hook_${hookIndex}`] = current.memoizedState;
        }

        current = current.next;
      } else {
        break;
      }

      hookIndex++;
    }

    return stateRecord;
  }

  /**
   * Check if a value is a hook node
   *
   * @param value - Value to check
   * @returns True if hook node
   */
  private isHookNode(value: unknown): value is {
    memoizedState: unknown;
    next: unknown;
  } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'next' in value &&
      ('memoizedState' in value || 'queue' in value || 'baseState' in value)
    );
  }

  /**
   * Ensure a value is a record (object with string keys)
   *
   * @param value - Value to check
   * @returns Record or empty object
   */
  private ensureRecord(value: unknown): Record<string, unknown> {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return {};
  }
}
