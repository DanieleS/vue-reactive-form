import { ref, type Ref } from "@vue/reactivity"
import { cloneDeep, groupBy } from "lodash-es"
import type {
  FormErrors,
  FormRoot,
  HandleSubmitOptions,
  UseFormOptions
} from "./types"
import type { PartialOrPrimitive } from "./types/utils"
import { createControlsTree } from "./controlsTree"
import { standardValidate } from "./validation"
import type { InputControl } from "./types/controls"

export const useForm = <TState, TValidatedState = TState>(
  defaultState?: PartialOrPrimitive<TState>,
  options: UseFormOptions<TState, TValidatedState> = {}
): FormRoot<TState, TValidatedState> => {
  const { validationSchema } = options

  const defaultFormState = ref(cloneDeep(defaultState)) as Ref<
    PartialOrPrimitive<TState | undefined>
  >
  const state = ref(cloneDeep(defaultState)) as Ref<PartialOrPrimitive<TState>>
  const controlsCache = new Map<string, InputControl<unknown>>()
  const errors = ref<FormErrors>({})

  const form = createControlsTree<PartialOrPrimitive<TState>>(
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
      return state.value as unknown as TValidatedState // FIXME!!
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

  const handleSubmit = (options: HandleSubmitOptions<TValidatedState> = {}) => {
    const { onSuccess, onError } = options

    return async (event?: SubmitEvent) => {
      event?.preventDefault()

      const validationResult = await validate()

      if (validationResult) {
        onSuccess?.(validationResult)
      } else {
        onError?.(errors.value)
      }
    }
  }

  return {
    form,
    errors,
    validate,
    handleSubmit
  }
}
