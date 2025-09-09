import {
  computed,
  ref,
  shallowRef,
  type ComputedRef,
  type Ref
} from "@vue/reactivity"
import type { IsArray, IsPlainObject } from "./types/utils"
import type { Object } from "ts-toolbelt"
import { cloneDeep, get, isDate, isEqual, set } from "lodash-es"

type InputControl<T> = {
  state: Ref<T | undefined>
  defaultValue: ComputedRef<T | undefined>
  dirty: ComputedRef<boolean>
  clear: () => void
  reset: () => void
  updateDefaultValue: (newDefaultValue: T) => void
  // .. all other input metadata
}

type FormControl<T extends object> = {
  controlsTree: FormNode<T>
  // .. all other root form api (validate, submit, etc..)
}

type PrimitiveFormNode<T> = {
  control: InputControl<T> // maybe could be turned to control() to differentiate from the other properties..?
}

type ObjectFormNode<T extends object> = PrimitiveFormNode<T> & {
  [Key in keyof T]: FormNode<T[Key]>
}

type ArrayFormNode<T extends unknown[]> = PrimitiveFormNode<T> & {
  [index: number]: FormNode<T[number]>
  [Symbol.iterator](): IterableIterator<FormNode<T[number]>>
}

type FormNode<T> = IsPlainObject<T> extends true
  ? ObjectFormNode<T & object>
  : IsArray<T> extends true
  ? ArrayFormNode<T & unknown[]>
  : PrimitiveFormNode<T>

// remove this and use it from the module it's defined on
// was put here because I was lazy
const deepPick = (
  obj: any,
  condition: (value: any, key: string) => boolean
) => {
  const result: any = Array.isArray(obj) ? [] : {}

  const recurse = (current: any, path: string[]) => {
    if (typeof current !== "object" || current === null) {
      return
    }

    for (const key in current) {
      if (current.hasOwnProperty(key)) {
        const value = current[key]
        const newPath = path.concat(key)

        if (typeof value === "object" && value !== null && !isDate(value)) {
          recurse(value, newPath)
        } else if (condition(value, key)) {
          set(result, newPath, value)
        }
      }
    }
  }

  recurse(obj, [])
  return result
}

const createControl = <T>(
  formState: Ref<Object.Partial<object, "deep">>,
  defaultFormState: Ref<Object.Partial<object, "deep">>,
  path: (string | number | symbol)[]
): InputControl<T> => {
  // Updating the default value should be discouraged, so it's exposed as a read-only computed
  const defaultValue = computed(() => get(defaultFormState.value, path))
  const state = computed({
    get() {
      return get(formState.value, path)
    },
    set(value: T) {
      set(formState.value, path, value)
    }
  })

  /**
   * Check if the form is dirty
   * We are filtering both inputs of possibly undefined values to avoid false positives, that might occur
   * when some property is not defined in some cases, and there but with value of `undefined` in some others
   */
  const dirty = computed(
    () =>
      !isEqual(
        deepPick(state.value, (v) => v !== undefined),
        deepPick(defaultValue.value, (v) => v !== undefined)
      )
  )

  const clear = () => {
    set(formState.value, path, undefined)
  }
  const reset = () => {
    state.value = defaultValue.value
  }
  const updateDefaultValue = (newDefaultValue: T) => {
    set(defaultFormState.value, path, newDefaultValue)
  }

  return {
    defaultValue,
    state,
    dirty,
    clear,
    reset,
    updateDefaultValue
  }
}

const getOrCreateControl = (
  formState: Ref<Object.Partial<object, "deep">>,
  defaultFormState: Ref<Object.Partial<object, "deep">>,
  controlsCache: Map<string, InputControl<unknown>>,
  path: (string | number | symbol)[]
) => {
  const concatenatedPath: string = path.join(".")

  if (!controlsCache.has(concatenatedPath)) {
    controlsCache.set(
      concatenatedPath,
      createControl(formState, defaultFormState, path)
    )
  }

  return controlsCache.get(concatenatedPath)
}

const createControlTree = <T extends object>(
  formState: Ref<Object.Partial<T, "deep">>,
  defaultFormState: Ref<Object.Partial<T, "deep">>,
  controlsCache: Map<string, InputControl<unknown>>
) => {
  const buildProxyHandler = (path: (string | number | symbol)[] = []) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(target: any, handlerPath: string | number | symbol) {
      const fullPath = [...path, handlerPath]

      if (handlerPath === Symbol.iterator) {
        return function* () {
          const array = get(formState.value, path) ?? []
          for (let i = 0; i < array.length; i++) {
            const iteratorPath = [...path, i]
            target[i] = buildProxyControl(
              formState,
              defaultFormState,
              controlsCache,
              iteratorPath
            )
            yield target[i]
          }
        }
      }

      if (!(handlerPath in target)) {
        target[handlerPath] = buildProxyControl(
          formState,
          defaultFormState,
          controlsCache,
          fullPath
        )
      }
      return target[handlerPath]
    }
  })

  const buildProxyControl = (
    formState: Ref<Object.Partial<object, "deep">>,
    defaultFormState: Ref<Object.Partial<object, "deep">>,
    controlsCache: Map<string, InputControl<unknown>>,
    path: (string | number | symbol)[]
  ) =>
    new Proxy(
      {
        control: getOrCreateControl(
          formState,
          defaultFormState,
          controlsCache,
          path
        )
      },
      buildProxyHandler(path)
    )

  return new Proxy<FormNode<T>>({} as FormNode<T>, buildProxyHandler())
}

const useFormControl = <T extends object>(
  defaultState: Object.Partial<T, "deep"> = {}
): FormControl<T> => {
  const defaultFormState = shallowRef(cloneDeep(defaultState))
  const state = ref<Object.Partial<T, "deep">>(cloneDeep(defaultState))
  const controlsCache = new Map<string, InputControl<unknown>>()

  const controlsTree = createControlTree<T>(
    state,
    defaultFormState,
    controlsCache
  )

  return {
    controlsTree
  }
}

type State = {
  name: string
  age: number
  address: {
    street: string
    city: string
  }
  tags: string[]
}

const testControl = useFormControl<State>({
  address: {
    city: "Gotham"
  }
})

testControl.controlsTree.age.control.state.value = 21
testControl.controlsTree.address.control.state.value = {
  street: "123 Main St",
  city: "Metropolis"
}
testControl.controlsTree.name.control.state.value = "John Doe"

console.log(
  "aaaaaaaaaaaaaa",
  testControl.controlsTree.name.control.defaultValue.value,
  testControl.controlsTree.name.control.state.value,
  " - ",
  testControl.controlsTree.address.control.defaultValue.value,
  testControl.controlsTree.address.control.state.value,
  " - ",
  testControl.controlsTree.address.city.control.defaultValue.value,
  testControl.controlsTree.address.city.control.state.value,
  " - ",
  testControl.controlsTree.age.control.defaultValue.value,
  testControl.controlsTree.age.control.state.value
)

testControl.controlsTree.tags.control.state.value = ["a", "b", "c"]

for (const a of testControl.controlsTree.tags) {
  a.control.state.value = a.control.state.value?.toUpperCase()
}

const secondTag = testControl.controlsTree.tags[1]
if (secondTag) {
  secondTag.control.state.value += "anana"
}

console.log(testControl.controlsTree.tags.control.state.value)
