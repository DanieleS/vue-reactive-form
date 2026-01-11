import { ref, type Ref } from "@vue/reactivity"
import type { ControlsCache, FormContext, FormErrors } from "./types/useForm"
import type { PartialOrPrimitive } from "./types/utils"
import { cloneDeep, get, set, type PropertyPath } from "lodash-es"

export const useFormContext = <TState>(
  defaultState?: PartialOrPrimitive<TState>
): FormContext<PartialOrPrimitive<TState>> => {
  const defaultFormState = ref(cloneDeep(defaultState)) as Ref<
    PartialOrPrimitive<TState | undefined>
  >
  const state = ref(cloneDeep(defaultState)) as Ref<PartialOrPrimitive<TState>>
  const controlsCache: ControlsCache = new Map()
  const errors = ref<FormErrors>({})

  const setFieldState = (
    path: PropertyPath,
    value: any,
    stateType: "default" | "current"
  ) => {
    const toBeUpdated = stateType === "default" ? defaultFormState : state

    if (Array.isArray(path) && path.length) {
      set(toBeUpdated, ["value", ...path], value)
    } else {
      toBeUpdated.value = value
    }
  }

  const getFieldState = (
    path: PropertyPath,
    stateType: "default" | "current"
  ) => {
    const toBeUpdated = stateType === "default" ? defaultFormState : state

    return Array.isArray(path) && path.length
      ? get(toBeUpdated.value, path)
      : toBeUpdated.value
  }

  const getFieldErrors = (path: PropertyPath) => {
    return (
      errors.value[Array.isArray(path) && path.length ? path.join(".") : ""] ??
      []
    )
  }

  return {
    state,
    defaultFormState,
    errors,
    controlsCache,
    setFieldState,
    getFieldState,
    getFieldErrors
  }
}
