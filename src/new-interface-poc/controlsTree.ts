import type { Ref } from "@vue/reactivity"
import type { Object } from "ts-toolbelt"
import type { FormNode, InputControl } from "./types"
import { get } from "lodash-es"
import { getInputControl } from "./inputControl"

export const createControlsTree = <T extends object>(
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
        control: getInputControl(
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
