import { ref, type Ref } from "@vue/reactivity"
import { cloneDeep, groupBy } from "lodash-es"
import type { FormErrorsState, FormRoot, UseFormControlOptions } from "./types"
import type { PartialOrPrimitive } from "./types/utils"
import { createControlsTree } from "./controlsTree"
import { standardValidate } from "./validation"
import type { InputControl } from "./types/controls"

export const useFormControl = <TState, TValidatedState = TState>(
  defaultState?: PartialOrPrimitive<TState>,
  options: UseFormControlOptions<TState, TValidatedState> = {}
): FormRoot<TState, TValidatedState> => {
  type WrappedState = { inner: TState }

  const { validationSchema } = options

  const defaultFormState = ref({
    inner: cloneDeep(defaultState)
  }) as Ref<WrappedState>
  const state = ref({ inner: cloneDeep(defaultState) }) as Ref<WrappedState>
  const controlsCache = new Map<string, InputControl<unknown>>()
  const errors = ref<FormErrorsState>({})

  const controlsTree = createControlsTree<WrappedState>(
    state,
    defaultFormState,
    errors,
    controlsCache
  )

  const validate = async () => {
    if (!validationSchema) {
      console.warn(
        "[vue-reactive-form] No validation schema provided. Skipping validation."
      )
      return
    }

    errors.value = {}

    const result = await standardValidate(validationSchema, state.value.inner)

    if (!result.success) {
      errors.value = groupBy(result.issues, (issue) =>
        !issue.path.length ? "inner" : `inner.${issue.path.join(".")}`
      )
    } else {
      return result.output
    }
  }

  return {
    controlsTree: controlsTree.inner,
    validate
  }
}
