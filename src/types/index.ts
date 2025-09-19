import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { FormNode } from "./formNodes"
import type { InputControl } from "./controls"
import type { ValidationIssue } from "../validation"

export type ControlsCache = Map<string, InputControl<unknown>>
export type FormErrorsState = Record<string, ValidationIssue[]>

export type UseFormControlOptions<TState, TValidatedState = TState> = {
  validationSchema?: StandardSchemaV1<TState, TValidatedState>
}

export type FormRoot<TState, TValidatedState = TState> = {
  controlsTree: FormNode<TState>
  validate: () => Promise<TValidatedState | undefined>
}
