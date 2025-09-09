import cloneDeep from "lodash/cloneDeep"
import isEqual from "lodash/isEqual"
import get from "lodash/get"
import isSymbol from "lodash/isSymbol"
import keys from "lodash/keys"
import set from "lodash/set"
import type { O } from "ts-toolbelt"
import type { Ref, UnwrapRef } from "vue"
import { computed, ref, watch } from "vue"
import type {
  Controls,
  FormControl,
  FormControlRoot,
  FormValidationOptions,
  PrimitiveControl,
  FormValidationError,
  FormValidationErrorsTree,
  FormControlValidationMeta,
  InputValidationDescriptor,
} from "./types"
import { errorSymbol, validationMetaSymbol } from "./symbols"
import { moveItemInArray } from "./utils/array"
import { deepPick } from "./utils/object"

/*
This is an implementation of a form library that provides a way to create form controls for a form.
Every Input component defined in the `lib` accept a form control as a prop, 
in this way they can interact with the form instance.

The general idea is: a FormControl is a reactive object that contains the state of the form, 
but it exposes methods to interact with the form in a safer and fine grain way. It also
provides utilities to validate and check the state of the form.
*/

export const hasErrorsDeep = (
  errors?: FormValidationErrorsTree<any>,
  startPath: string[] = [],
): boolean => {
  if (!errors) return false

  const startErrors = startPath.length ? get(errors, startPath) : errors

  if (startErrors?.[errorSymbol]?.length) return true
  const hasDeepErrors = Object.keys(startErrors ?? {}).some((key) =>
    hasErrorsDeep(errors, [...startPath, key]),
  )

  return hasDeepErrors
}

const defaultMeta: FormControlValidationMeta = {
  isRequired: false,
}

/**
 * This function converts a FormControl state path to a ValidationDescriptor path.
 * This is needed as the ValidationDescriptor path is different from the FormControl path.
 *
 * @param path The path of the FormControl state
 * @returns The path of the ValidationDescriptor
 */
const toInputValidationDescriptorPath = (path: string[]) => {
  if (!path.length) return path

  return path.filter((p) => !isSymbol(p) && isNaN(parseInt(p)))
}

/**
 * This function gets the value of a property in a reactive object, given the path.
 *
 * If the path is empty, it returns the object itself.
 *
 * @param target The reactive object
 * @param p The path of the property
 * @returns The value of the property
 */
const formGet = (target: any, p: (string | symbol | number)[]) =>
  p.length ? get(target, p) : target

/**
 * This function sets the value of a property in a reactive object, given the path.
 *
 * @param target A ref to the object
 * @param p The path of the property
 * @param newVal The new value of the property
 */
const formSet = (
  target: Ref<any>,
  p: (string | symbol | number)[],
  newVal: any,
) => {
  if (p.length) {
    set(target, ["value", ...p], newVal)
  } else {
    target.value = newVal
  }
}

/**
 * This is the core function of the form control library.
 * It recursively builds the controls for the form control.
 *
 * **Important note**: This function always returns
 * controls as if the value is both a primitive, an array and an object.
 * The "absurd" controls are not exposed to the user using TypeScript,
 * but they still exist in the object.
 *
 * @param state A ref to the global state of the form
 * @param errors A ref to the errors of the form
 * @param initialValueRef A ref to the initial value of the form
 * @param path The path of the current control
 * @param refCache A cache to store the controls
 * @param validationDescriptor The validation descriptor of the form
 * @returns The controls of the form/field
 */
