import { ref, type Ref } from "@vue/reactivity"
import { cloneDeep } from "lodash-es"
import type { FormRoot, InputControl } from "./types"
import type { PartialOrPrimitive } from "./types/utils"
import { createControlsTree } from "./controlsTree"

export const useFormControl = <TState, TValidatedState = TState>(
  defaultState?: PartialOrPrimitive<TState>
): FormRoot<TState> => {
  type WrappedState = { inner: TState }

  const defaultFormState = ref({
    inner: cloneDeep(defaultState)
  }) as Ref<WrappedState>
  const state = ref({ inner: cloneDeep(defaultState) }) as Ref<WrappedState>
  const controlsCache = new Map<string, InputControl<unknown>>()

  const controlsTree = createControlsTree<WrappedState>(
    state,
    defaultFormState,
    controlsCache
  )

  return {
    controlsTree: controlsTree.inner
  }
}
