import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { FormNode } from "./formNodes"
import type { InputControl } from "./controls"
import type { ValidationIssue } from "../validation"
import type { Ref } from "@vue/reactivity"
import type { Required } from "ts-toolbelt/out/Object/Required"
import type { RequiredOrPrimitive } from "./utils"

export type ControlsCache = Map<string, InputControl<unknown>>
/**
 * Container for all form-wide validation errors.
 * The errors are stored with paths in dot notation as keys, and the list of issues for the property at such a path as the value.
 */
export type FormErrors = Record<string, ValidationIssue[]>

/**
 * Internal context shared across the form's control tree.
 * Contains all the core reactive state needed by form controls.
 */
export type FormContext<TState> = {
  /** The current form state */
  state: Ref<TState>
  /** The default/initial form state, used for dirty checking and reset */
  defaultFormState: Ref<TState | undefined>
  /** Form-wide validation errors keyed by path */
  errors: Ref<FormErrors>
  /** Cache of input controls to avoid re-creating them */
  controlsCache: ControlsCache
}

export type ValidateOn = "submit" | "change"

export type UseFormOptions<TState, TValidatedState = TState> = {
  validationSchema?: StandardSchemaV1<TState, TValidatedState>
}

export type HandleSubmitOptions<TValidatedState> = {
  /**
   * Called when the form is successfully submitted. Prevents default behavior of the form submission event.
   *
   * @param state The validated form state.
   */
  onSuccess?: (state: TValidatedState) => void
  /**
   * Called when the form submission fails due to validation errors.
   *
   * @param errors The form errors.
   */
  onError?: (errors: FormErrors) => void
}

export type HandleFormSubmit<TValidatedState> = (
  opts?: HandleSubmitOptions<TValidatedState>
) => (e?: Event) => Promise<void>

export type FormRoot<TState, TValidatedState = TState> = {
  /**
   * Entry point to the form tree.
   * Allows to navigate the state of the form to have access to the form-related metadata for each node.
   * The form state is passed as a deeply required object to ensure that navigation is possible up to every node.
   */
  form: FormNode<RequiredOrPrimitive<TState>>
  /**
   * Object containing all of the validation errors for the form after some validation occurred.
   */
  errors: Ref<FormErrors>
  /**
   * Handler to imperatively invoke the form's validation.
   * When successful returns the validates tate, otherwise it returns undefined.
   */
  validate: () => Promise<TValidatedState | undefined>
  /**
   * Function to create the formSubmit handler that can be bound or called when the submit takes place.
   * onSuccess and onError callbacks can be provided as needed to handle follow-ups based on the outcome.
   */
  handleSubmit: HandleFormSubmit<TValidatedState>
}