const buildControls = <T = any>(
  state: Ref<UnwrapRef<T>>,
  errors: Ref<FormValidationErrorsTree<T> | undefined>,
  initialValueRef: Ref<any>,
  path: string[],
  refCache: Map<string, any>,
  validationDescriptor?: InputValidationDescriptor<T>,
): any => {
  const getChildrenInternal = (_target: unknown, p: string) => {
    // Ignore some properties to avoid dev tools hanging
    if (["getters", Symbol.toStringTag].includes(p)) return

    const newPath = [...path, p as string]

    const sPath = newPath.join(".")

    // If the control is already in the cache, return it
    if (refCache.has(sPath)) {
      return refCache.get(sPath)
    }

    const childState = computed(() => formGet(state.value, newPath))

    const isDirty = computed(
      () => !isEqual(childState.value, formGet(initialValueRef.value, newPath)),
    )

    const hasErrors = computed(() => hasErrorsDeep(errors.value, newPath))

    watch(childState, () => {
      formSet(errors, [...newPath, errorSymbol], undefined)
    })

    // Control is a "window" to the form state
    const control: FormControl<T> = {
      state: childState,
      isDirty,
      ...buildControls(
        state,
        errors,
        initialValueRef,
        newPath,
        refCache,
        validationDescriptor,
      ),
      initialValue: computed(() => formGet(initialValueRef.value, newPath)),
      errorMessages: computed(() =>
        (get(errors.value ?? {}, [...newPath, errorSymbol]) ?? []).map(
          (e: FormValidationError) => e.message,
        ),
      ),
      hasErrors,
      isValid: computed(() => !hasErrors.value),
      meta: get(
        validationDescriptor,
        [...toInputValidationDescriptorPath(newPath), validationMetaSymbol],
        defaultMeta,
      ),
    }

    // Cache the control to avoid creating it multiple times
    refCache.set(sPath, control)

    return control
  }

  const childrenGet = (_target: unknown, p: string | symbol) => {
    // If the user is trying to iterate on the properties of the object, we return an iterator
    if (p === Symbol.iterator) {
      const value = formGet(state.value, path)
      const keysOfValue = keys(value)

      return function* () {
        for (const key of keysOfValue) {
          yield getChildrenInternal(_target, key)
        }
      }
    }

    return getChildrenInternal(_target, p as string)
  }

  /**
   * This is the proxy object used to handle the object controls.
   *
   * It uses a Proxy object to intercept the access to the properties of the object and
   * return the corresponding FormControl object.
   *
   * It works creating a new FormControl object for each property of the object "on the fly".
   *
   * They are then stored in a cache to avoid creating the same object multiple times.
   */
  const childrenProxy = new Proxy<Record<keyof T, unknown>>({} as any, {
    get: childrenGet,
    // make sure that the keys belong to the object (own keys)
    ownKeys() {
      const value = formGet(state.value, path)
      return keys(value)
    },
    // make sure that the keys are enumerable
    getOwnPropertyDescriptor(_target, p: string) {
      const value = formGet(state.value, path)
      const keysOfValue = keys(value)

      if (keysOfValue.includes(p)) {
        return {
          configurable: true,
          enumerable: true,
          writable: false,
        }
      }

      return undefined
    },
  })

  const objectControl = childrenProxy

  const getValueAsArray = () => {
    const array = formGet(state.value, path)
    if (!Array.isArray(array) && typeof array !== "undefined") {
      throw new Error(`value at ${path.join(".")} is not an array`)
    }

    return array
  }

  const arrayControl = {
    items: childrenProxy,
    size: computed(() => {
      const array = getValueAsArray()

      return array?.length
    }),
    addItem: (value: unknown) => {
      const array = getValueAsArray()

      set(state, ["value", ...path, array?.length ?? 0], cloneDeep(value))
    },
    removeItem: (...indexes: number[]) => {
      const array = getValueAsArray()

      // indexes sorted in descending order so that we don't mess up the indexes when performing the splice
      const sortedIndexes = indexes.toSorted((a, b) => b - a)

      for (const index of sortedIndexes) {
        array?.splice(index, 1)
      }
    },
    moveItem: (from: number, to: number) => {
      const array = getValueAsArray()

      if (!array) return

      const result = moveItemInArray(from, to, array)
      set(state, ["value", ...path], result)
    },
    clear: () => {
      set(state, ["value", ...path], [])
    },
  }

  const primitiveSetState = (value: UnwrapRef<T>) => {
    formSet(state, path, value)
  }

  const primitiveControl: PrimitiveControl<any> = {
    setState: primitiveSetState,
    reset: () => primitiveSetState(formGet(initialValueRef.value, path)),
    clear: () => primitiveSetState(undefined as any),
    updateInitialState: (newInitialState: any) =>
      formSet(initialValueRef, path, newInitialState),
  }

  return {
    asPrimitive: primitiveControl,
    asArray: arrayControl,
    asObject: objectControl,
  }
}

