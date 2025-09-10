import { ref, type Ref } from "@vue/reactivity"
import type { Object } from "ts-toolbelt"
import { cloneDeep } from "lodash-es"
import type { FormControl, InputControl } from "./types"
import { createControlsTree } from "./controlsTree"

type FormState<T> = T extends object ? Object.Partial<T, "deep"> : T

export const useFormControl = <TState>(
  defaultState: FormState<TState>
): FormControl<TState> => {
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
