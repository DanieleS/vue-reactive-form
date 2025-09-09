import { ref, shallowRef, type Ref } from "@vue/reactivity"
import type { Object } from "ts-toolbelt"
import { cloneDeep } from "lodash-es"
import type { FormControl, InputControl } from "./types"
import { createControlsTree } from "./controlsTree"

export const useFormControl = <TState = any>(
  defaultState: Object.Partial<{ internal: TState }, "deep">["internal"] = {}
): FormControl<TState> => {
  const defaultFormState = shallowRef(cloneDeep(defaultState)) as Ref<TState>
  const state = ref(cloneDeep(defaultState)) as Ref<TState>
  const controlsCache = new Map<string, InputControl<unknown>>()

  const controlsTree = createControlsTree<TState>(
    state,
    defaultFormState,
    controlsCache
  )

  return {
    controlsTree
  }
}