/**
 * This function creates a FormControl object. A FormControl is controller for the entire form.
 * It handles the state of the form, the validation, the initial values, states such us dirty, valid, etc.
 *
 * It works by inferring the type of the form from the generic type of the function.
 * It provides a set of methods to interact with the form in a fine grain way,
 * enforcing correctness of the state through TypeScript.
 *
 * @example Simple form control for a string
 * ```ts
 * const form = useFormControl<string>();
 * // Set the value of the form
 * form.asPrimitive.setState('Hello world');
 *
 * // Retrieve the value of the form
 * form.state.value; // 'Hello world'
 * ```
 * @example Form control for an object
 * ```ts
 * const form = useFormControl<{ name: string, age: number }>();
 * // Set the value of the form
 * form.asObject.name.setState('John Doe');
 * form.asObject.age.setState(30);
 *
 * // Retrieve the value of the form
 * form.state.value; // { name: 'John Doe', age: 30 }
 * ```
 *
 * @example Form control with validation
 * ```ts
 * const form = useFormControl<string>(undefined, yupAdapter(yup.string().required()));
 *
 * // Validate the form
 * await form.validate();
 *
 * form.isValid.value; // false
 * form.errorMessages.value; // ['This field is required']
 * ```
 *
 * @template T The type of the form. It's optional but it's recommended to provide it.
 * @param initialValue The initial value of the form. If not provided, the state of the form would be undefined. You can provide a deep partial of the form.
 * @param validationOptions The validation options for the form. You can provide the options using the `yupAdapter` function.
 * @returns The FormControl object
 */
export const useFormControl = <T = any>(
  initialValue?: O.Partial<{ value: T }, "deep">["value"],
  { validator, validationDescriptor }: FormValidationOptions<T> = {},
): FormControlRoot<T> => {
  const initialValueRef = ref<T>(initialValue as any)
  const state = ref<T>(cloneDeep(initialValue) as any)
  const errors = ref<FormValidationErrorsTree<T>>()

  const hasErrors = computed(() => hasErrorsDeep(errors.value))
  /**
   * Check if the form is dirty
   * We are filtering both inputs of possibly undefined values to avoid false positives, that might occur
   * when some property is not defined in some cases, and there but with value of `undefined` in some others
   */
  const isDirty = computed(
    () =>
      !isEqual(
        deepPick(state.value, (v) => v !== undefined),
        deepPick(initialValueRef.value, (v) => v !== undefined),
      ),
  )
  const isValid = computed(() => !hasErrors.value)

  const resetErrors = () => (errors.value = undefined)

  const validate = async () => {
    if (!validator) return Promise.resolve()

    resetErrors()

    errors.value = await validator(state.value as T)

    return !errors.value
  }

  const refCache = new Map<string, any>()

  return {
    state,
    isDirty,
    isValid,
    errors: computed(() => errors.value),
    errorMessages: computed(
      () => errors.value?.[errorSymbol]?.map((e) => e.message) ?? [],
    ),
    resetErrors,
    validate,
    hasErrors,
    initialValue: initialValueRef,
    updateInitialState: (newInitialState: T, keepCurrent = false) => {
      if (!keepCurrent) {
        state.value = cloneDeep(newInitialState) as any
      }
      initialValueRef.value = newInitialState as any
    },
    ...(buildControls(
      state,
      errors,
      initialValueRef,
      [],
      refCache,
      validationDescriptor,
    ) as unknown as Controls<UnwrapRef<T>>),
    meta: validationDescriptor?.[validationMetaSymbol] ?? defaultMeta,
  } as unknown as FormControlRoot<T>
}

/**
 * Creates a form control for a model reference.
 * Useful when you define a model with `defineModel` but you need a form control.
 *
 * @template T - The type of the model.
 * @param {Ref<T | undefined>} modelRef - The model reference.
 * @returns {FormControl<T>} - The form control object.
 */
export const useModelControl = <T>(
  modelRef: Ref<T | undefined>,
): FormControl<T> => {
  const control = useFormControl<T>(modelRef.value)
  watch(modelRef, (value) =>
    control.asPrimitive.setState(value as NonNullable<T> | undefined),
  )
  watch(control.state, (value) => (modelRef.value = value), { deep: true })

  return control
}
