import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { FormNode } from "./formNodes"
import type { InputControl } from "./controls"
import type { ValidationIssue } from "../validation"
import type { Ref } from "@vue/reactivity"

export type ControlsCache = Map<string, InputControl<unknown>>
export type FormErrors = Record<string, ValidationIssue[]>

export type UseFormOptions<TState, TValidatedState = TState> = {
  validationSchema: StandardSchemaV1<TState, TValidatedState>
}

export type HandleSubmitOptions<TValidatedState> = {
  onSuccess?: (state: TValidatedState) => void
  onError?: (errors: FormErrors) => void
}

export type HandleFormSubmit<TValidatedState> = (
  opts?: HandleSubmitOptions<TValidatedState>
) => (e?: SubmitEvent) => Promise<void>

export type FormRoot<TState, TValidatedState = TState> = {
  form: FormNode<TState>
  errors: Ref<FormErrors>
  validate: () => Promise<TValidatedState | undefined>
  handleSubmit: HandleFormSubmit<TValidatedState>
}
