import type { errorSymbol, validationMetaSymbol } from "./symbols.js"
import type { ComputedRef, Ref } from "vue"

export type FormControlValidationMeta = {
  /**
   * Whether the control is required or not
   */
  isRequired: boolean
}

type WithValidationMeta = {
  [validationMetaSymbol]: FormControlValidationMeta
}

export type InputValidationDescriptor<T = any> = WithValidationMeta &
  (T extends any[]
    ? InputValidationDescriptor<T extends Array<infer R> ? R : never>
    : T extends Date | File
      ? {}
      : T extends Record<string, any>
        ? { [K in keyof T]: InputValidationDescriptor<T[K]> }
        : {})

export type DeepPartial<T> =
  T extends Array<any>
    ? T
    : T extends object
      ? T extends Function
        ? T
        : {
            [P in keyof T]?: DeepPartial<T[P]>
          }
      : T

export type FormValidationError = { message: string; path: string[] }

type WithErrors = {
  [errorSymbol]?: FormValidationError[]
}

export type FormValidationErrorsTree<T = any> = WithErrors &
  (T extends any[]
    ? FormValidationErrorsTree<T[number]>[]
    : T extends Date | File
      ? {}
      : T extends Record<string, any>
        ? Partial<{ [K in keyof T]: FormValidationErrorsTree<T[K]> }>
        : {})

export type PrimitiveControl<T> = {
  /**
   * Set the value of the form control.
   *
   * If the control represents a field, it sets the value of the field.
   * If it represents a sub form, it replaces the entire sub form with the new value.
   *
   * @param value The value to set
   */
  setState: (value: T | undefined) => void
  /**
   * Update the initial state of the form control.
   *
   * @param newInitialState The new initial state of the form control
   * @param keepCurrent Whether to keep the current state of the form control or not. Default is false (it updates the state of the form control to the new initial state)
   */
  updateInitialState: (newInitialState: T, keepCurrent?: boolean) => void
  /**
   * Set the value of the form control to undefined.
   */
  clear: () => void
  /**
   * Reset the form control to its initial state.
   */
  reset: () => void
}

export type ObjectControl<T extends Record<string, any>> = {
  [K in keyof T]-?: FormControl<T[K]>
}

/**
 * An IndexableIterator is an object that has an iterator and an index signature.
 */
type IndexableIterator<T> = {
  [Symbol.iterator](): IterableIterator<T>
  [index: number]: T
}

export type ArrayControl<T extends any[]> = {
  /**
   * The items of the array as FormControl objects.
   * You can use this property to access the items of the array as FormControl objects.
   *
   * It's an IndexableIterator, so you can access the items using the index (eg. items[0])
   * or iterate over them using a for...of loop, but you can't use the array methods (eg. items.map)
   *
   * If you need to use the array methods, you can convert it to an array using Array.from(items)
   */
  items: IndexableIterator<FormControl<T[number]>>
  /**
   * The size of the array
   */
  size: ComputedRef<number>
  /**
   * Add an item to the array.
   *
   * @param value The value to add to the array
   */
  addItem: (value: DeepPartial<T[number]>) => void
  /**
   * Remove one or more items from the array.
   *
   * @param indexes The indexes of the items to remove
   */
  removeItem: (...indexes: number[]) => void
  /**
   * Move an item from one index to another.
   */
  moveItem: (from: number, to: number) => void
  /**
   * Empty the array.
   */
  clear: () => void
}

export type Controls<T> = {
  /**
   * Handle the value of the form as an atomic value.
   * You can use this control to set the value of the field.
   */
  asPrimitive: PrimitiveControl<T>
} & (T extends any[]
  ? {
      /**
       * Handle the value of the form as an array.
       * You can use this control to add, remove or move items in the array.
       *
       * Moreover, you can use the `items` property to get the items of the array as FormControl objects.
       */
      asArray: ArrayControl<NonNullable<T>>
    }
  : T extends Date | File
    ? {}
    : T extends Record<string, any>
      ? {
          /**
           * Handle the value of the form as an object.
           * Through this control, you can access the fields of the object as FormControl objects.
           */
          asObject: ObjectControl<NonNullable<T>>
        }
      : {})

type InnerReadonlyFormControl<T> = {
  /**
   * The current value of the form control
   */
  state: Ref<T | undefined>
  /**
   * Whether the form control is dirty or not (in particular, if the state is deeply different from the initialValue)
   */
  isDirty: Ref<boolean>
  /**
   * Whether the form control is valid or not. It is initialized when the `validate` method is called (only available on FormControlRoot)
   */
  isValid: ComputedRef<boolean>
  /**
   * The error messages of the form control. It contains the errors related to that specific field or sub form
   */
  errorMessages: ComputedRef<string[]>
  /**
   * Whether the form control has errors or not. It is initialized when the `validate` method is called (only available on FormControlRoot)
   */
  hasErrors: Ref<boolean>
  /**
   * The initial value of the form control.
   * It is used to reset the form control to its initial state and to check if the form control is dirty.
   *
   * It may be updated using the `updateInitialState` method on the FormControlRoot or the `asPrimitive` control
   */
  initialValue: Ref<T>
  /**
   * The validation meta of the form control. It contains information about the validation of the form control
   */
  meta: FormControlValidationMeta & {}
}

type InnerFormControl<T> = InnerReadonlyFormControl<T> &
  Controls<NonNullable<T>>

/**
 * A FormControl, a controller for a sub part of the form.
 * It may be the entire form, a part of it or even a single field.
 * It can be used to read and write values to the form through specific controls based on the type T.
 *
 * It is **invariant** in T (except for undefined).
 * This means that you can't assign a FormControl<T> to a variable of type FormControl<U> if T and U are different, even if T extends U or vice versa.
 */
// It's defined in this way to be able to assign FormControl<T> to a variable of type FormControl<T | undefined> and vice versa
export type FormControl<T> = undefined extends T
  ? InnerFormControl<T>
  : InnerFormControl<T | undefined>

/**
 * If you don't need to _write_ values into the form, you can use this type, which is **covariant** in T
 */
export type ReadonlyFormControl<T> = undefined extends T
  ? InnerReadonlyFormControl<T>
  : InnerReadonlyFormControl<T | undefined>

/**
 * The root of the form control. It contains the entire form control and some additional methods.
 * It is used to validate the form, reset the form, update the initial state of the form and get the errors of the form.
 */
export type FormControlRoot<T> = FormControl<T> & {
  /**
   * The errors of the form. It contains the errors of the entire form
   */
  errors: ComputedRef<FormValidationErrorsTree<T> | undefined>
  /**
   * Clear the errors of the form
   */
  resetErrors: () => void
  /**
   * Trigger the validation of the form.
   * It updates the errors of the form and the `hasErrors`, `isValid` and `errors` of all the form controls
   *
   * @returns A promise that resolves when the validation is completed.
   */
  validate: () => Promise<boolean>
  /**
   * Update the initial state of the form.
   * Useful when you want to reset the isDirty state of the form (eg. after a successful submit)
   *
   * @param newInitialState The new initial state of the form
   * @param keepCurrent Whether to keep the current state of the form or not. Default is false (it updates the state of the form to the new initial state)
   */
  updateInitialState: (newInitialState: T, keepCurrent?: boolean) => void
}

export type FormValidationOptions<T> = {
  validator?: (v: T) => Promise<FormValidationErrorsTree<T> | undefined>
  validationDescriptor?: InputValidationDescriptor<T>
}
