import { computed } from "@vue/reactivity"
import { isEqual, isObject, type PropertyPath } from "lodash-es"
import { deepPick } from "./utils"
import type { InputControl } from "./types/controls"
import type { FormContext } from "./types/useForm"
import type { PartialOrPrimitive } from "./types/utils"

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
  context: Omit<FormContext<unknown>, "controlsCache">,
  path: PropertyPath = []
): InputControl<TState> => {
  const { setFieldState, getFieldState, getFieldErrors } = context
  // Updating the default value should be discouraged, so it's exposed as a read-only computed
  const defaultState = computed(() => getFieldState(path, "default"))
  const state = computed({
    get() {
      return getFieldState(path, "current")
    },
    set(value: TState) {
      setFieldState(path, value, "current")
    }
  })

  const dirty = computed(() => isDirty(state.value, defaultState.value))

  const isValid = computed(() => {
    const issues = getFieldErrors(path)
    return issues.length === 0
  })

  const errorMessage = computed<string | undefined>(() => {
    const issues = getFieldErrors(path)
    return issues[0]?.message
  })

  const clear = () => {
    setFieldState(path, undefined, "current")
  }
  const reset = () => {
    state.value = defaultState.value
  }
  const updateDefaultState = (newDefaultState?: PartialOrPrimitive<TState>) => {
    setFieldState(path, newDefaultState, "default")
  }

  return {
    defaultState,
    state,
    dirty,
    isValid,
    errorMessage,
    clear,
    reset,
    updateDefaultState
  }
}
