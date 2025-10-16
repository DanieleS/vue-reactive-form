import { ref, watch, type Ref } from "@vue/reactivity"
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
  const { validationSchema, validateOn = "change" } = options

  const defaultFormState = ref(cloneDeep(defaultState)) as Ref<
    TState | undefined
  >
  const state = ref(cloneDeep(defaultState)) as Ref<TState>
  const controlsCache = new Map<string, InputControl<unknown>>()
  const errors = ref<FormErrors>({})

  const form = createControlsTree<TState>(
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

      if (validateOn === "manual") {
        onSuccess?.(state.value as unknown as TValidatedState) // FIXME!!
      }

      const validationResult = await validate()

      if (validationResult) {
        onSuccess?.(validationResult)
      } else {
        onError?.(errors.value)
      }
    }
  }

  if (validateOn === "change") {
    watch(state, validate, { deep: true })
  }

  return {
    form,
    errors,
    validate,
    handleSubmit
  }
}
