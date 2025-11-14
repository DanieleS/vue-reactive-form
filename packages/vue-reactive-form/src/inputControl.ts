import { computed, type Ref } from "@vue/reactivity"
import { get, isEqual, isObject, set } from "lodash-es"
import { deepPick } from "./utils"
import type { InputControl } from "./types/controls"
import type { FormErrors } from "./types/useForm"
import type { PartialOrPrimitive } from "./types/utils"

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

const errorsGet = (target: FormErrors, p: (string | symbol | number)[]) =>
  target[p.length ? p.join(".") : ""] ?? []

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
  formErrors: Ref<FormErrors>,
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

  const isValid = computed(() => {
    const issues = errorsGet(formErrors.value, path)
    return issues.length === 0
  })

  const errorMessage = computed<string | undefined>(() => {
    const issues = errorsGet(formErrors.value, path)
    return issues[0]?.message
  })

  const clear = () => {
    formSet(formState, path, undefined)
  }
  const reset = () => {
    state.value = defaultValue.value
  }
  const updateDefaultValue = (newDefaultValue?: PartialOrPrimitive<TState>) => {
    formSet(defaultFormState, path, newDefaultValue)
  }

  return {
    defaultValue,
    state,
    dirty,
    isValid,
    errorMessage,
    clear,
    reset,
    updateDefaultValue
  }
}
