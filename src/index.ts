import { ref, type Ref } from "@vue/reactivity"
import { cloneDeep, groupBy } from "lodash-es"
import type { FormErrorsState, FormRoot, UseFormControlOptions } from "./types"
import type { PartialOrPrimitive } from "./types/utils"
import { createControlsTree } from "./controlsTree"
import { standardValidate } from "./validation"
import type { InputControl } from "./types/controls"

export const useForm = <TState, TValidatedState = TState>(
  defaultState?: PartialOrPrimitive<TState>,
  options: UseFormControlOptions<TState, TValidatedState> = {}
): FormRoot<TState, TValidatedState> => {
  const { validationSchema } = options

  const defaultFormState = ref(cloneDeep(defaultState)) as Ref<
    TState | undefined
  >
  const state = ref(cloneDeep(defaultState)) as Ref<TState>
  const controlsCache = new Map<string, InputControl<unknown>>()
  const errors = ref<FormErrorsState>({})

  const controlsTree = createControlsTree<TState>(
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

    const result = await standardValidate(validationSchema, state.value)

    if (!result.success) {
      errors.value = groupBy(
        result.issues,
        (issue) => `${issue.path.join(".")}`
      )
    } else {
      return result.output
    }
  }

  return {
    controlsTree,
    validate
  }
}
