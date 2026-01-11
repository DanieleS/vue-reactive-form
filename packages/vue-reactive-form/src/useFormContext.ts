import { ref, type Ref } from "@vue/reactivity"
import type { ControlsCache, FormContext, FormErrors } from "./types/useForm"
import type { PartialOrPrimitive } from "./types/utils"
import { cloneDeep } from "lodash-es"

export const useFormContext = <TState>(
  defaultState?: PartialOrPrimitive<TState>
): FormContext<PartialOrPrimitive<TState>> => {
  const defaultFormState = ref(cloneDeep(defaultState)) as Ref<
    PartialOrPrimitive<TState | undefined>
  >
  const state = ref(cloneDeep(defaultState)) as Ref<PartialOrPrimitive<TState>>
  const controlsCache: ControlsCache = new Map()
  const errors = ref<FormErrors>({})

  return {
    state,
    defaultFormState,
    errors,
    controlsCache
  }
}
