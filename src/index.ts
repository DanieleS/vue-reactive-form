import { ref, type Ref } from "@vue/reactivity"
import type { Object } from "ts-toolbelt"
import { cloneDeep, get } from "lodash-es"
import type { FormControl, FormNode, InputControl } from "./types"
import { getInputControl } from "./inputControl"
import type { PartialOrPrimitive } from "./types/utils"

const createControlsTree = <TState>(
  formState: Ref<TState>,
  defaultFormState: Ref<TState>,
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

      if (!Reflect.get(target, handlerPath)) {
        Reflect.set(
          target,
          handlerPath,
          buildProxyControl(
            formState,
            defaultFormState,
            controlsCache,
            fullPath
          )
        )
      }

      return Reflect.get(target, handlerPath)
    }
  })

  const buildProxyControl = (
    formState: Ref<TState>,
    defaultFormState: Ref<TState>,
    controlsCache: Map<string, InputControl<unknown>>,
    path: (string | number | symbol)[]
  ) => {
    return new Proxy(
      {
        control: getInputControl(
          formState,
          defaultFormState,
          controlsCache,
          path
        )
      },
      buildProxyHandler(path)
    )
  }

  return new Proxy<FormNode<TState>>(
    {} as FormNode<TState>,
    buildProxyHandler()
  )
}

export const useFormControl = <TState>(
  defaultState?: PartialOrPrimitive<TState>
): FormControl<TState> => {
  type WrappedState = { inner: TState }

  const defaultFormState = ref({
    inner: cloneDeep(defaultState)
  }) as Ref<WrappedState>
  const state = ref({ inner: cloneDeep(defaultState) }) as Ref<WrappedState>
  const controlsCache = new Map<string, InputControl<unknown>>()

  const controlsTree = createControlsTree<WrappedState>(
    state,
    defaultFormState,
    controlsCache
  )

  return {
    controlsTree: controlsTree.inner
  }
}
