import { computed, type Ref } from "@vue/reactivity"
import type { InputControl } from "./types"
import { get, isEqual, isObject, set } from "lodash-es"
import { deepPick } from "./utils"

/**
 * This function gets the value of a property in a reactive object, given the path.
 *
 * If the path is empty, it returns the object itself.
 *
 * @param target The reactive object
 * @param p The path of the property
 * @returns The value of the property
 */
const formGet = (target: any, p: (string | symbol | number)[]) =>
  p.length ? get(target, p) : target

/**
 * This function sets the value of a property in a reactive object, given the path.
 *
 * @param target A ref to the object
 * @param p The path of the property
 * @param newVal The new value of the property
 */
const formSet = (
  target: Ref<any>,
  p: (string | symbol | number)[],
  newVal: any
) => {
  if (p.length) {
    set(target, ["value", ...p], newVal)
  } else {
    target.value = newVal
  }
}

const isDirty = (value: unknown, defaultValue: unknown) => {
  /**
   * When inputs are objects we filter them of possibly undefined values to avoid false positives, that might occur
   * when some property is not defined in some cases, and there but with value of `undefined` in some others
   */
  if (isObject(value) && isObject(defaultValue)) {
    return !isEqual(
      deepPick(value, (v) => v !== undefined),
      deepPick(defaultValue, (v) => v !== undefined)
    )
  }

  return !isEqual(value, defaultValue)
}

export const createInputControl = <TState>(
  formState: Ref<unknown>,
  defaultFormState: Ref<unknown>,
  path: (string | number | symbol)[] = []
): InputControl<TState> => {
  // Updating the default value should be discouraged, so it's exposed as a read-only computed
  const defaultValue = computed(() => formGet(defaultFormState.value, path))
  const state = computed({
    get() {
      return formGet(formState.value, path)
    },
    set(value: TState) {
      formSet(formState, path, value)
    }
  })

  const dirty = computed(() => isDirty(state.value, defaultValue.value))

  const clear = () => {
    formSet(formState, path, undefined)
  }
  const reset = () => {
    state.value = defaultValue.value
  }
  const updateDefaultValue = (newDefaultValue: TState) => {
    formSet(defaultFormState, path, newDefaultValue)
  }

  return {
    defaultValue,
    state,
    dirty,
    clear,
    reset,
    updateDefaultValue
  }
}

export const getInputControl = (
  formState: Ref<unknown>,
  defaultFormState: Ref<unknown>,
  controlsCache: Map<string, InputControl<unknown>>,
  path: (string | number | symbol)[]
) => {
  console.log("aaaaaaaaaaaaaa INPUT CONTROL", path)
  const concatenatedPath: string = path.join(".")

  if (!controlsCache.has(concatenatedPath)) {
    controlsCache.set(
      concatenatedPath,
      createInputControl(formState, defaultFormState, path)
    )
  }

  return controlsCache.get(concatenatedPath)
}
