import type { Ref } from "@vue/reactivity"
import type { FormNode, InputControl } from "./types"
import { get } from "lodash-es"
import { getInputControl } from "./inputControl"

export const createControlsTree = <TState>(
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
