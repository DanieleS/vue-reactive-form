import type { ComputedRef, Ref } from "@vue/reactivity"
import type { PartialOrPrimitive } from "./utils"

/**
 * Control of a node inside a form, with the give type.
 *
 * Allows access to the state management for the node, and metadata describing its status.
 */
export type InputControl<T> = {
  state: Ref<PartialOrPrimitive<T> | undefined>
  defaultValue: ComputedRef<PartialOrPrimitive<T> | undefined>
  dirty: ComputedRef<boolean>
  /**
   * When true it means that the current state is different from the default state.
   */
  isValid: ComputedRef<boolean>
  /**
   * Error message from the validation outcome.
   */
  errorMessage: ComputedRef<string | undefined>
  /**
   * Sets the state to undefined.
   */
  clear: () => void
  /**
   * Sets the state back to its default value.
   */
  reset: () => void
  /**
   * Updates the default value for the node.
   * This action should be discouraged, as it could lead to unwanted outcomes in dirty checking.
   *
   * @param newDefaultValue
   */
  updateDefaultValue: (newDefaultValue?: PartialOrPrimitive<T>) => void
}

/**
 * Control of an array node inside a form, with the give type.
 *
 * Exposes array specific methods, such as adding, removing or moving items around in the array.
 */
export type ArrayInputControl<T extends Array<unknown>> = InputControl<T> & {
  /**
   * Adds a new item to the state of the node.
   *
   * @param defaultValue the default value for tha item added.
   */
  add: (defaultValue?: PartialOrPrimitive<T[number]>) => void
  /**
   * Removes an item from the state of the node.
   *
   * @param index The index of the item to remove.
   */
  remove: (index: number) => void
  /**
   *Moves an item in the state of the node from an index to another.
   *
   * @param fromIndex The starting index where the item to be moved is found.
   * @param toIndex The index where the item will be at the end of the operation.
   */
  moveItem: (fromIndex: number, toIndex: number) => void
}
